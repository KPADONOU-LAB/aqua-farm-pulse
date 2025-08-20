-- Modifier la fonction trigger pour éviter les doublons
CREATE OR REPLACE FUNCTION public.create_default_farm_admin()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create admin role for the farm owner only if it doesn't exist
  INSERT INTO public.user_roles (user_id, farm_owner_id, role)
  VALUES (NEW.user_id, NEW.user_id, 'admin')
  ON CONFLICT (user_id, farm_owner_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;