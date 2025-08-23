-- Corriger les données malformées dans custom_dashboards
UPDATE custom_dashboards 
SET configuration = CASE 
  WHEN configuration IS NULL THEN '[]'::jsonb
  WHEN jsonb_typeof(configuration) = 'string' THEN configuration::text::jsonb
  ELSE configuration
END
WHERE jsonb_typeof(configuration) = 'string' OR configuration IS NULL;

-- Nettoyer toutes les valeurs NULL dans les champs JSON
UPDATE smart_alerts SET donnees_contexte = '{}' WHERE donnees_contexte IS NULL;
UPDATE dashboard_widgets SET configuration = '{}' WHERE configuration IS NULL;
UPDATE production_predictions SET parametres_calcul = '{}' WHERE parametres_calcul IS NULL;
UPDATE analytics_predictions SET parametres_entree = '{}' WHERE parametres_entree IS NULL;
UPDATE notifications SET data_contexte = '{}' WHERE data_contexte IS NULL;
UPDATE fish_lots SET historique_traitements = '{}' WHERE historique_traitements IS NULL;
UPDATE fish_lots SET historique_alimentation = '{}' WHERE historique_alimentation IS NULL;
UPDATE sync_queue SET data_payload = '{}' WHERE data_payload IS NULL;

-- Définir des valeurs par défaut
ALTER TABLE smart_alerts ALTER COLUMN donnees_contexte SET DEFAULT '{}';
ALTER TABLE dashboard_widgets ALTER COLUMN configuration SET DEFAULT '{}';
ALTER TABLE production_predictions ALTER COLUMN parametres_calcul SET DEFAULT '{}';
ALTER TABLE analytics_predictions ALTER COLUMN parametres_entree SET DEFAULT '{}';
ALTER TABLE notifications ALTER COLUMN data_contexte SET DEFAULT '{}';
ALTER TABLE custom_dashboards ALTER COLUMN configuration SET DEFAULT '[]';
ALTER TABLE fish_lots ALTER COLUMN historique_traitements SET DEFAULT '{}';
ALTER TABLE fish_lots ALTER COLUMN historique_alimentation SET DEFAULT '{}';
ALTER TABLE sync_queue ALTER COLUMN data_payload SET DEFAULT '{}';