-- Fix security definer functions to have proper search path
CREATE OR REPLACE FUNCTION public.create_default_farm_admin()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  -- Create admin role for the farm owner
  INSERT INTO public.user_roles (user_id, farm_owner_id, role)
  VALUES (NEW.user_id, NEW.user_id, 'admin');
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_farm_settings_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;