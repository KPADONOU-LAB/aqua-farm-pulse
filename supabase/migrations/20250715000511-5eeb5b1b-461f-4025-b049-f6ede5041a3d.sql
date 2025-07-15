-- Créer une fonction pour enregistrer les ventes dans l'historique des cages
CREATE OR REPLACE FUNCTION public.log_cage_sale()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Enregistrer la vente dans l'historique de la cage
  INSERT INTO public.cage_history (cage_id, user_id, field_name, old_value, new_value, change_type)
  VALUES (
    NEW.cage_id, 
    NEW.user_id, 
    'vente', 
    NULL, 
    CONCAT(
      'Vente: ', NEW.quantite_kg, 'kg pour €', NEW.prix_total, 
      ' - Client: ', NEW.client, 
      ' - Type: ', NEW.type_vente
    ), 
    'sale'
  );
  
  RETURN NEW;
END;
$function$

-- Créer le trigger pour les ventes
CREATE TRIGGER trigger_log_cage_sale
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.log_cage_sale();