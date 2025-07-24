-- Table pour les pesées hebdomadaires (déjà existante mais on s'assure qu'elle est complète)
-- Ajout de fonctions pour les pesées hebdomadaires si nécessaire

-- Table pour les plans d'alimentation automatiques (déjà existante)
-- Assurer que les fonctions de calcul sont en place

-- Table pour les prédictions de production
CREATE TABLE IF NOT EXISTS public.production_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cage_id UUID NOT NULL,
  date_prediction DATE NOT NULL DEFAULT CURRENT_DATE,
  type_prediction TEXT NOT NULL, -- 'poids_final', 'date_recolte', 'biomasse', 'rentabilite'
  valeur_predite NUMERIC NOT NULL,
  horizon_jours INTEGER NOT NULL,
  intervalle_confiance NUMERIC DEFAULT 95,
  parametres_calcul JSONB DEFAULT '{}',
  precision_reelle NUMERIC NULL, -- Sera rempli après vérification
  statut TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour le suivi détaillé des coûts par cage/cycle
CREATE TABLE IF NOT EXISTS public.cost_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cage_id UUID NOT NULL,
  cycle_id UUID NULL,
  date_cout DATE NOT NULL DEFAULT CURRENT_DATE,
  categorie_cout TEXT NOT NULL, -- 'aliments', 'alevins', 'medicaments', 'personnel', 'equipement', 'maintenance', 'transport'
  sous_categorie TEXT NULL,
  montant NUMERIC NOT NULL,
  quantite NUMERIC NULL,
  unite TEXT NULL,
  cout_unitaire NUMERIC NULL,
  description TEXT NULL,
  reference_facture TEXT NULL,
  fournisseur TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les objectifs de performance par cage
