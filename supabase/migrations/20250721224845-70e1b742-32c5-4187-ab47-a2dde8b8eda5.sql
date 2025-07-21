-- Ajouter les nouvelles tables pour les fonctionnalités manquantes

-- Table pour la planification automatique d'alimentation
CREATE TABLE public.feeding_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  cage_id uuid NOT NULL,
  pourcentage_poids_corporel numeric NOT NULL DEFAULT 3.0,
  frequence_par_jour integer NOT NULL DEFAULT 3,
  poids_corporel_total numeric NOT NULL DEFAULT 0,
  quantite_prevue_jour numeric NOT NULL DEFAULT 0,
  date_debut date NOT NULL DEFAULT CURRENT_DATE,
  date_fin date,
  statut text NOT NULL DEFAULT 'actif',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table pour les pesées hebdomadaires
CREATE TABLE public.weekly_weighings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  cage_id uuid NOT NULL,
  date_pesee date NOT NULL DEFAULT CURRENT_DATE,
  nombre_echantillons integer NOT NULL DEFAULT 10,
  poids_moyen_echantillon numeric NOT NULL,
  poids_estime_total numeric NOT NULL,
  biomasse_totale numeric NOT NULL,
  taux_croissance_semaine numeric DEFAULT 0,
  observations text,
  photos text[], -- URLs des photos
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table pour les notifications
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type_notification text NOT NULL,
  titre text NOT NULL,
  message text NOT NULL,
  priorite text NOT NULL DEFAULT 'normale',
  statut text NOT NULL DEFAULT 'non_lu',
  data_contexte jsonb,
  envoye_push boolean DEFAULT false,
  envoye_email boolean DEFAULT false,
  date_envoi timestamp with time zone,
  date_lu timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table pour la synchronisation offline
CREATE TABLE public.sync_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  table_name text NOT NULL,
  operation text NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  record_id uuid NOT NULL,
  data_payload jsonb NOT NULL,
  device_id text,
  timestamp_local timestamp with time zone NOT NULL,
  synced boolean DEFAULT false,
  sync_attempts integer DEFAULT 0,
  last_sync_attempt timestamp with time zone,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feeding_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_weighings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own feeding plans" 
ON public.feeding_plans FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own weighings" 
ON public.weekly_weighings FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notifications" 
ON public.notifications FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sync queue" 
ON public.sync_queue FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Triggers pour updated_at
CREATE TRIGGER update_feeding_plans_updated_at
  BEFORE UPDATE ON public.feeding_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weekly_weighings_updated_at
  BEFORE UPDATE ON public.weekly_weighings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour calculer la planification automatique d'alimentation
CREATE OR REPLACE FUNCTION public.calculate_feeding_plan(cage_id_param uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  current_biomass numeric := 0;
  feeding_percentage numeric := 3.0;
  daily_quantity numeric := 0;
  plan_record record;
BEGIN
  -- Récupérer la biomasse actuelle de la cage
  SELECT (nombre_poissons * COALESCE(poids_moyen, 0)) INTO current_biomass
  FROM cages WHERE id = cage_id_param;
  
  -- Récupérer le plan d'alimentation actif
  SELECT * INTO plan_record
  FROM feeding_plans
  WHERE cage_id = cage_id_param AND statut = 'actif'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF plan_record IS NOT NULL THEN
    feeding_percentage := plan_record.pourcentage_poids_corporel;
  END IF;
  
  -- Calculer la quantité journalière
  daily_quantity := (current_biomass * feeding_percentage) / 100;
  
  -- Mettre à jour ou créer le plan
  INSERT INTO feeding_plans (user_id, cage_id, poids_corporel_total, quantite_prevue_jour, pourcentage_poids_corporel)
  SELECT user_id, cage_id_param, current_biomass, daily_quantity, feeding_percentage
  FROM cages WHERE id = cage_id_param
  ON CONFLICT (cage_id) DO UPDATE SET
    poids_corporel_total = current_biomass,
    quantite_prevue_jour = daily_quantity,
    updated_at = now();
END;
$function$;

-- Fonction pour générer des notifications automatiques
CREATE OR REPLACE FUNCTION public.generate_feeding_notifications()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Notification si nourrissage non enregistré depuis 24h
  INSERT INTO public.notifications (user_id, type_notification, titre, message, priorite, data_contexte)
  SELECT DISTINCT 
    c.user_id,
    'nourrissage_manque',
    'Nourrissage manquant',
    'Aucun nourrissage enregistré pour la cage ' || c.nom || ' depuis plus de 24h',
    'haute',
    jsonb_build_object('cage_id', c.id, 'cage_nom', c.nom)
  FROM cages c
  WHERE c.statut = 'en_production'
    AND NOT EXISTS (
      SELECT 1 FROM feeding_sessions fs 
      WHERE fs.cage_id = c.id 
        AND fs.date_alimentation >= CURRENT_DATE - INTERVAL '1 day'
    )
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = c.user_id
        AND n.type_notification = 'nourrissage_manque'
        AND n.data_contexte->>'cage_id' = c.id::text
        AND n.created_at > now() - interval '1 day'
    );
    
  -- Notification pour taux de mortalité élevé
  INSERT INTO public.notifications (user_id, type_notification, titre, message, priorite, data_contexte)
  SELECT DISTINCT 
    c.user_id,
    'mortalite_elevee',
    'Taux de mortalité élevé',
    'Taux de mortalité anormal détecté pour la cage ' || c.nom || ' (' || COALESCE(c.taux_mortalite, 0) || '%)',
    'critique',
    jsonb_build_object('cage_id', c.id, 'cage_nom', c.nom, 'taux_mortalite', c.taux_mortalite)
  FROM cages c
  WHERE c.statut = 'en_production'
    AND COALESCE(c.taux_mortalite, 0) > 10 -- Seuil de 10%
    AND NOT EXISTS (
      SELECT 1 FROM notifications n
      WHERE n.user_id = c.user_id
        AND n.type_notification = 'mortalite_elevee'
        AND n.data_contexte->>'cage_id' = c.id::text
        AND n.created_at > now() - interval '1 day'
    );
END;
$function$;