-- Fix security warnings: set search_path for all functions
CREATE OR REPLACE FUNCTION public.calculate_cage_fcr(cage_id_param uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  total_food numeric := 0;
  total_weight_gain numeric := 0;
  initial_weight numeric := 0;
  current_weight numeric := 0;
  fish_count integer := 0;
  fcr_result numeric := 0;
BEGIN
  -- Récupérer les informations de base de la cage
  SELECT nombre_poissons, poids_moyen INTO fish_count, current_weight
  FROM cages WHERE id = cage_id_param;
  
  -- Calculer la nourriture totale donnée
  SELECT COALESCE(SUM(quantite), 0) INTO total_food
  FROM feeding_sessions 
  WHERE cage_id = cage_id_param;
  
  -- Récupérer le poids initial (première observation ou poids de la cage)
  SELECT COALESCE(
    (SELECT (current_weight * fish_count) 
     FROM health_observations 
     WHERE cage_id = cage_id_param 
     ORDER BY date_observation ASC 
     LIMIT 1), 
    (current_weight * fish_count * 0.5) -- estimation si pas d'historique
  ) INTO initial_weight;
  
  -- Calculer le gain de poids total
  total_weight_gain := (current_weight * fish_count) - initial_weight;
  
  -- Calculer le FCR
  IF total_weight_gain > 0 THEN
    fcr_result := total_food / total_weight_gain;
  END IF;
  
  -- Mettre à jour la cage
  UPDATE cages SET fcr = fcr_result WHERE id = cage_id_param;
  
  RETURN fcr_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_cage_growth_rate(cage_id_param uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  initial_weight numeric := 0;
  current_weight numeric := 0;
  days_count integer := 0;
  growth_rate numeric := 0;
  introduction_date date;
BEGIN
  -- Récupérer les informations de la cage
  SELECT poids_moyen, date_introduction INTO current_weight, introduction_date
  FROM cages WHERE id = cage_id_param;
  
  -- Calculer le nombre de jours depuis l'introduction
  days_count := CURRENT_DATE - introduction_date;
  
  -- Récupérer le poids initial estimé
  SELECT COALESCE(
    (SELECT poids_moyen 
     FROM health_observations ho
     JOIN cages c ON ho.cage_id = c.id
     WHERE ho.cage_id = cage_id_param 
     ORDER BY ho.date_observation ASC 
     LIMIT 1), 
    (current_weight * 0.3) -- estimation si pas d'historique
  ) INTO initial_weight;
  
  -- Calculer le taux de croissance journalier
  IF days_count > 0 AND initial_weight > 0 THEN
    growth_rate := ((current_weight - initial_weight) / initial_weight * 100) / days_count;
  END IF;
  
  -- Mettre à jour la cage
  UPDATE cages SET croissance = ROUND(growth_rate, 2)::text || '%' WHERE id = cage_id_param;
  
  RETURN growth_rate;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_cost_per_kg(cage_id_param uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
  SELECT COALESCE(SUM(fs.quantite * 1.2), 0) INTO total_costs
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
$function$;