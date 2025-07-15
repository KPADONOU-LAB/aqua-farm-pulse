-- Créer une fonction pour calculer le nombre de poissons restant dans une cage
CREATE OR REPLACE FUNCTION public.calculate_remaining_fish(cage_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
AS $function$
DECLARE
  initial_fish_count integer := 0;
  total_mortality integer := 0;
  total_sales_kg numeric := 0;
  average_weight numeric := 0;
  estimated_fish_sold integer := 0;
  remaining_fish integer := 0;
BEGIN
  -- Récupérer le nombre initial de poissons et le poids moyen
  SELECT nombre_poissons, COALESCE(poids_moyen, 0) 
  INTO initial_fish_count, average_weight
  FROM cages WHERE id = cage_id_param;
  
  -- Calculer la mortalité totale depuis le début
  SELECT COALESCE(SUM(mortalite), 0) INTO total_mortality
  FROM health_observations 
  WHERE cage_id = cage_id_param;
  
  -- Calculer les ventes totales en kg
  SELECT COALESCE(SUM(quantite_kg), 0) INTO total_sales_kg
  FROM sales 
  WHERE cage_id = cage_id_param;
  
  -- Estimer le nombre de poissons vendus (si poids moyen > 0)
  IF average_weight > 0 THEN
    estimated_fish_sold := ROUND(total_sales_kg / average_weight);
  ELSE
    estimated_fish_sold := 0;
  END IF;
  
  -- Calculer le nombre de poissons restant
  remaining_fish := initial_fish_count - total_mortality - estimated_fish_sold;
  
  -- S'assurer que le résultat n'est pas négatif
  IF remaining_fish < 0 THEN
    remaining_fish := 0;
  END IF;
  
  RETURN remaining_fish;
END;
$function$;

-- Créer une fonction pour mettre à jour automatiquement le nombre de poissons restant
CREATE OR REPLACE FUNCTION public.update_remaining_fish()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  cage_id_to_update uuid;
  remaining_count integer;
BEGIN
  -- Déterminer l'ID de la cage à mettre à jour
  IF TG_TABLE_NAME = 'health_observations' THEN
    cage_id_to_update := COALESCE(NEW.cage_id, OLD.cage_id);
  ELSIF TG_TABLE_NAME = 'sales' THEN
    cage_id_to_update := COALESCE(NEW.cage_id, OLD.cage_id);
  END IF;
  
  -- Calculer le nombre de poissons restant
  SELECT public.calculate_remaining_fish(cage_id_to_update) INTO remaining_count;
  
  -- Mettre à jour la cage avec le nouveau nombre
  UPDATE cages 
  SET nombre_poissons = remaining_count,
      updated_at = now()
  WHERE id = cage_id_to_update;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Créer les triggers pour mettre à jour automatiquement le nombre de poissons
DROP TRIGGER IF EXISTS update_fish_count_on_health ON health_observations;
CREATE TRIGGER update_fish_count_on_health
  AFTER INSERT OR UPDATE OR DELETE ON health_observations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_remaining_fish();

DROP TRIGGER IF EXISTS update_fish_count_on_sales ON sales;
CREATE TRIGGER update_fish_count_on_sales
  AFTER INSERT OR UPDATE OR DELETE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_remaining_fish();

-- Ajouter une colonne pour stocker le nombre initial de poissons
ALTER TABLE cages ADD COLUMN IF NOT EXISTS nombre_poissons_initial integer DEFAULT 0;

-- Mettre à jour les cages existantes avec le nombre initial
UPDATE cages SET nombre_poissons_initial = nombre_poissons WHERE nombre_poissons_initial = 0;

-- Mettre à jour le nombre de poissons restant pour toutes les cages existantes
DO $$
DECLARE
  cage_record RECORD;
BEGIN
  FOR cage_record IN SELECT id FROM cages LOOP
    UPDATE cages 
    SET nombre_poissons = public.calculate_remaining_fish(cage_record.id)
    WHERE id = cage_record.id;
  END LOOP;
END $$;