-- Corriger les dernières fonctions avec search_path sécurisé

-- Fonction pour gérer les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Fonction pour l'historique des cages
CREATE OR REPLACE FUNCTION public.log_cage_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Si c'est une mise à jour
  IF TG_OP = 'UPDATE' THEN
    -- Vérifier chaque champ pour les changements
    IF OLD.nom != NEW.nom THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.user_id, 'nom', OLD.nom, NEW.nom, 'update');
    END IF;
    
    IF OLD.espece != NEW.espece THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.user_id, 'espece', OLD.espece, NEW.espece, 'update');
    END IF;
    
    IF OLD.nombre_poissons != NEW.nombre_poissons THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.user_id, 'nombre_poissons', OLD.nombre_poissons::text, NEW.nombre_poissons::text, 'update');
    END IF;
    
    IF OLD.poids_moyen != NEW.poids_moyen THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.user_id, 'poids_moyen', OLD.poids_moyen::text, NEW.poids_moyen::text, 'update');
    END IF;
    
    IF OLD.statut != NEW.statut THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.user_id, 'statut', OLD.statut, NEW.statut, 'update');
    END IF;
    
    IF (OLD.date_introduction IS NULL AND NEW.date_introduction IS NOT NULL) OR 
       (OLD.date_introduction IS NOT NULL AND NEW.date_introduction IS NULL) OR
       (OLD.date_introduction != NEW.date_introduction) THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.user_id, 'date_introduction', OLD.date_introduction::text, NEW.date_introduction::text, 'update');
    END IF;
    
    IF COALESCE(OLD.fcr, 0) != COALESCE(NEW.fcr, 0) THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.user_id, 'fcr', COALESCE(OLD.fcr, 0)::text, COALESCE(NEW.fcr, 0)::text, 'update');
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Si c'est une création
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
    VALUES (NEW.id, NEW.user_id, 'creation', NULL, 'Cage créée', 'create');
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Fonction pour l'historique des ventes
CREATE OR REPLACE FUNCTION public.log_cage_sale()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Enregistrer la vente dans l'historique de la cage
  INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
  VALUES (
    NEW.cage_id, 
    NEW.user_id, 
    'vente', 
    NULL, 
    CONCAT(
      'Vente: ', NEW.quantite_kg, 'kg pour €', NEW.prix_total, 
      ' - Client: ', NEW.client, 
      ' - Type: ', NEW.type_vente
    ), 
    'sale'
  );
  
  RETURN NEW;
END;
$$;