CREATE TABLE IF NOT EXISTS public.performance_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cage_id UUID NOT NULL,
  cycle_id UUID NULL,
  fcr_cible NUMERIC NOT NULL DEFAULT 1.8,
  taux_survie_cible NUMERIC NOT NULL DEFAULT 95.0,
  poids_moyen_cible NUMERIC NOT NULL,
  duree_cycle_jours INTEGER NOT NULL DEFAULT 180,
  cout_revient_kg_cible NUMERIC NOT NULL,
  marge_beneficiaire_cible NUMERIC NOT NULL DEFAULT 25.0,
  date_creation DATE NOT NULL DEFAULT CURRENT_DATE,
  statut TEXT NOT NULL DEFAULT 'actif',
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les alertes avancées et recommandations
CREATE TABLE IF NOT EXISTS public.smart_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cage_id UUID NULL,
  type_alerte TEXT NOT NULL, -- 'performance', 'cout', 'sante', 'croissance', 'recolte'
  niveau_criticite TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'critical'
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  recommandations TEXT[] DEFAULT '{}',
  donnees_contexte JSONB DEFAULT '{}',
  date_detection TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_lecture TIMESTAMP WITH TIME ZONE NULL,
  date_resolution TIMESTAMP WITH TIME ZONE NULL,
  statut TEXT NOT NULL DEFAULT 'active', -- 'active', 'read', 'resolved', 'dismissed'
  actions_effectuees TEXT[] DEFAULT '{}',
  impact_estime NUMERIC NULL, -- Impact financier estimé
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour l'historique des ajustements de rations
CREATE TABLE IF NOT EXISTS public.feeding_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cage_id UUID NOT NULL,
  feeding_plan_id UUID NOT NULL,
  date_ajustement DATE NOT NULL DEFAULT CURRENT_DATE,
  ancienne_quantite NUMERIC NOT NULL,
  nouvelle_quantite NUMERIC NOT NULL,
  ancien_pourcentage NUMERIC NOT NULL,
  nouveau_pourcentage NUMERIC NOT NULL,
  raison_ajustement TEXT NOT NULL, -- 'pesee_hebdomadaire', 'changement_appetit', 'conditions_eau', 'manuel'
  biomasse_actuelle NUMERIC NOT NULL,
  poids_moyen_actuel NUMERIC NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.production_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own production predictions" ON public.production_predictions
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cost tracking" ON public.cost_tracking
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own performance targets" ON public.performance_targets
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own smart alerts" ON public.smart_alerts
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own feeding adjustments" ON public.feeding_adjustments
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_production_predictions_updated_at
BEFORE UPDATE ON public.production_predictions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cost_tracking_updated_at
BEFORE UPDATE ON public.cost_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_targets_updated_at
BEFORE UPDATE ON public.performance_targets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smart_alerts_updated_at
BEFORE UPDATE ON public.smart_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour calculer le coût de revient par kg automatiquement
CREATE OR REPLACE FUNCTION public.calculate_cost_per_kg(cage_id_param UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  total_costs NUMERIC := 0;
  total_production_kg NUMERIC := 0;
  cost_per_kg NUMERIC := 0;
  current_biomass NUMERIC := 0;
BEGIN
  -- Calculer les coûts totaux pour cette cage
  SELECT COALESCE(SUM(montant), 0) INTO total_costs
  FROM cost_tracking
  WHERE cage_id = cage_id_param;
  
  -- Ajouter les coûts des aliments depuis feeding_sessions
  SELECT COALESCE(SUM(fs.quantite * 1.2), 0) INTO total_costs -- 1.2€/kg estimation
  FROM feeding_sessions fs
  WHERE fs.cage_id = cage_id_param;
  
  -- Calculer la biomasse actuelle
  SELECT COALESCE(nombre_poissons * poids_moyen, 0) INTO current_biomass
  FROM cages
  WHERE id = cage_id_param;
  
  -- Ajouter les ventes déjà effectuées
  SELECT COALESCE(SUM(quantite_kg), 0) INTO total_production_kg
  FROM sales
  WHERE cage_id = cage_id_param;
  
  total_production_kg := total_production_kg + current_biomass;
  
  -- Calculer le coût par kg
  IF total_production_kg > 0 THEN
    cost_per_kg := total_costs / total_production_kg;
  END IF;
  
  RETURN ROUND(cost_per_kg, 2);
END;
$$;

-- Fonction pour générer des prédictions de production
CREATE OR REPLACE FUNCTION public.generate_production_predictions(cage_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  current_weight NUMERIC;
  current_count INTEGER;
  days_since_start INTEGER;
  daily_growth_rate NUMERIC := 0.02; -- 2% par jour estimation
  target_weight NUMERIC := 0.8; -- 800g objectif
  days_to_harvest INTEGER;
  predicted_biomass NUMERIC;
  cost_per_kg NUMERIC;
  predicted_revenue NUMERIC;
  predicted_profit NUMERIC;
BEGIN
  -- Récupérer les données actuelles de la cage
  SELECT poids_moyen, nombre_poissons, CURRENT_DATE - date_introduction
  INTO current_weight, current_count, days_since_start
  FROM cages WHERE id = cage_id_param;
  
  -- Calculer le taux de croissance journalier réel si possible
  IF days_since_start > 0 AND current_weight > 0 THEN
    daily_growth_rate := POWER(current_weight / 0.05, 1.0/days_since_start) - 1; -- Estimation depuis 50g
  END IF;
  
  -- Prédire le nombre de jours jusqu'à la récolte
  IF current_weight > 0 AND daily_growth_rate > 0 THEN
    days_to_harvest := CEIL(LN(target_weight / current_weight) / LN(1 + daily_growth_rate));
  ELSE
    days_to_harvest := 90; -- Estimation par défaut
  END IF;
  
  -- Calculer la biomasse prédite
  predicted_biomass := current_count * target_weight;
  
  -- Calculer les coûts
  cost_per_kg := public.calculate_cost_per_kg(cage_id_param);
  
  -- Prédire les revenus (prix moyen 6€/kg)
  predicted_revenue := predicted_biomass * 6.0;
  predicted_profit := predicted_revenue - (predicted_biomass * cost_per_kg);
  
  -- Insérer les prédictions
  INSERT INTO production_predictions (user_id, cage_id, type_prediction, valeur_predite, horizon_jours)
  SELECT user_id, cage_id_param, 'jours_recolte', days_to_harvest, days_to_harvest
  FROM cages WHERE id = cage_id_param
  ON CONFLICT (cage_id, type_prediction) DO UPDATE SET
    valeur_predite = days_to_harvest,
    horizon_jours = days_to_harvest,
    updated_at = now();
    
  INSERT INTO production_predictions (user_id, cage_id, type_prediction, valeur_predite, horizon_jours)
  SELECT user_id, cage_id_param, 'biomasse_finale', predicted_biomass, days_to_harvest
  FROM cages WHERE id = cage_id_param
  ON CONFLICT (cage_id, type_prediction) DO UPDATE SET
    valeur_predite = predicted_biomass,
    horizon_jours = days_to_harvest,
    updated_at = now();
    
  INSERT INTO production_predictions (user_id, cage_id, type_prediction, valeur_predite, horizon_jours)
  SELECT user_id, cage_id_param, 'profit_estime', predicted_profit, days_to_harvest
  FROM cages WHERE id = cage_id_param
  ON CONFLICT (cage_id, type_prediction) DO UPDATE SET
    valeur_predite = predicted_profit,
    horizon_jours = days_to_harvest,
    updated_at = now();
END;
$$;

-- Fonction pour générer des alertes intelligentes
CREATE OR REPLACE FUNCTION public.generate_smart_alerts()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  cage_record RECORD;
  performance_deviation NUMERIC;
  cost_per_kg NUMERIC;
  recommended_harvest_weight NUMERIC := 0.8;
BEGIN
  FOR cage_record IN 
    SELECT * FROM cages WHERE statut = 'en_production'
  LOOP
    -- Alerte FCR élevé
    IF COALESCE(cage_record.fcr, 0) > 2.2 THEN
      INSERT INTO smart_alerts (user_id, cage_id, type_alerte, niveau_criticite, titre, message, recommandations)
      VALUES (
        cage_record.user_id,
        cage_record.id,
        'performance',
        'warning',
        'FCR élevé détecté',
        'Le FCR de ' || COALESCE(cage_record.fcr, 0) || ' est supérieur à l''objectif de 2.0 pour la cage ' || cage_record.nom,
        ARRAY['Réduire la quantité d''aliment de 10%', 'Vérifier la qualité de l''eau', 'Contrôler la mortalité']
      )
      ON CONFLICT (user_id, cage_id, type_alerte) DO UPDATE SET
        message = EXCLUDED.message,
        updated_at = now();
    END IF;
    
    -- Alerte poids optimal pour récolte
    IF COALESCE(cage_record.poids_moyen, 0) >= recommended_harvest_weight THEN
      INSERT INTO smart_alerts (user_id, cage_id, type_alerte, niveau_criticite, titre, message, recommandations)
      VALUES (
        cage_record.user_id,
        cage_record.id,
        'recolte',
        'info',
        'Récolte recommandée',
        'La cage ' || cage_record.nom || ' a atteint le poids optimal (' || cage_record.poids_moyen || 'kg). Récolte recommandée.',
        ARRAY['Planifier la récolte dans les 7 jours', 'Préparer les équipements de récolte', 'Contacter les acheteurs']
      )
      ON CONFLICT (user_id, cage_id, type_alerte) DO UPDATE SET
        message = EXCLUDED.message,
        updated_at = now();
    END IF;
    
    -- Alerte coût élevé
    cost_per_kg := public.calculate_cost_per_kg(cage_record.id);
    IF cost_per_kg > 4.0 THEN
      INSERT INTO smart_alerts (user_id, cage_id, type_alerte, niveau_criticite, titre, message, recommandations, impact_estime)
      VALUES (
        cage_record.user_id,
        cage_record.id,
        'cout',
        'error',
        'Coût de production élevé',
        'Le coût par kg (' || cost_per_kg || '€) dépasse le seuil rentable pour la cage ' || cage_record.nom,
        ARRAY['Optimiser l''alimentation', 'Réduire les coûts annexes', 'Accélérer la croissance'],
        (cost_per_kg - 4.0) * cage_record.nombre_poissons * cage_record.poids_moyen
      )
      ON CONFLICT (user_id, cage_id, type_alerte) DO UPDATE SET
        message = EXCLUDED.message,
        impact_estime = EXCLUDED.impact_estime,
        updated_at = now();
    END IF;
  END LOOP;
END;
$$;

-- Fonction pour ajuster automatiquement les rations après pesée
CREATE OR REPLACE FUNCTION public.auto_adjust_feeding_after_weighing()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Trigger pour ajustement automatique après pesée
CREATE TRIGGER auto_adjust_feeding_trigger
AFTER INSERT ON weekly_weighings
FOR EACH ROW
EXECUTE FUNCTION auto_adjust_feeding_after_weighing();

-- Contraintes uniques pour éviter les doublons
ALTER TABLE production_predictions 
ADD CONSTRAINT unique_prediction_per_cage_type 
UNIQUE (cage_id, type_prediction);

ALTER TABLE smart_alerts 
ADD CONSTRAINT unique_alert_per_cage_type 
UNIQUE (user_id, cage_id, type_alerte);

ALTER TABLE performance_targets 
ADD CONSTRAINT unique_target_per_cage 
UNIQUE (cage_id);