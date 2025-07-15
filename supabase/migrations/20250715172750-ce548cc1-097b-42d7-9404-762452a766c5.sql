-- Fonction pour calculer automatiquement le FCR d'une cage
CREATE OR REPLACE FUNCTION public.calculate_cage_fcr(cage_id_param uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
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
$$;

-- Fonction pour calculer le taux de croissance d'une cage
CREATE OR REPLACE FUNCTION public.calculate_cage_growth_rate(cage_id_param uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
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
$$;

-- Fonction pour calculer le taux de mortalité d'une cage
CREATE OR REPLACE FUNCTION public.calculate_cage_mortality_rate(cage_id_param uuid)
RETURNS numeric
LANGUAGE plpgsql
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

-- Fonction pour générer l'historique journalier d'une cage
CREATE OR REPLACE FUNCTION public.get_cage_daily_history(cage_id_param uuid, date_debut date DEFAULT NULL, date_fin date DEFAULT NULL)
RETURNS TABLE (
  date_activite date,
  alimentation jsonb,
  qualite_eau jsonb,
  sante jsonb,
  ventes jsonb,
  finance jsonb
)
LANGUAGE plpgsql
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

-- Trigger pour mettre à jour automatiquement les métriques quand des données sont modifiées
CREATE OR REPLACE FUNCTION public.update_cage_metrics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Calculer et mettre à jour toutes les métriques
  PERFORM public.calculate_cage_fcr(COALESCE(NEW.cage_id, OLD.cage_id));
  PERFORM public.calculate_cage_growth_rate(COALESCE(NEW.cage_id, OLD.cage_id));
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Créer les triggers pour automatiser les calculs
DROP TRIGGER IF EXISTS update_metrics_on_feeding ON feeding_sessions;
CREATE TRIGGER update_metrics_on_feeding
  AFTER INSERT OR UPDATE OR DELETE ON feeding_sessions
  FOR EACH ROW EXECUTE FUNCTION update_cage_metrics();

DROP TRIGGER IF EXISTS update_metrics_on_health ON health_observations;
CREATE TRIGGER update_metrics_on_health
  AFTER INSERT OR UPDATE OR DELETE ON health_observations
  FOR EACH ROW EXECUTE FUNCTION update_cage_metrics();

DROP TRIGGER IF EXISTS update_metrics_on_sales ON sales;
CREATE TRIGGER update_metrics_on_sales
  AFTER INSERT OR UPDATE OR DELETE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_cage_metrics();

-- Ajouter une colonne pour le taux de mortalité dans la table cages
ALTER TABLE cages ADD COLUMN IF NOT EXISTS taux_mortalite numeric DEFAULT 0;