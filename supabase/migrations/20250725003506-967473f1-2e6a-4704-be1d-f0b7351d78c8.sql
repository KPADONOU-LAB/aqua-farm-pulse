-- Corriger la dernière fonction avec search_path sécurisé

-- Fonction pour l'historique journalier des cages
CREATE OR REPLACE FUNCTION public.get_cage_daily_history(cage_id_param uuid, date_debut date DEFAULT NULL::date, date_fin date DEFAULT NULL::date)
 RETURNS TABLE(date_activite date, alimentation jsonb, qualite_eau jsonb, sante jsonb, ventes jsonb, finance jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Définir les dates par défaut si non fournies
  IF date_debut IS NULL THEN
    date_debut := CURRENT_DATE - INTERVAL '30 days';
  END IF;
  
  IF date_fin IS NULL THEN
    date_fin := CURRENT_DATE;
  END IF;
  
  RETURN QUERY
  WITH date_range AS (
    SELECT generate_series(date_debut, date_fin, '1 day'::interval)::date AS date_activite
  ),
  alimentation_data AS (
    SELECT 
      date_alimentation,
      jsonb_agg(
        jsonb_build_object(
          'heure', heure,
          'quantite', quantite,
          'type_aliment', type_aliment,
          'appetit', appetit,
          'observations', observations
        )
      ) AS data
    FROM feeding_sessions 
    WHERE cage_id = cage_id_param 
      AND date_alimentation BETWEEN date_debut AND date_fin
    GROUP BY date_alimentation
  ),
  qualite_data AS (
    SELECT 
      date_mesure,
      jsonb_agg(
        jsonb_build_object(
          'heure', heure,
          'temperature', temperature,
          'ph', ph,
          'oxygene_dissous', oxygene_dissous,
          'turbidite', turbidite,
          'statut', statut,
          'observations', observations
        )
      ) AS data
    FROM water_quality 
    WHERE cage_id = cage_id_param 
      AND date_mesure BETWEEN date_debut AND date_fin
    GROUP BY date_mesure
  ),
  sante_data AS (
    SELECT 
      date_observation,
      jsonb_agg(
        jsonb_build_object(
          'mortalite', mortalite,
          'statut', statut,
          'observations', observations,
          'cause_presumee', cause_presumee,
          'traitements', traitements
        )
      ) AS data
    FROM health_observations 
    WHERE cage_id = cage_id_param 
      AND date_observation BETWEEN date_debut AND date_fin
    GROUP BY date_observation
  ),
  ventes_data AS (
    SELECT 
      date_vente,
      jsonb_agg(
        jsonb_build_object(
          'quantite_kg', quantite_kg,
          'prix_par_kg', prix_par_kg,
          'prix_total', prix_total,
          'client', client,
          'type_vente', type_vente,
          'notes', notes
        )
      ) AS data
    FROM sales 
    WHERE cage_id = cage_id_param 
      AND date_vente BETWEEN date_debut AND date_fin
    GROUP BY date_vente
  ),
  finance_data AS (
    SELECT 
      date_transaction,
      jsonb_agg(
        jsonb_build_object(
          'type_transaction', type_transaction,
          'categorie', categorie,
          'montant', montant,
          'description', description,
          'reference_document', reference_document
        )
      ) AS data
    FROM financial_data 
    WHERE cage_id = cage_id_param 
      AND date_transaction BETWEEN date_debut AND date_fin
    GROUP BY date_transaction
  )
  SELECT 
    dr.date_activite,
    COALESCE(a.data, '[]'::jsonb) AS alimentation,
    COALESCE(q.data, '[]'::jsonb) AS qualite_eau,
    COALESCE(s.data, '[]'::jsonb) AS sante,
    COALESCE(v.data, '[]'::jsonb) AS ventes,
    COALESCE(f.data, '[]'::jsonb) AS finance
  FROM date_range dr
  LEFT JOIN alimentation_data a ON dr.date_activite = a.date_alimentation
  LEFT JOIN qualite_data q ON dr.date_activite = q.date_mesure
  LEFT JOIN sante_data s ON dr.date_activite = s.date_observation
  LEFT JOIN ventes_data v ON dr.date_activite = v.date_vente
  LEFT JOIN finance_data f ON dr.date_activite = f.date_transaction
  ORDER BY dr.date_activite DESC;
END;
$$;