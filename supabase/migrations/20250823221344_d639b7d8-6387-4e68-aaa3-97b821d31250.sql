-- Nettoyer et valider tous les champs JSON/JSONB de la base de données

-- Mettre à jour les valeurs NULL vers des objets JSON vides
UPDATE smart_alerts SET donnees_contexte = '{}' WHERE donnees_contexte IS NULL;
UPDATE dashboard_widgets SET configuration = '{}' WHERE configuration IS NULL;
UPDATE production_predictions SET parametres_calcul = '{}' WHERE parametres_calcul IS NULL;
UPDATE analytics_predictions SET parametres_entree = '{}' WHERE parametres_entree IS NULL;
UPDATE notifications SET data_contexte = '{}' WHERE data_contexte IS NULL;
UPDATE custom_dashboards SET configuration = '[]' WHERE configuration IS NULL;
UPDATE fish_lots SET historique_traitements = '{}' WHERE historique_traitements IS NULL;
UPDATE fish_lots SET historique_alimentation = '{}' WHERE historique_alimentation IS NULL;
UPDATE sync_queue SET data_payload = '{}' WHERE data_payload IS NULL;

-- Définir des valeurs par défaut pour éviter les valeurs NULL futures
ALTER TABLE smart_alerts ALTER COLUMN donnees_contexte SET DEFAULT '{}';
ALTER TABLE dashboard_widgets ALTER COLUMN configuration SET DEFAULT '{}';
ALTER TABLE production_predictions ALTER COLUMN parametres_calcul SET DEFAULT '{}';
ALTER TABLE analytics_predictions ALTER COLUMN parametres_entree SET DEFAULT '{}';
ALTER TABLE notifications ALTER COLUMN data_contexte SET DEFAULT '{}';
ALTER TABLE custom_dashboards ALTER COLUMN configuration SET DEFAULT '[]';
ALTER TABLE fish_lots ALTER COLUMN historique_traitements SET DEFAULT '{}';
ALTER TABLE fish_lots ALTER COLUMN historique_alimentation SET DEFAULT '{}';
ALTER TABLE sync_queue ALTER COLUMN data_payload SET DEFAULT '{}';

-- Ajouter des contraintes pour valider que les JSON sont bien formés
ALTER TABLE smart_alerts ADD CONSTRAINT valid_donnees_contexte_json CHECK (jsonb_typeof(donnees_contexte) IN ('object', 'array'));
ALTER TABLE dashboard_widgets ADD CONSTRAINT valid_configuration_json CHECK (jsonb_typeof(configuration) IN ('object', 'array'));
ALTER TABLE production_predictions ADD CONSTRAINT valid_parametres_calcul_json CHECK (jsonb_typeof(parametres_calcul) IN ('object', 'array'));
ALTER TABLE analytics_predictions ADD CONSTRAINT valid_parametres_entree_json CHECK (jsonb_typeof(parametres_entree) IN ('object', 'array'));
ALTER TABLE notifications ADD CONSTRAINT valid_data_contexte_json CHECK (jsonb_typeof(data_contexte) IN ('object', 'array'));
ALTER TABLE custom_dashboards ADD CONSTRAINT valid_dashboard_configuration_json CHECK (jsonb_typeof(configuration) IN ('object', 'array'));
ALTER TABLE fish_lots ADD CONSTRAINT valid_historique_traitements_json CHECK (historique_traitements IS NULL OR jsonb_typeof(historique_traitements) IN ('object', 'array'));
ALTER TABLE fish_lots ADD CONSTRAINT valid_historique_alimentation_json CHECK (historique_alimentation IS NULL OR jsonb_typeof(historique_alimentation) IN ('object', 'array'));
ALTER TABLE sync_queue ADD CONSTRAINT valid_data_payload_json CHECK (jsonb_typeof(data_payload) IN ('object', 'array'));