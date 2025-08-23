-- Corriger d'abord les données malformées dans custom_dashboards
UPDATE custom_dashboards 
SET configuration = CASE 
  WHEN configuration IS NULL THEN '[]'::jsonb
  WHEN jsonb_typeof(configuration) = 'string' THEN 
    CASE 
      WHEN configuration::text LIKE '[%' THEN configuration::text::jsonb
      ELSE '[]'::jsonb
    END
  ELSE configuration
END
WHERE NOT (jsonb_typeof(configuration) IN ('object', 'array')) OR configuration IS NULL;

-- Ensuite appliquer les contraintes
ALTER TABLE smart_alerts ADD CONSTRAINT IF NOT EXISTS valid_donnees_contexte_json CHECK (jsonb_typeof(donnees_contexte) IN ('object', 'array'));
ALTER TABLE dashboard_widgets ADD CONSTRAINT IF NOT EXISTS valid_configuration_json CHECK (jsonb_typeof(configuration) IN ('object', 'array'));
ALTER TABLE production_predictions ADD CONSTRAINT IF NOT EXISTS valid_parametres_calcul_json CHECK (jsonb_typeof(parametres_calcul) IN ('object', 'array'));
ALTER TABLE analytics_predictions ADD CONSTRAINT IF NOT EXISTS valid_parametres_entree_json CHECK (jsonb_typeof(parametres_entree) IN ('object', 'array'));
ALTER TABLE notifications ADD CONSTRAINT IF NOT EXISTS valid_data_contexte_json CHECK (jsonb_typeof(data_contexte) IN ('object', 'array'));
ALTER TABLE custom_dashboards ADD CONSTRAINT IF NOT EXISTS valid_dashboard_configuration_json CHECK (jsonb_typeof(configuration) IN ('object', 'array'));
ALTER TABLE fish_lots ADD CONSTRAINT IF NOT EXISTS valid_historique_traitements_json CHECK (historique_traitements IS NULL OR jsonb_typeof(historique_traitements) IN ('object', 'array'));
ALTER TABLE fish_lots ADD CONSTRAINT IF NOT EXISTS valid_historique_alimentation_json CHECK (historique_alimentation IS NULL OR jsonb_typeof(historique_alimentation) IN ('object', 'array'));
ALTER TABLE sync_queue ADD CONSTRAINT IF NOT EXISTS valid_data_payload_json CHECK (jsonb_typeof(data_payload) IN ('object', 'array'));