-- Fonction pour calculer la rentabilité des cycles
CREATE OR REPLACE FUNCTION public.calculate_cycle_profitability(cycle_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  total_costs DECIMAL(10,2) := 0;
  total_revenue DECIMAL(10,2) := 0;
  profitability DECIMAL(5,2) := 0;
BEGIN
  -- Calculer les coûts totaux du cycle
  SELECT COALESCE(SUM(montant), 0) INTO total_costs
  FROM financial_data fd
  JOIN production_cycles pc ON fd.cage_id = pc.cage_id
  WHERE pc.id = cycle_id
    AND fd.type_transaction = 'expense'
    AND fd.date_transaction BETWEEN pc.date_debut AND COALESCE(pc.date_fin_reelle, pc.date_fin_prevue);
  
  -- Calculer les revenus totaux du cycle
  SELECT COALESCE(SUM(montant), 0) INTO total_revenue
  FROM financial_data fd
  JOIN production_cycles pc ON fd.cage_id = pc.cage_id
  WHERE pc.id = cycle_id
    AND fd.type_transaction = 'income'
    AND fd.date_transaction BETWEEN pc.date_debut AND COALESCE(pc.date_fin_reelle, pc.date_fin_prevue);
  
  -- Calculer la rentabilité
  IF total_costs > 0 THEN
    profitability := ((total_revenue - total_costs) / total_costs) * 100;
  END IF;
  
  -- Mettre à jour le cycle avec les valeurs calculées
  UPDATE production_cycles 
  SET cout_total = total_costs,
      revenu_total = total_revenue,
      marge_beneficiaire = profitability
  WHERE id = cycle_id;
  
  RETURN profitability;
END;
$$;

-- Fonction pour créer un dashboard par défaut
CREATE OR REPLACE FUNCTION public.create_default_dashboard_for_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Créer un dashboard par défaut avec les widgets essentiels
  INSERT INTO public.custom_dashboards (
    user_id, 
    nom_dashboard, 
    configuration, 
    est_par_defaut,
    description
  ) VALUES (
    NEW.user_id,
    'Tableau de bord principal',
    '[
      {
        "id": "widget-1",
        "widgetId": "' || (SELECT id FROM dashboard_widgets WHERE nom_widget = 'Vue d''ensemble des cages' AND est_public = true LIMIT 1) || '",
        "position": {"x": 0, "y": 0, "w": 3, "h": 2}
      },
      {
        "id": "widget-2", 
        "widgetId": "' || (SELECT id FROM dashboard_widgets WHERE nom_widget = 'FCR moyen' AND est_public = true LIMIT 1) || '",
        "position": {"x": 3, "y": 0, "w": 3, "h": 2}
      },
      {
        "id": "widget-3",
        "widgetId": "' || (SELECT id FROM dashboard_widgets WHERE nom_widget = 'Évolution de la croissance' AND est_public = true LIMIT 1) || '",
        "position": {"x": 0, "y": 2, "w": 6, "h": 4}
      },
      {
        "id": "widget-4",
        "widgetId": "' || (SELECT id FROM dashboard_widgets WHERE nom_widget = 'Alertes récentes' AND est_public = true LIMIT 1) || '",
        "position": {"x": 6, "y": 0, "w": 6, "h": 3}
      }
    ]'::jsonb,
    true,
    'Dashboard par défaut avec les métriques essentielles'
  );
  
  RETURN NEW;
END;
$$;

-- Fonction pour l'ajustement automatique d'alimentation
CREATE OR REPLACE FUNCTION public.auto_adjust_feeding_after_weighing()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  current_plan RECORD;
  new_percentage NUMERIC;
  new_quantity NUMERIC;
  biomass_total NUMERIC;
BEGIN
  -- Récupérer le plan d'alimentation actuel
  SELECT * INTO current_plan
  FROM feeding_plans
  WHERE cage_id = NEW.cage_id AND statut = 'actif'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF current_plan IS NOT NULL THEN
    -- Calculer la nouvelle biomasse
    biomass_total := NEW.biomasse_totale;
    
    -- Ajuster le pourcentage selon le poids moyen
    IF NEW.poids_moyen_echantillon < 0.2 THEN
      new_percentage := 5.0; -- Jeunes poissons
    ELSIF NEW.poids_moyen_echantillon < 0.5 THEN
      new_percentage := 3.5;
    ELSIF NEW.poids_moyen_echantillon < 0.8 THEN
      new_percentage := 3.0;
    ELSE
      new_percentage := 2.5; -- Poissons proches de la récolte
    END IF;
    
    new_quantity := (biomass_total * new_percentage) / 100;
    
    -- Enregistrer l'ajustement si significatif (>5% de différence)
    IF ABS(new_quantity - current_plan.quantite_prevue_jour) / current_plan.quantite_prevue_jour > 0.05 THEN
      INSERT INTO feeding_adjustments (
        user_id, cage_id, feeding_plan_id, ancienne_quantite, nouvelle_quantite,
        ancien_pourcentage, nouveau_pourcentage, raison_ajustement,
        biomasse_actuelle, poids_moyen_actuel, notes
      ) VALUES (
        NEW.user_id, NEW.cage_id, current_plan.id,
        current_plan.quantite_prevue_jour, new_quantity,
        current_plan.pourcentage_poids_corporel, new_percentage,
        'pesee_hebdomadaire', biomass_total, NEW.poids_moyen_echantillon,
        'Ajustement automatique suite à pesée hebdomadaire'
      );
      
      -- Mettre à jour le plan d'alimentation
      UPDATE feeding_plans SET
        quantite_prevue_jour = new_quantity,
        pourcentage_poids_corporel = new_percentage,
        poids_corporel_total = biomass_total,
        updated_at = now()
      WHERE id = current_plan.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;