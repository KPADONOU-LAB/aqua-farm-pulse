-- Corriger les fonctions restantes avec search_path sécurisé

-- Fonction pour les notifications d'alimentation
CREATE OR REPLACE FUNCTION public.generate_feeding_notifications()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Notification si nourrissage non enregistré depuis 24h
  INSERT INTO public.notifications (user_id, type_notification, titre, message, priorite, data_contexte)
  SELECT DISTINCT 
    c.user_id,
    'nourrissage_manque',
    'Nourrissage manquant',
    'Aucun nourrissage enregistré pour la cage ' || c.nom || ' depuis plus de 24h',
    'haute',
    jsonb_build_object('cage_id', c.id, 'cage_nom', c.nom)
  FROM cages c
  WHERE c.statut = 'en_production'
    AND NOT EXISTS (
      SELECT 1 FROM feeding_sessions fs 
      WHERE fs.cage_id = c.id 
        AND fs.date_alimentation >= CURRENT_DATE - INTERVAL '1 day'
    )
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = c.user_id
        AND n.type_notification = 'nourrissage_manque'
        AND n.data_contexte->>'cage_id' = c.id::text
        AND n.created_at > now() - interval '1 day'
    );
    
  -- Notification pour taux de mortalité élevé
  INSERT INTO public.notifications (user_id, type_notification, titre, message, priorite, data_contexte)
  SELECT DISTINCT 
    c.user_id,
    'mortalite_elevee',
    'Taux de mortalité élevé',
    'Taux de mortalité anormal détecté pour la cage ' || c.nom || ' (' || COALESCE(c.taux_mortalite, 0) || '%)',
    'critique',
    jsonb_build_object('cage_id', c.id, 'cage_nom', c.nom, 'taux_mortalite', c.taux_mortalite)
  FROM cages c
  WHERE c.statut = 'en_production'
    AND COALESCE(c.taux_mortalite, 0) > 10 -- Seuil de 10%
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = c.user_id
        AND n.type_notification = 'mortalite_elevee'
        AND n.data_contexte->>'cage_id' = c.id::text
        AND n.created_at > now() - interval '1 day'
    );
END;
$$;

-- Fonction pour les prédictions de production
CREATE OR REPLACE FUNCTION public.generate_production_predictions(cage_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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

-- Fonction pour les alertes intelligentes
CREATE OR REPLACE FUNCTION public.generate_smart_alerts()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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