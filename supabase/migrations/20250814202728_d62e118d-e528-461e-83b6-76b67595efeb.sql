-- Améliorer le trigger de fin de cycle pour enregistrer dans l'historique
CREATE OR REPLACE FUNCTION public.log_cycle_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  cage_record RECORD;
  final_metrics JSONB;
BEGIN
  -- Récupérer les informations de la cage
  SELECT * INTO cage_record FROM cages WHERE id = NEW.cage_id;
  
  -- Si c'est la finalisation d'un cycle (date_fin_reelle vient d'être mise à jour)
  IF OLD.date_fin_reelle IS NULL AND NEW.date_fin_reelle IS NOT NULL THEN
    
    -- Calculer les métriques finales
    SELECT public.update_all_cage_metrics(NEW.cage_id) INTO final_metrics;
    
    -- Enregistrer la fin de cycle dans l'historique
    INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
    VALUES (
      NEW.cage_id, 
      NEW.user_id, 
      'fin_cycle', 
      'Cycle en cours', 
      CONCAT(
        'Cycle terminé - ', 
        'Durée: ', (NEW.date_fin_reelle - NEW.date_debut)::text, ' jours, ',
        'Poissons final: ', COALESCE(NEW.nombre_poissons_final, 0), ', ',
        'Poids final: ', COALESCE(NEW.poids_final_moyen, 0), 'kg'
      ), 
      'end_cycle'
    );
    
    -- Enregistrer les métriques finales
    INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
    VALUES (
      NEW.cage_id, 
      NEW.user_id, 
      'metrics_finales', 
      NULL, 
      CONCAT(
        'FCR: ', COALESCE((final_metrics->>'fcr')::numeric, 0), ', ',
        'Taux survie: ', ROUND(100 - COALESCE((final_metrics->>'mortality_rate')::numeric, 0), 1), '%, ',
        'Coût/kg: ', COALESCE((final_metrics->>'cost_per_kg')::numeric, 0), '€'
      ), 
      'end_cycle'
    );
    
    -- Enregistrer la rentabilité si disponible
    IF NEW.marge_beneficiaire IS NOT NULL THEN
      INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
      VALUES (
        NEW.cage_id, 
        NEW.user_id, 
        'rentabilite', 
        NULL, 
        CONCAT(
          'Marge: ', ROUND(NEW.marge_beneficiaire, 2), '%, ',
          'Coût total: ', COALESCE(NEW.cout_total, 0), '€, ',
          'Revenu total: ', COALESCE(NEW.revenu_total, 0), '€'
        ), 
        'end_cycle'
      );
    END IF;
    
    -- Marquer la cage comme vide pour un nouveau cycle
    UPDATE cages 
    SET statut = 'vide', 
        notes = CONCAT(
          COALESCE(notes, ''), 
          ' [Cycle terminé le ', NEW.date_fin_reelle, ']'
        )
    WHERE id = NEW.cage_id;
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Créer le trigger pour les cycles de production
DROP TRIGGER IF EXISTS log_cycle_completion_trigger ON production_cycles;
CREATE TRIGGER log_cycle_completion_trigger
  AFTER UPDATE ON production_cycles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_cycle_completion();

-- Améliorer le trigger existant pour les ventes
CREATE OR REPLACE FUNCTION public.log_cage_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Enregistrer la vente dans l'historique de la cage avec plus de détails
  INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
  VALUES (
    NEW.cage_id, 
    NEW.user_id, 
    'vente', 
    NULL, 
    CONCAT(
      'Vente: ', NEW.quantite_kg, 'kg à ', NEW.prix_par_kg, '€/kg = ', NEW.prix_total, '€',
      ' - Client: ', NEW.client, 
      ' - Type: ', NEW.type_vente,
      CASE WHEN NEW.notes IS NOT NULL THEN CONCAT(' - Notes: ', NEW.notes) ELSE '' END
    ), 
    'sale'
  );
  
  RETURN NEW;
END;
$function$;