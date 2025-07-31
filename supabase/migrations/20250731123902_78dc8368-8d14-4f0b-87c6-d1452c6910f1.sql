-- Fonction pour l'historique d'alimentation des cages avec FCR automatique
CREATE OR REPLACE FUNCTION public.get_cage_feeding_history(cage_id_param uuid, period_type text DEFAULT 'week')
RETURNS TABLE(
  periode text,
  date_debut date,
  date_fin date,
  quantite_totale numeric,
  nombre_sessions integer,
  quantite_moyenne numeric,
  fcr_calcule numeric,
  poids_debut numeric,
  poids_fin numeric,
  gain_poids numeric
)
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
      CASE 
        WHEN ww.biomasse_totale IS NOT NULL AND LAG(ww.biomasse_totale) OVER (ORDER BY fs.date_alimentation) IS NOT NULL THEN
          COALESCE(SUM(fs.quantite), 0) / NULLIF((ww.biomasse_totale - LAG(ww.biomasse_totale) OVER (ORDER BY fs.date_alimentation)), 0)
        ELSE 0
      END as fcr_calcule,
      LAG(ww.biomasse_totale) OVER (ORDER BY fs.date_alimentation) as poids_debut,
      ww.biomasse_totale as poids_fin,
      ww.biomasse_totale - COALESCE(LAG(ww.biomasse_totale) OVER (ORDER BY fs.date_alimentation), 0) as gain_poids
    FROM feeding_sessions fs
    LEFT JOIN weekly_weighings ww ON ww.cage_id = fs.cage_id 
      AND ww.date_pesee = fs.date_alimentation
    WHERE fs.cage_id = cage_id_param
    GROUP BY fs.date_alimentation, ww.biomasse_totale
    ORDER BY fs.date_alimentation DESC;
    
  ELSIF period_type = 'week' THEN
    RETURN QUERY
    SELECT 
      CONCAT('Semaine ', EXTRACT(week FROM fs.date_alimentation)::text, ' - ', EXTRACT(year FROM fs.date_alimentation)::text) as periode,
      DATE_TRUNC('week', fs.date_alimentation)::date as date_debut,
      (DATE_TRUNC('week', fs.date_alimentation) + INTERVAL '6 days')::date as date_fin,
      COALESCE(SUM(fs.quantite), 0) as quantite_totale,
      COUNT(fs.id)::integer as nombre_sessions,
      COALESCE(AVG(fs.quantite), 0) as quantite_moyenne,
      CASE 
        WHEN MAX(ww.biomasse_totale) IS NOT NULL AND MIN(ww.biomasse_totale) IS NOT NULL THEN
          COALESCE(SUM(fs.quantite), 0) / NULLIF((MAX(ww.biomasse_totale) - MIN(ww.biomasse_totale)), 0)
        ELSE public.calculate_cage_fcr(cage_id_param)
      END as fcr_calcule,
      MIN(ww.biomasse_totale) as poids_debut,
      MAX(ww.biomasse_totale) as poids_fin,
      MAX(ww.biomasse_totale) - COALESCE(MIN(ww.biomasse_totale), 0) as gain_poids
    FROM feeding_sessions fs
    LEFT JOIN weekly_weighings ww ON ww.cage_id = fs.cage_id 
      AND DATE_TRUNC('week', ww.date_pesee) = DATE_TRUNC('week', fs.date_alimentation)
    WHERE fs.cage_id = cage_id_param
    GROUP BY DATE_TRUNC('week', fs.date_alimentation)
    ORDER BY DATE_TRUNC('week', fs.date_alimentation) DESC;
    
  ELSIF period_type = 'month' THEN
    RETURN QUERY
    SELECT 
      TO_CHAR(fs.date_alimentation, 'Month YYYY') as periode,
      DATE_TRUNC('month', fs.date_alimentation)::date as date_debut,
      (DATE_TRUNC('month', fs.date_alimentation) + INTERVAL '1 month' - INTERVAL '1 day')::date as date_fin,
      COALESCE(SUM(fs.quantite), 0) as quantite_totale,
      COUNT(fs.id)::integer as nombre_sessions,
      COALESCE(AVG(fs.quantite), 0) as quantite_moyenne,
      CASE 
        WHEN MAX(ww.biomasse_totale) IS NOT NULL AND MIN(ww.biomasse_totale) IS NOT NULL THEN
          COALESCE(SUM(fs.quantite), 0) / NULLIF((MAX(ww.biomasse_totale) - MIN(ww.biomasse_totale)), 0)
        ELSE public.calculate_cage_fcr(cage_id_param)
      END as fcr_calcule,
      MIN(ww.biomasse_totale) as poids_debut,
      MAX(ww.biomasse_totale) as poids_fin,
      MAX(ww.biomasse_totale) - COALESCE(MIN(ww.biomasse_totale), 0) as gain_poids
    FROM feeding_sessions fs
    LEFT JOIN weekly_weighings ww ON ww.cage_id = fs.cage_id 
      AND DATE_TRUNC('month', ww.date_pesee) = DATE_TRUNC('month', fs.date_alimentation)
    WHERE fs.cage_id = cage_id_param
    GROUP BY DATE_TRUNC('month', fs.date_alimentation)
    ORDER BY DATE_TRUNC('month', fs.date_alimentation) DESC;
  END IF;
END;
$function$