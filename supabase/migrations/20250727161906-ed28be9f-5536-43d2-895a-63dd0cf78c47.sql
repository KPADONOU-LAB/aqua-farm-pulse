-- Create farm configuration table
CREATE TABLE IF NOT EXISTS public.farm_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  currency TEXT NOT NULL DEFAULT 'eur' CHECK (currency IN ('fcfa', 'eur', 'usd')),
  basin_types TEXT[] NOT NULL DEFAULT '{}',
  fish_species TEXT[] NOT NULL DEFAULT '{}',
  is_configured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.farm_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own farm settings" 
ON public.farm_settings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create user roles table for role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, farm_owner_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user roles
CREATE POLICY "Users can view roles in their farm" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = farm_owner_id);

CREATE POLICY "Farm owners can manage roles" 
ON public.user_roles 
FOR ALL 
USING (auth.uid() = farm_owner_id)
WITH CHECK (auth.uid() = farm_owner_id);

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.farm_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.farm_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for invitations
CREATE POLICY "Farm owners can manage invitations" 
ON public.farm_invitations 
FOR ALL 
USING (auth.uid() = farm_owner_id)
WITH CHECK (auth.uid() = farm_owner_id);

-- Create function to set default admin role for farm owner
CREATE OR REPLACE FUNCTION public.create_default_farm_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Create admin role for the farm owner
  INSERT INTO public.user_roles (user_id, farm_owner_id, role)
  VALUES (NEW.user_id, NEW.user_id, 'admin');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic admin role creation
CREATE TRIGGER create_farm_admin_role
  AFTER INSERT ON public.farm_settings
  FOR EACH ROW EXECUTE FUNCTION public.create_default_farm_admin();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_farm_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_farm_settings_updated_at
  BEFORE UPDATE ON public.farm_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_farm_settings_updated_at();