-- Fix remaining functions security paths
CREATE OR REPLACE FUNCTION public.calculate_cage_mortality_rate(cage_id_param uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.calculate_remaining_fish(cage_id_param uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  initial_fish_count integer := 0;
  total_mortality integer := 0;
  total_sales_kg numeric := 0;
  average_weight numeric := 0;
  estimated_fish_sold integer := 0;
  remaining_fish integer := 0;
BEGIN
  -- Récupérer le nombre initial de poissons et le poids moyen
  SELECT nombre_poissons, COALESCE(poids_moyen, 0) 
  INTO initial_fish_count, average_weight
  FROM cages WHERE id = cage_id_param;
  
  -- Calculer la mortalité totale depuis le début
  SELECT COALESCE(SUM(mortalite), 0) INTO total_mortality
  FROM health_observations 
  WHERE cage_id = cage_id_param;
  
  -- Calculer les ventes totales en kg
  SELECT COALESCE(SUM(quantite_kg), 0) INTO total_sales_kg
  FROM sales 
  WHERE cage_id = cage_id_param;
  
  -- Estimer le nombre de poissons vendus (si poids moyen > 0)
  IF average_weight > 0 THEN
    estimated_fish_sold := ROUND(total_sales_kg / average_weight);
  ELSE
    estimated_fish_sold := 0;
  END IF;
  
  -- Calculer le nombre de poissons restant
  remaining_fish := initial_fish_count - total_mortality - estimated_fish_sold;
  
  -- S'assurer que le résultat n'est pas négatif
  IF remaining_fish < 0 THEN
    remaining_fish := 0;
  END IF;
  
  RETURN remaining_fish;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_feeding_plan(cage_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;