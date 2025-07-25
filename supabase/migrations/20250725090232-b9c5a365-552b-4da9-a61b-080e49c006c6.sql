-- Optimisation complète du système d'alertes et de calculs
-- Suppression des fonctions redondantes et création de versions consolidées

-- 1. Supprimer les anciennes fonctions redondantes
DROP FUNCTION IF EXISTS public.generate_feeding_notifications();
DROP FUNCTION IF EXISTS public.generate_automatic_alerts();
DROP FUNCTION IF EXISTS public.generate_smart_alerts();

-- 2. Créer une fonction d'alertes intelligente consolidée
CREATE OR REPLACE FUNCTION public.generate_intelligent_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  cage_record RECORD;
  cost_per_kg NUMERIC;
  mortality_rate NUMERIC;
BEGIN
  -- Parcourir toutes les cages en production
  FOR cage_record IN 
    SELECT * FROM cages WHERE statut = 'en_production'
  LOOP
    -- Calculer les métriques une seule fois
    cost_per_kg := public.calculate_cost_per_kg(cage_record.id);
    mortality_rate := public.calculate_cage_mortality_rate(cage_record.id);
    
    -- ALERTES CRITIQUES
    
    -- Alerte mortalité élevée (critique)
    IF mortality_rate > 10 THEN
      INSERT INTO smart_alerts (user_id, cage_id, type_alerte, niveau_criticite, titre, message, recommandations, impact_estime)
      VALUES (
        cage_record.user_id, cage_record.id, 'mortalite', 'error',
        'Mortalité critique détectée',
        'Taux de mortalité de ' || ROUND(mortality_rate, 1) || '% pour la cage ' || cage_record.nom,
        ARRAY['Isoler les poissons malades', 'Analyser la qualité de l''eau', 'Consulter un vétérinaire'],
        (mortality_rate - 10) * cage_record.nombre_poissons * cage_record.poids_moyen
      )
      ON CONFLICT (user_id, cage_id, type_alerte) DO UPDATE SET
        message = EXCLUDED.message,
        impact_estime = EXCLUDED.impact_estime,
        updated_at = now();
    END IF;
    
    -- Alerte coût élevé (erreur)
    IF cost_per_kg > 4.0 THEN
      INSERT INTO smart_alerts (user_id, cage_id, type_alerte, niveau_criticite, titre, message, recommandations, impact_estime)
      VALUES (
        cage_record.user_id, cage_record.id, 'cout', 'error',
        'Coût de production critique',
        'Coût par kg de ' || ROUND(cost_per_kg, 2) || '€ dépasse le seuil rentable pour ' || cage_record.nom,
        ARRAY['Optimiser l''alimentation', 'Réduire les coûts annexes', 'Accélérer la croissance'],
        (cost_per_kg - 4.0) * cage_record.nombre_poissons * cage_record.poids_moyen
      )
      ON CONFLICT (user_id, cage_id, type_alerte) DO UPDATE SET
        message = EXCLUDED.message,
        impact_estime = EXCLUDED.impact_estime,
        updated_at = now();
    END IF;
    
    -- ALERTES D'AVERTISSEMENT
    
    -- Alerte FCR élevé (avertissement)
    IF COALESCE(cage_record.fcr, 0) > 2.2 THEN
      INSERT INTO smart_alerts (user_id, cage_id, type_alerte, niveau_criticite, titre, message, recommandations)
      VALUES (
        cage_record.user_id, cage_record.id, 'performance', 'warning',
        'FCR élevé détecté',
        'FCR de ' || COALESCE(cage_record.fcr, 0) || ' supérieur à l''objectif de 2.0 pour ' || cage_record.nom,
        ARRAY['Réduire la quantité d''aliment de 10%', 'Vérifier la qualité de l''eau', 'Contrôler la mortalité']
      )
      ON CONFLICT (user_id, cage_id, type_alerte) DO UPDATE SET
        message = EXCLUDED.message,
        updated_at = now();
    END IF;
    
    -- Alerte nourrissage manquant (haute priorité)
    IF NOT EXISTS (
      SELECT 1 FROM feeding_sessions fs 
      WHERE fs.cage_id = cage_record.id 
        AND fs.date_alimentation >= CURRENT_DATE - INTERVAL '1 day'
    ) THEN
      INSERT INTO smart_alerts (user_id, cage_id, type_alerte, niveau_criticite, titre, message, recommandations)
      VALUES (
        cage_record.user_id, cage_record.id, 'alimentation', 'warning',
        'Nourrissage manquant',
        'Aucun nourrissage enregistré pour ' || cage_record.nom || ' depuis plus de 24h',
        ARRAY['Programmer un nourrissage immédiat', 'Vérifier la santé des poissons', 'Ajuster le plan d''alimentation']
      )
      ON CONFLICT (user_id, cage_id, type_alerte) DO UPDATE SET
        message = EXCLUDED.message,
        updated_at = now();
    END IF;
    
    -- ALERTES INFORMATIVES
    
    -- Alerte récolte recommandée (info)
    IF COALESCE(cage_record.poids_moyen, 0) >= 0.8 THEN
      INSERT INTO smart_alerts (user_id, cage_id, type_alerte, niveau_criticite, titre, message, recommandations)
      VALUES (
        cage_record.user_id, cage_record.id, 'recolte', 'info',
        'Récolte recommandée',
        'Cage ' || cage_record.nom || ' a atteint le poids optimal (' || cage_record.poids_moyen || 'kg)',
        ARRAY['Planifier la récolte dans les 7 jours', 'Préparer les équipements', 'Contacter les acheteurs']
      )
      ON CONFLICT (user_id, cage_id, type_alerte) DO UPDATE SET
        message = EXCLUDED.message,
        updated_at = now();
    END IF;
  END LOOP;
  
  -- ALERTES GÉNÉRALES (inventaire)
  
  -- Stock faible
  INSERT INTO smart_alerts (user_id, type_alerte, niveau_criticite, titre, message, recommandations, donnees_contexte)
  SELECT DISTINCT 
    user_id, 'stock_faible', 'warning',
    'Stock faible: ' || nom,
    'Stock de ' || nom || ' en dessous du minimum (' || stock_actuel || '/' || stock_min || ')',
    ARRAY['Commander immédiatement', 'Vérifier les fournisseurs', 'Ajuster les seuils de stock'],
    jsonb_build_object('product_id', id, 'stock_actuel', stock_actuel, 'stock_min', stock_min)
  FROM inventory
  WHERE stock_actuel <= stock_min
    AND NOT EXISTS (
      SELECT 1 FROM smart_alerts sa 
      WHERE sa.donnees_contexte->>'product_id' = inventory.id::text
        AND sa.type_alerte = 'stock_faible' 
        AND sa.date_detection > now() - interval '1 day'
    );
  
  -- Produits expirés
  INSERT INTO smart_alerts (user_id, type_alerte, niveau_criticite, titre, message, recommandations, donnees_contexte)
  SELECT DISTINCT 
    user_id, 'produit_expire', 'error',
    'Produit expiré: ' || nom,
    'Produit ' || nom || ' expiré le ' || date_expiration,
    ARRAY['Retirer du stock immédiatement', 'Vérifier les autres produits', 'Mettre à jour l''inventaire'],
    jsonb_build_object('product_id', id, 'date_expiration', date_expiration)
  FROM inventory
  WHERE date_expiration <= CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM smart_alerts sa 
      WHERE sa.donnees_contexte->>'product_id' = inventory.id::text
        AND sa.type_alerte = 'produit_expire' 
        AND sa.date_detection > now() - interval '1 day'
    );
