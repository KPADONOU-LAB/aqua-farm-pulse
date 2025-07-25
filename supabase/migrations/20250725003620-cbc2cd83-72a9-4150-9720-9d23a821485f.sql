-- Créer des données de test pour démontrer l'application

-- Créer des widgets dashboard publics par défaut
INSERT INTO dashboard_widgets (nom_widget, type_widget, configuration, est_public, description, categories, icone, taille_defaut)
SELECT * FROM (VALUES
  ('Vue d''ensemble des cages', 'overview', '{"type": "cage_overview"}'::jsonb, true, 'Vue d''ensemble des cages en production', ARRAY['production'], 'database', 'large'),
  ('FCR moyen', 'metric', '{"type": "fcr_average"}'::jsonb, true, 'FCR moyen de toutes les cages', ARRAY['performance'], 'trending-up', 'medium'),
  ('Évolution de la croissance', 'chart', '{"type": "growth_chart"}'::jsonb, true, 'Graphique d''évolution de la croissance', ARRAY['performance'], 'line-chart', 'large'),
  ('Alertes récentes', 'alerts', '{"type": "recent_alerts"}'::jsonb, true, 'Alertes et notifications récentes', ARRAY['monitoring'], 'alert-triangle', 'medium')
) AS widgets(nom_widget, type_widget, configuration, est_public, description, categories, icone, taille_defaut)
WHERE NOT EXISTS (
  SELECT 1 FROM dashboard_widgets WHERE nom_widget = widgets.nom_widget
);