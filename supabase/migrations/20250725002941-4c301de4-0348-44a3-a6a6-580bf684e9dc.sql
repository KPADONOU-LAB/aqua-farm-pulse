-- Corriger les fonctions restantes avec search_path sécurisé

-- Fonction pour calculer le taux de mortalité
CREATE OR REPLACE FUNCTION public.calculate_cage_mortality_rate(cage_id_param uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  total_mortality integer := 0;
  initial_fish_count integer := 0;
  current_fish_count integer := 0;
  mortality_rate numeric := 0;
BEGIN
  -- Récupérer le nombre actuel de poissons
  SELECT nombre_poissons INTO current_fish_count
  FROM cages WHERE id = cage_id_param;
  
  -- Calculer la mortalité totale depuis le début
  SELECT COALESCE(SUM(mortalite), 0) INTO total_mortality
  FROM health_observations 
  WHERE cage_id = cage_id_param;
  
  -- Estimer le nombre initial de poissons
  initial_fish_count := current_fish_count + total_mortality;
  
  -- Calculer le taux de mortalité
  IF initial_fish_count > 0 THEN
    mortality_rate := (total_mortality::numeric / initial_fish_count::numeric) * 100;
  END IF;
  
  RETURN mortality_rate;
END;
$$;

-- Fonction pour mettre à jour les métriques de cage
CREATE OR REPLACE FUNCTION public.update_cage_metrics()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Calculer et mettre à jour toutes les métriques
  PERFORM public.calculate_cage_fcr(COALESCE(NEW.cage_id, OLD.cage_id));
  PERFORM public.calculate_cage_growth_rate(COALESCE(NEW.cage_id, OLD.cage_id));
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fonction pour mettre à jour le nombre de poissons restant
CREATE OR REPLACE FUNCTION public.update_remaining_fish()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  cage_id_to_update uuid;
  remaining_count integer;
BEGIN
  -- Déterminer l'ID de la cage à mettre à jour
  IF TG_TABLE_NAME = 'health_observations' THEN
    cage_id_to_update := COALESCE(NEW.cage_id, OLD.cage_id);
  ELSIF TG_TABLE_NAME = 'sales' THEN
    cage_id_to_update := COALESCE(NEW.cage_id, OLD.cage_id);
  END IF;
  
  -- Calculer le nombre de poissons restant
  SELECT public.calculate_remaining_fish(cage_id_to_update) INTO remaining_count;
  
  -- Mettre à jour la cage avec le nouveau nombre
  UPDATE cages 
  SET nombre_poissons = remaining_count,
      updated_at = now()
  WHERE id = cage_id_to_update;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fonction pour calculer les plans d'alimentation
CREATE OR REPLACE FUNCTION public.calculate_feeding_plan(cage_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  current_biomass numeric := 0;
  feeding_percentage numeric := 3.0;
  daily_quantity numeric := 0;
  plan_record record;
BEGIN
  -- Récupérer la biomasse actuelle de la cage
  SELECT (nombre_poissons * COALESCE(poids_moyen, 0)) INTO current_biomass
  FROM cages WHERE id = cage_id_param;
  
  -- Récupérer le plan d'alimentation actif
  SELECT * INTO plan_record
  FROM feeding_plans
  WHERE cage_id = cage_id_param AND statut = 'actif'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF plan_record IS NOT NULL THEN
    feeding_percentage := plan_record.pourcentage_poids_corporel;
  END IF;
  
  -- Calculer la quantité journalière
  daily_quantity := (current_biomass * feeding_percentage) / 100;
  
  -- Mettre à jour ou créer le plan
  INSERT INTO feeding_plans (user_id, cage_id, poids_corporel_total, quantite_prevue_jour, pourcentage_poids_corporel)
  SELECT user_id, cage_id_param, current_biomass, daily_quantity, feeding_percentage
  FROM cages WHERE id = cage_id_param
  ON CONFLICT (cage_id) DO UPDATE SET
    poids_corporel_total = current_biomass,
    quantite_prevue_jour = daily_quantity,
    updated_at = now();
END;
$$;

-- Fonction pour générer des alertes automatiques
CREATE OR REPLACE FUNCTION public.generate_automatic_alerts()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Alerte stock faible
  INSERT INTO public.alerts (user_id, type_alerte, priorite, titre, message, source_id)
  SELECT DISTINCT 
    user_id,
    'stock_faible',
    'haute',
    'Stock faible: ' || nom,
    'Le stock de ' || nom || ' est en dessous du minimum (' || stock_actuel || '/' || stock_min || ')',
    id
  FROM inventory
  WHERE stock_actuel <= stock_min
    AND NOT EXISTS (
      SELECT 1 FROM alerts a 
      WHERE a.source_id = inventory.id 
        AND a.type_alerte = 'stock_faible' 
        AND a.date_alerte > now() - interval '1 day'
    );
  
  -- Alerte produits expirés
  INSERT INTO public.alerts (user_id, type_alerte, priorite, titre, message, source_id)
  SELECT DISTINCT 
    user_id,
    'produit_expire',
    'critique',
    'Produit expiré: ' || nom,
    'Le produit ' || nom || ' a expiré le ' || date_expiration,
    id
  FROM inventory
  WHERE date_expiration <= CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM alerts a 
      WHERE a.source_id = inventory.id 
        AND a.type_alerte = 'produit_expire' 
        AND a.date_alerte > now() - interval '1 day'
    );
END;
$$;