-- Créer une table pour les configurations de tableaux de bord personnalisés
CREATE TABLE public.custom_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nom_dashboard TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '[]'::jsonb,
  est_par_defaut BOOLEAN DEFAULT false,
  ordre_affichage INTEGER DEFAULT 0,
  description TEXT,
  icone TEXT DEFAULT 'layout-dashboard',
  couleur TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.custom_dashboards ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Users can manage their own dashboards" 
ON public.custom_dashboards 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Créer une table pour les widgets partagés/prédéfinis
CREATE TABLE public.dashboard_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  nom_widget TEXT NOT NULL,
  type_widget TEXT NOT NULL, -- 'metric', 'chart', 'table', 'alert', 'progress'
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  est_public BOOLEAN DEFAULT false,
  categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  icone TEXT,
  taille_defaut TEXT DEFAULT 'medium', -- 'small', 'medium', 'large', 'xl'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS pour les widgets
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour les widgets
CREATE POLICY "Users can manage their own widgets" 
ON public.dashboard_widgets 
FOR ALL 
USING (auth.uid() = user_id OR est_public = true)
WITH CHECK (auth.uid() = user_id);

-- Créer les triggers pour les timestamps
CREATE TRIGGER update_custom_dashboards_updated_at
BEFORE UPDATE ON public.custom_dashboards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at
BEFORE UPDATE ON public.dashboard_widgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insérer quelques widgets prédéfinis
INSERT INTO public.dashboard_widgets (nom_widget, type_widget, configuration, est_public, categories, description, icone, taille_defaut) VALUES
(
  'Vue d''ensemble des cages',
  'metric',
  '{
    "source": "cages",
    "metric": "count",
    "title": "Cages actives",
    "icon": "fish",
    "color": "#3b82f6",
    "filters": {"statut": "en_production"}
  }'::jsonb,
  true,
  ARRAY['production', 'overview'],
  'Nombre total de cages en production',
  'fish',
  'small'
),
(
  'FCR moyen',
  'metric',
  '{
    "source": "cages",
    "metric": "average",
    "field": "fcr",
    "title": "FCR Moyen",
    "icon": "trending-up",
    "color": "#10b981",
    "format": "decimal",
    "precision": 2
  }'::jsonb,
  true,
  ARRAY['performance', 'metrics'],
  'Ratio de conversion alimentaire moyen',
  'trending-up',
  'small'
),
(
  'Évolution de la croissance',
  'chart',
  '{
    "source": "weekly_weighings",
    "chartType": "line",
    "title": "Croissance hebdomadaire",
    "xField": "date_pesee",
    "yField": "poids_moyen_echantillon",
    "groupBy": "cage_id",
    "timeframe": "last_30_days"
  }'::jsonb,
  true,
  ARRAY['growth', 'charts'],
  'Graphique de l''évolution du poids moyen',
  'line-chart',
  'large'
),
(
  'Alertes récentes',
  'table',
  '{
    "source": "smart_alerts",
    "title": "Alertes intelligentes",
    "columns": ["titre", "niveau_criticite", "created_at"],
    "limit": 5,
    "orderBy": "created_at",
    "orderDirection": "desc",
    "filters": {"statut": "active"}
  }'::jsonb,
  true,
  ARRAY['alerts', 'monitoring'],
  'Liste des alertes intelligentes récentes',
  'alert-triangle',
  'medium'
),
(
  'Prochaines récoltes',
  'progress',
  '{
    "source": "production_predictions",
    "title": "Prochaines récoltes",
    "metric": "jours_recolte",
    "maxValue": 180,
    "showPercentage": true,
    "color": "#f59e0b"
  }'::jsonb,
  true,
  ARRAY['harvest', 'planning'],
  'Progression vers les prochaines récoltes',
  'calendar-clock',
  'medium'
);

-- Créer un dashboard par défaut pour les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.create_default_dashboard_for_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer un dashboard par défaut avec les widgets essentiels
  INSERT INTO public.custom_dashboards (
    user_id, 
    nom_dashboard, 
    configuration, 
    est_par_defaut,
    description
  ) VALUES (
    NEW.user_id,
    'Tableau de bord principal',
    '[
      {
        "id": "widget-1",
        "widgetId": "' || (SELECT id FROM dashboard_widgets WHERE nom_widget = 'Vue d''ensemble des cages' AND est_public = true LIMIT 1) || '",
        "position": {"x": 0, "y": 0, "w": 3, "h": 2}
      },
      {
        "id": "widget-2", 
        "widgetId": "' || (SELECT id FROM dashboard_widgets WHERE nom_widget = 'FCR moyen' AND est_public = true LIMIT 1) || '",
        "position": {"x": 3, "y": 0, "w": 3, "h": 2}
      },
      {
        "id": "widget-3",
        "widgetId": "' || (SELECT id FROM dashboard_widgets WHERE nom_widget = 'Évolution de la croissance' AND est_public = true LIMIT 1) || '",
        "position": {"x": 0, "y": 2, "w": 6, "h": 4}
      },
      {
        "id": "widget-4",
        "widgetId": "' || (SELECT id FROM dashboard_widgets WHERE nom_widget = 'Alertes récentes' AND est_public = true LIMIT 1) || '",
        "position": {"x": 6, "y": 0, "w": 6, "h": 3}
      }
    ]'::jsonb,
    true,
    'Dashboard par défaut avec les métriques essentielles'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour créer un dashboard par défaut
CREATE TRIGGER create_default_dashboard_trigger
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_default_dashboard_for_user();