END;
$$;

-- 3. Créer une fonction de calcul de métriques unifiée
CREATE OR REPLACE FUNCTION public.update_all_cage_metrics(cage_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  fcr_result NUMERIC := 0;
  growth_rate NUMERIC := 0;
  mortality_rate NUMERIC := 0;
  cost_per_kg NUMERIC := 0;
  remaining_fish INTEGER := 0;
  metrics_result jsonb;
BEGIN
  -- Calculer toutes les métriques en une seule fois
  
  -- FCR
  SELECT public.calculate_cage_fcr(cage_id_param) INTO fcr_result;
  
  -- Taux de croissance
  SELECT public.calculate_cage_growth_rate(cage_id_param) INTO growth_rate;
  
  -- Taux de mortalité
  SELECT public.calculate_cage_mortality_rate(cage_id_param) INTO mortality_rate;
  
  -- Coût par kg
  SELECT public.calculate_cost_per_kg(cage_id_param) INTO cost_per_kg;
  
  -- Poissons restants
  SELECT public.calculate_remaining_fish(cage_id_param) INTO remaining_fish;
  
  -- Mettre à jour la cage avec toutes les métriques
  UPDATE cages SET
    fcr = fcr_result,
    taux_mortalite = mortality_rate,
    nombre_poissons = remaining_fish,
    croissance = ROUND(growth_rate, 2)::text || '%',
    updated_at = now()
  WHERE id = cage_id_param;
  
  -- Construire le résultat JSON
  metrics_result := jsonb_build_object(
    'cage_id', cage_id_param,
    'fcr', fcr_result,
    'growth_rate', growth_rate,
    'mortality_rate', mortality_rate,
    'cost_per_kg', cost_per_kg,
    'remaining_fish', remaining_fish,
    'updated_at', now()
  );
  
  RETURN metrics_result;
END;
$$;

-- 4. Remplacer le trigger de mise à jour des métriques par une version optimisée
DROP TRIGGER IF EXISTS update_cage_metrics_trigger ON feeding_sessions;
DROP TRIGGER IF EXISTS update_cage_metrics_trigger ON health_observations;
DROP TRIGGER IF EXISTS update_cage_metrics_trigger ON sales;
DROP TRIGGER IF EXISTS update_remaining_fish_trigger ON health_observations;
DROP TRIGGER IF EXISTS update_remaining_fish_trigger ON sales;

-- Nouveau trigger unifié et optimisé
CREATE OR REPLACE FUNCTION public.optimized_cage_update_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_cage_id uuid;
BEGIN
  -- Déterminer l'ID de la cage concernée
  target_cage_id := COALESCE(NEW.cage_id, OLD.cage_id);
  
  -- Mettre à jour toutes les métriques en une seule fois
  PERFORM public.update_all_cage_metrics(target_cage_id);
  
  -- Générer des alertes intelligentes pour cette cage si nécessaire
  PERFORM public.generate_intelligent_alerts();
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Appliquer le trigger optimisé aux tables pertinentes
CREATE TRIGGER optimized_cage_update_feeding
  AFTER INSERT OR UPDATE OR DELETE ON feeding_sessions
  FOR EACH ROW EXECUTE FUNCTION public.optimized_cage_update_trigger();

CREATE TRIGGER optimized_cage_update_health
  AFTER INSERT OR UPDATE OR DELETE ON health_observations
  FOR EACH ROW EXECUTE FUNCTION public.optimized_cage_update_trigger();

CREATE TRIGGER optimized_cage_update_sales
  AFTER INSERT OR UPDATE OR DELETE ON sales
  FOR EACH ROW EXECUTE FUNCTION public.optimized_cage_update_trigger();

CREATE TRIGGER optimized_cage_update_weighings
  AFTER INSERT OR UPDATE ON weekly_weighings
  FOR EACH ROW EXECUTE FUNCTION public.optimized_cage_update_trigger();

-- 5. Créer une fonction de maintenance automatique
CREATE OR REPLACE FUNCTION public.daily_maintenance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Mettre à jour toutes les métriques des cages en production
  PERFORM public.update_all_cage_metrics(id) 
  FROM cages 
  WHERE statut = 'en_production';
  
  -- Générer toutes les alertes intelligentes
  PERFORM public.generate_intelligent_alerts();
  
  -- Nettoyer les alertes anciennes et résolues
  UPDATE smart_alerts 
  SET statut = 'archived' 
  WHERE statut = 'resolved' 
    AND date_resolution < now() - interval '7 days';
  
  -- Générer les prédictions de production
  PERFORM public.generate_production_predictions(id)
  FROM cages 
  WHERE statut = 'en_production';
END;
$$;