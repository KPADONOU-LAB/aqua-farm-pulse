-- Fix the get_cage_feeding_history function to resolve GROUP BY error
DROP FUNCTION IF EXISTS public.get_cage_feeding_history(uuid, text);

CREATE OR REPLACE FUNCTION public.get_cage_feeding_history(cage_id_param uuid, period_type text DEFAULT 'week'::text)
 RETURNS TABLE(periode text, date_debut date, date_fin date, quantite_totale numeric, nombre_sessions integer, quantite_moyenne numeric, fcr_calcule numeric, poids_debut numeric, poids_fin numeric, gain_poids numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF period_type = 'day' THEN
    RETURN QUERY
    SELECT 
      fs.date_alimentation::text as periode,
      fs.date_alimentation as date_debut,
      fs.date_alimentation as date_fin,
      COALESCE(SUM(fs.quantite), 0) as quantite_totale,
      COUNT(fs.id)::integer as nombre_sessions,
      COALESCE(AVG(fs.quantite), 0) as quantite_moyenne,
      COALESCE(public.calculate_cage_fcr(cage_id_param), 0) as fcr_calcule,
      COALESCE(AVG(COALESCE(c.poids_moyen, 0) * COALESCE(c.nombre_poissons, 0)), 0) as poids_debut,
      COALESCE(AVG(COALESCE(c.poids_moyen, 0) * COALESCE(c.nombre_poissons, 0)), 0) as poids_fin,
      0 as gain_poids
    FROM feeding_sessions fs
    LEFT JOIN cages c ON c.id = fs.cage_id
    WHERE fs.cage_id = cage_id_param
    GROUP BY fs.date_alimentation
    ORDER BY fs.date_alimentation DESC;
    
  ELSIF period_type = 'week' THEN
    RETURN QUERY
    SELECT 
      CONCAT('Semaine ', EXTRACT(week FROM week_start)::text, ' - ', EXTRACT(year FROM week_start)::text) as periode,
      week_start::date as date_debut,
      (week_start + INTERVAL '6 days')::date as date_fin,
      COALESCE(SUM(fs.quantite), 0) as quantite_totale,
      COUNT(fs.id)::integer as nombre_sessions,
      COALESCE(AVG(fs.quantite), 0) as quantite_moyenne,
      COALESCE(public.calculate_cage_fcr(cage_id_param), 0) as fcr_calcule,
      COALESCE(AVG(COALESCE(c.poids_moyen, 0) * COALESCE(c.nombre_poissons, 0)), 0) as poids_debut,
      COALESCE(AVG(COALESCE(c.poids_moyen, 0) * COALESCE(c.nombre_poissons, 0)), 0) as poids_fin,
      0 as gain_poids
    FROM (
      SELECT DATE_TRUNC('week', fs.date_alimentation) as week_start,
             fs.quantite,
             fs.id
      FROM feeding_sessions fs
      WHERE fs.cage_id = cage_id_param
    ) fs
    LEFT JOIN cages c ON c.id = cage_id_param
    GROUP BY week_start
    ORDER BY week_start DESC;
    
  ELSIF period_type = 'month' THEN
    RETURN QUERY
    SELECT 
      TO_CHAR(month_start, 'Month YYYY') as periode,
      month_start::date as date_debut,
      (month_start + INTERVAL '1 month' - INTERVAL '1 day')::date as date_fin,
      COALESCE(SUM(fs.quantite), 0) as quantite_totale,
      COUNT(fs.id)::integer as nombre_sessions,
      COALESCE(AVG(fs.quantite), 0) as quantite_moyenne,
      COALESCE(public.calculate_cage_fcr(cage_id_param), 0) as fcr_calcule,
      COALESCE(AVG(COALESCE(c.poids_moyen, 0) * COALESCE(c.nombre_poissons, 0)), 0) as poids_debut,
      COALESCE(AVG(COALESCE(c.poids_moyen, 0) * COALESCE(c.nombre_poissons, 0)), 0) as poids_fin,
      0 as gain_poids
    FROM (
      SELECT DATE_TRUNC('month', fs.date_alimentation) as month_start,
             fs.quantite,
             fs.id
      FROM feeding_sessions fs
      WHERE fs.cage_id = cage_id_param
    ) fs
    LEFT JOIN cages c ON c.id = cage_id_param
    GROUP BY month_start
    ORDER BY month_start DESC;
  END IF;
END;
$function$;