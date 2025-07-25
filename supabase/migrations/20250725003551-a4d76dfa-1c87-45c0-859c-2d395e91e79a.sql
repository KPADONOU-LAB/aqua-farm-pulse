-- Créer des données de test pour démontrer l'application

-- Insérer des cages de test (seulement si aucune cage n'existe)
INSERT INTO cages (user_id, nom, espece, nombre_poissons, poids_moyen, statut, date_introduction, fcr, taux_mortalite, nombre_poissons_initial, notes)
SELECT 
  '00000000-0000-0000-0000-000000000000', -- ID d'exemple, sera remplacé par l'ID réel de l'utilisateur
  cage.nom,
  cage.espece,
  cage.nombre_poissons,
  cage.poids_moyen,
  cage.statut,
  cage.date_introduction,
  cage.fcr,
  cage.taux_mortalite,
  cage.nombre_poissons_initial,
  cage.notes
FROM (VALUES
  ('Cage Alpha', 'Tilapia', 1200, 0.4, 'en_production', '2024-11-01'::date, 1.8, 3.2, 1250, 'Performance excellente'),
  ('Cage Beta', 'Carpe', 900, 0.6, 'en_production', '2024-10-15'::date, 2.1, 5.8, 950, 'FCR à surveiller'),
  ('Cage Gamma', 'Truite', 800, 0.3, 'en_production', '2024-12-01'::date, 1.5, 2.1, 820, 'Jeunes poissons en croissance'),
  ('Cage Delta', 'Bar', 600, 0.8, 'en_production', '2024-09-20'::date, 2.8, 12.5, 700, 'Mortalité élevée - action requise')
) AS cage(nom, espece, nombre_poissons, poids_moyen, statut, date_introduction, fcr, taux_mortalite, nombre_poissons_initial, notes)
WHERE NOT EXISTS (SELECT 1 FROM cages LIMIT 1);

-- Créer un dashboard widget public par défaut
INSERT INTO dashboard_widgets (nom_widget, type_widget, configuration, est_public, description, categories, icone, taille_defaut)
VALUES 
  ('Vue d''ensemble des cages', 'overview', '{"type": "cage_overview"}', true, 'Vue d''ensemble des cages en production', ARRAY['production'], 'database', 'large'),
  ('FCR moyen', 'metric', '{"type": "fcr_average"}', true, 'FCR moyen de toutes les cages', ARRAY['performance'], 'trending-up', 'medium'),
  ('Évolution de la croissance', 'chart', '{"type": "growth_chart"}', true, 'Graphique d''évolution de la croissance', ARRAY['performance'], 'line-chart', 'large'),
  ('Alertes récentes', 'alerts', '{"type": "recent_alerts"}', true, 'Alertes et notifications récentes', ARRAY['monitoring'], 'alert-triangle', 'medium')
ON CONFLICT (nom_widget) DO NOTHING;