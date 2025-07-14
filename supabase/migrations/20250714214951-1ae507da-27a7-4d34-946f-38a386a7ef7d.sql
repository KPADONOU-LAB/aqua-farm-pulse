-- Create tables for fish farm management system

-- Table for cages
CREATE TABLE public.cages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  espece TEXT NOT NULL,
  nombre_poissons INTEGER NOT NULL DEFAULT 0,
  poids_moyen DECIMAL(5,2) DEFAULT 0,
  date_introduction DATE,
  statut TEXT NOT NULL DEFAULT 'vide' CHECK (statut IN ('actif', 'vide', 'maintenance')),
  fcr DECIMAL(3,1) DEFAULT 0,
  croissance TEXT DEFAULT '0%',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for feeding sessions
CREATE TABLE public.feeding_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cage_id UUID NOT NULL REFERENCES public.cages(id) ON DELETE CASCADE,
  date_alimentation DATE NOT NULL DEFAULT CURRENT_DATE,
  heure TIME NOT NULL,
  quantite DECIMAL(6,2) NOT NULL,
  type_aliment TEXT NOT NULL,
  appetit TEXT NOT NULL CHECK (appetit IN ('excellent', 'bon', 'moyen', 'faible')),
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for water quality measurements
CREATE TABLE public.water_quality (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cage_id UUID NOT NULL REFERENCES public.cages(id) ON DELETE CASCADE,
  date_mesure DATE NOT NULL DEFAULT CURRENT_DATE,
  heure TIME NOT NULL,
  temperature DECIMAL(4,1) NOT NULL,
  ph DECIMAL(3,1) NOT NULL,
  oxygene_dissous DECIMAL(4,1) NOT NULL,
  turbidite INTEGER,
  statut TEXT NOT NULL DEFAULT 'optimal' CHECK (statut IN ('optimal', 'attention', 'critique')),
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for health observations
CREATE TABLE public.health_observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cage_id UUID NOT NULL REFERENCES public.cages(id) ON DELETE CASCADE,
  date_observation DATE NOT NULL DEFAULT CURRENT_DATE,
  mortalite INTEGER NOT NULL DEFAULT 0,
  cause_presumee TEXT,
  traitements TEXT[], -- Array of treatments
  statut TEXT NOT NULL DEFAULT 'normal' CHECK (statut IN ('normal', 'surveillance', 'alerte')),
  observations TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for inventory management
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  categorie TEXT NOT NULL CHECK (categorie IN ('aliment', 'veterinaire', 'materiel')),
  stock_actuel DECIMAL(8,2) NOT NULL DEFAULT 0,
  unite TEXT NOT NULL,
  stock_min DECIMAL(8,2) NOT NULL,
  prix_unitaire DECIMAL(8,2) NOT NULL,
  fournisseur TEXT,
  date_expiration DATE,
  statut TEXT NOT NULL DEFAULT 'normal' CHECK (statut IN ('normal', 'faible', 'critique')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for sales tracking
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cage_id UUID NOT NULL REFERENCES public.cages(id) ON DELETE CASCADE,
  date_vente DATE NOT NULL DEFAULT CURRENT_DATE,
  quantite_kg DECIMAL(8,2) NOT NULL,
  prix_par_kg DECIMAL(6,2) NOT NULL,
  prix_total DECIMAL(10,2) NOT NULL,
  client TEXT NOT NULL,
  type_vente TEXT NOT NULL CHECK (type_vente IN ('gros', 'detail', 'restaurant', 'marche')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.cages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_quality ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cages
CREATE POLICY "Users can view their own cages" 
ON public.cages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cages" 
ON public.cages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cages" 
ON public.cages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cages" 
ON public.cages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for feeding_sessions
CREATE POLICY "Users can view their own feeding sessions" 
ON public.feeding_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feeding sessions" 
ON public.feeding_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feeding sessions" 
ON public.feeding_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feeding sessions" 
ON public.feeding_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for water_quality
CREATE POLICY "Users can view their own water quality measurements" 
ON public.water_quality 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own water quality measurements" 
ON public.water_quality 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own water quality measurements" 
ON public.water_quality 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own water quality measurements" 
ON public.water_quality 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for health_observations
CREATE POLICY "Users can view their own health observations" 
ON public.health_observations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health observations" 
ON public.health_observations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health observations" 
ON public.health_observations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health observations" 
ON public.health_observations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for inventory
CREATE POLICY "Users can view their own inventory" 
ON public.inventory 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory" 
ON public.inventory 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" 
ON public.inventory 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory" 
ON public.inventory 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for sales
CREATE POLICY "Users can view their own sales" 
ON public.sales 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sales" 
ON public.sales 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales" 
ON public.sales 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales" 
ON public.sales 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_cages_updated_at
BEFORE UPDATE ON public.cages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feeding_sessions_updated_at
BEFORE UPDATE ON public.feeding_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_water_quality_updated_at
BEFORE UPDATE ON public.water_quality
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_observations_updated_at
BEFORE UPDATE ON public.health_observations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
BEFORE UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
BEFORE UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_cages_user_id ON public.cages(user_id);
CREATE INDEX idx_cages_statut ON public.cages(statut);
CREATE INDEX idx_feeding_sessions_user_id ON public.feeding_sessions(user_id);
CREATE INDEX idx_feeding_sessions_cage_id ON public.feeding_sessions(cage_id);
CREATE INDEX idx_feeding_sessions_date ON public.feeding_sessions(date_alimentation);
CREATE INDEX idx_water_quality_user_id ON public.water_quality(user_id);
CREATE INDEX idx_water_quality_cage_id ON public.water_quality(cage_id);
CREATE INDEX idx_water_quality_date ON public.water_quality(date_mesure);
CREATE INDEX idx_health_observations_user_id ON public.health_observations(user_id);
CREATE INDEX idx_health_observations_cage_id ON public.health_observations(cage_id);
CREATE INDEX idx_health_observations_date ON public.health_observations(date_observation);
CREATE INDEX idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX idx_inventory_categorie ON public.inventory(categorie);
CREATE INDEX idx_inventory_statut ON public.inventory(statut);
CREATE INDEX idx_sales_user_id ON public.sales(user_id);
CREATE INDEX idx_sales_cage_id ON public.sales(cage_id);
CREATE INDEX idx_sales_date ON public.sales(date_vente);