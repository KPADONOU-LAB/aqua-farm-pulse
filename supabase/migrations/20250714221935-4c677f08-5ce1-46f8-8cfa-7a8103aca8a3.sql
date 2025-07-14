-- Créer une table pour l'historique des modifications des cages
CREATE TABLE public.cage_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cage_id UUID NOT NULL REFERENCES public.cages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_type TEXT NOT NULL DEFAULT 'update', -- 'create', 'update', 'delete'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.cage_history ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Users can view their own cage history" 
ON public.cage_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cage history" 
ON public.cage_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Créer un index pour améliorer les performances
CREATE INDEX idx_cage_history_cage_id ON public.cage_history(cage_id);
CREATE INDEX idx_cage_history_user_id ON public.cage_history(user_id);
CREATE INDEX idx_cage_history_created_at ON public.cage_history(created_at);

-- Créer une fonction pour enregistrer automatiquement les changements
CREATE OR REPLACE FUNCTION public.log_cage_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est une mise à jour
  IF TG_OP = 'UPDATE' THEN
    -- Vérifier chaque champ pour les changements
    IF OLD.nom != NEW.nom THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.user_id, 'nom', OLD.nom, NEW.nom, 'update');
    END IF;
    
    IF OLD.espece != NEW.espece THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.user_id, 'espece', OLD.espece, NEW.espece, 'update');
    END IF;
    
    IF OLD.nombre_poissons != NEW.nombre_poissons THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.user_id, 'nombre_poissons', OLD.nombre_poissons::text, NEW.nombre_poissons::text, 'update');
    END IF;
    
    IF OLD.poids_moyen != NEW.poids_moyen THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.user_id, 'poids_moyen', OLD.poids_moyen::text, NEW.poids_moyen::text, 'update');
    END IF;
    
    IF OLD.statut != NEW.statut THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.user_id, 'statut', OLD.statut, NEW.statut, 'update');
    END IF;
    
    IF (OLD.date_introduction IS NULL AND NEW.date_introduction IS NOT NULL) OR 
       (OLD.date_introduction IS NOT NULL AND NEW.date_introduction IS NULL) OR
       (OLD.date_introduction != NEW.date_introduction) THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.user_id, 'date_introduction', OLD.date_introduction::text, NEW.date_introduction::text, 'update');
    END IF;
    
    IF COALESCE(OLD.fcr, 0) != COALESCE(NEW.fcr, 0) THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (NEW.id, NEW.user_id, 'fcr', COALESCE(OLD.fcr, 0)::text, COALESCE(NEW.fcr, 0)::text, 'update');
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Si c'est une création
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
    VALUES (NEW.id, NEW.user_id, 'creation', NULL, 'Cage créée', 'create');
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour les cages
CREATE TRIGGER cage_changes_trigger
  AFTER INSERT OR UPDATE ON public.cages
  FOR EACH ROW
  EXECUTE FUNCTION public.log_cage_changes();