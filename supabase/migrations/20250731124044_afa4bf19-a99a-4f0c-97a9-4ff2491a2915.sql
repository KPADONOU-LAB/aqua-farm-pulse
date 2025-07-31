-- Fonction pour obtenir l'historique des ventes par période  
CREATE OR REPLACE FUNCTION public.get_sales_history_by_period(user_id_param uuid, period_type text DEFAULT 'month', cage_id_param uuid DEFAULT NULL)
RETURNS TABLE(
  periode text,
  date_debut date,
  date_fin date,
  nombre_ventes integer,
  quantite_totale_kg numeric,
  chiffre_affaires numeric,
  prix_moyen_kg numeric,
  clients_distincts integer,
  cage_nom text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF period_type = 'day' THEN
    RETURN QUERY
    SELECT 
      s.date_vente::text as periode,
      s.date_vente as date_debut,
      s.date_vente as date_fin,
      COUNT(s.id)::integer as nombre_ventes,
      COALESCE(SUM(s.quantite_kg), 0) as quantite_totale_kg,
      COALESCE(SUM(s.prix_total), 0) as chiffre_affaires,
      COALESCE(AVG(s.prix_par_kg), 0) as prix_moyen_kg,
      COUNT(DISTINCT s.client)::integer as clients_distincts,
      c.nom as cage_nom
    FROM sales s
    LEFT JOIN cages c ON c.id = s.cage_id
    WHERE s.user_id = user_id_param 
      AND (cage_id_param IS NULL OR s.cage_id = cage_id_param)
    GROUP BY s.date_vente, c.nom
    ORDER BY s.date_vente DESC;
    
  ELSIF period_type = 'week' THEN
    RETURN QUERY
    SELECT 
      CONCAT('Semaine ', EXTRACT(week FROM s.date_vente)::text, ' - ', EXTRACT(year FROM s.date_vente)::text) as periode,
      DATE_TRUNC('week', s.date_vente)::date as date_debut,
      (DATE_TRUNC('week', s.date_vente) + INTERVAL '6 days')::date as date_fin,
      COUNT(s.id)::integer as nombre_ventes,
      COALESCE(SUM(s.quantite_kg), 0) as quantite_totale_kg,
      COALESCE(SUM(s.prix_total), 0) as chiffre_affaires,
      COALESCE(AVG(s.prix_par_kg), 0) as prix_moyen_kg,
      COUNT(DISTINCT s.client)::integer as clients_distincts,
      CASE WHEN cage_id_param IS NOT NULL THEN c.nom ELSE 'Toutes les cages' END as cage_nom
    FROM sales s
    LEFT JOIN cages c ON c.id = s.cage_id
    WHERE s.user_id = user_id_param 
      AND (cage_id_param IS NULL OR s.cage_id = cage_id_param)
    GROUP BY DATE_TRUNC('week', s.date_vente), c.nom
    ORDER BY DATE_TRUNC('week', s.date_vente) DESC;
    
  ELSIF period_type = 'month' THEN
    RETURN QUERY
    SELECT 
      TO_CHAR(s.date_vente, 'Month YYYY') as periode,
      DATE_TRUNC('month', s.date_vente)::date as date_debut,
      (DATE_TRUNC('month', s.date_vente) + INTERVAL '1 month' - INTERVAL '1 day')::date as date_fin,
      COUNT(s.id)::integer as nombre_ventes,
      COALESCE(SUM(s.quantite_kg), 0) as quantite_totale_kg,
      COALESCE(SUM(s.prix_total), 0) as chiffre_affaires,
      COALESCE(AVG(s.prix_par_kg), 0) as prix_moyen_kg,
      COUNT(DISTINCT s.client)::integer as clients_distincts,
      CASE WHEN cage_id_param IS NOT NULL THEN c.nom ELSE 'Toutes les cages' END as cage_nom
    FROM sales s
    LEFT JOIN cages c ON c.id = s.cage_id
    WHERE s.user_id = user_id_param 
      AND (cage_id_param IS NULL OR s.cage_id = cage_id_param)
    GROUP BY DATE_TRUNC('month', s.date_vente), c.nom
    ORDER BY DATE_TRUNC('month', s.date_vente) DESC;
  END IF;
END;
$function$