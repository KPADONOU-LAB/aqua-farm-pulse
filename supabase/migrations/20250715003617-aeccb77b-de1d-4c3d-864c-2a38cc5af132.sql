-- Module Comptabilité et Finance
CREATE TABLE public.financial_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cage_id UUID,
  type_transaction TEXT NOT NULL, -- 'income', 'expense', 'investment'
  categorie TEXT NOT NULL, -- 'food', 'medicine', 'equipment', 'labor', 'sales', 'maintenance'
  montant DECIMAL(10,2) NOT NULL,
  description TEXT,
  date_transaction DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_document TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CRM Clients
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nom_entreprise TEXT NOT NULL,
  contact_principal TEXT,
  email TEXT,
  telephone TEXT,
  adresse TEXT,
  type_client TEXT NOT NULL DEFAULT 'standard', -- 'premium', 'standard', 'occasional'
  chiffre_affaires_annuel DECIMAL(12,2) DEFAULT 0,
  derniere_commande DATE,
  notes TEXT,
  statut TEXT NOT NULL DEFAULT 'actif', -- 'actif', 'inactif', 'prospect'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Commandes et Contrats
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL,
  numero_commande TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'en_attente', -- 'en_attente', 'confirmee', 'en_preparation', 'livree', 'annulee'
  date_commande DATE NOT NULL DEFAULT CURRENT_DATE,
  date_livraison_prevue DATE,
  date_livraison_reelle DATE,
  montant_total DECIMAL(10,2) NOT NULL,
  quantite_kg DECIMAL(8,2) NOT NULL,
  prix_kg DECIMAL(6,2) NOT NULL,
  type_poisson TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cycles de Production
CREATE TABLE public.production_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cage_id UUID NOT NULL,
  nom_cycle TEXT NOT NULL,
  date_debut DATE NOT NULL,
  date_fin_prevue DATE NOT NULL,
  date_fin_reelle DATE,
  nombre_poissons_initial INTEGER NOT NULL,
  nombre_poissons_final INTEGER,
  poids_initial_moyen DECIMAL(6,3),
  poids_final_moyen DECIMAL(6,3),
  objectif_croissance DECIMAL(5,2), -- pourcentage
  croissance_reelle DECIMAL(5,2),
  cout_total DECIMAL(10,2) DEFAULT 0,
  revenu_total DECIMAL(10,2) DEFAULT 0,
  marge_beneficiaire DECIMAL(5,2),
  statut TEXT NOT NULL DEFAULT 'planifie', -- 'planifie', 'actif', 'termine', 'abandonne'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Budgets et Prévisions
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nom_budget TEXT NOT NULL,
  periode_debut DATE NOT NULL,
  periode_fin DATE NOT NULL,
  budget_aliments DECIMAL(10,2) DEFAULT 0,
  budget_medicaments DECIMAL(10,2) DEFAULT 0,
  budget_equipements DECIMAL(10,2) DEFAULT 0,
  budget_personnel DECIMAL(10,2) DEFAULT 0,
  budget_maintenance DECIMAL(10,2) DEFAULT 0,
  objectif_chiffre_affaires DECIMAL(12,2) DEFAULT 0,
  objectif_marge DECIMAL(5,2) DEFAULT 0,
  reel_aliments DECIMAL(10,2) DEFAULT 0,
  reel_medicaments DECIMAL(10,2) DEFAULT 0,
  reel_equipements DECIMAL(10,2) DEFAULT 0,
  reel_personnel DECIMAL(10,2) DEFAULT 0,
  reel_maintenance DECIMAL(10,2) DEFAULT 0,
  reel_chiffre_affaires DECIMAL(12,2) DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'actif', -- 'actif', 'cloture', 'archive'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analyses Prédictives et KPIs
CREATE TABLE public.analytics_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cage_id UUID,
  type_prediction TEXT NOT NULL, -- 'growth', 'mortality', 'fcr', 'harvest_date', 'profit'
  valeur_predite DECIMAL(10,3) NOT NULL,
  intervalle_confiance DECIMAL(5,2), -- pourcentage
  date_prediction DATE NOT NULL DEFAULT CURRENT_DATE,
  horizon_jours INTEGER NOT NULL, -- dans combien de jours
  parametres_entree JSONB, -- paramètres utilisés pour la prédiction
  precision_reelle DECIMAL(5,2), -- comparaison avec la réalité après coup
  statut TEXT NOT NULL DEFAULT 'active', -- 'active', 'validee', 'obsolete'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Traçabilité et Lots
CREATE TABLE public.fish_lots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cage_id UUID NOT NULL,
  numero_lot TEXT NOT NULL UNIQUE,
  qr_code TEXT UNIQUE,
  origine TEXT NOT NULL, -- fournisseur d'alevins
  date_introduction DATE NOT NULL,
  nombre_initial INTEGER NOT NULL,
  espece TEXT NOT NULL,
  souche TEXT,
  certifications TEXT[], -- bio, label rouge, etc.
  historique_traitements JSONB,
  historique_alimentation JSONB,
  statut TEXT NOT NULL DEFAULT 'actif', -- 'actif', 'vendu', 'mortalite'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alertes et Notifications
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type_alerte TEXT NOT NULL, -- 'stock_faible', 'mortalite_elevee', 'qualite_eau', 'budget_depasse', 'commande_urgente'
  priorite TEXT NOT NULL DEFAULT 'normale', -- 'faible', 'normale', 'haute', 'critique'
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  cage_id UUID,
  source_id UUID, -- ID de l'entité source de l'alerte
  lu BOOLEAN DEFAULT FALSE,
  date_alerte TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_resolution TIMESTAMP WITH TIME ZONE,
  actions_recommandees TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fish_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own financial data" ON public.financial_data
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own clients" ON public.clients
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own orders" ON public.orders
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own production cycles" ON public.production_cycles
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own budgets" ON public.budgets
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own predictions" ON public.analytics_predictions
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own fish lots" ON public.fish_lots
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own alerts" ON public.alerts
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers pour updated_at
CREATE TRIGGER update_financial_data_updated_at
BEFORE UPDATE ON public.financial_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_production_cycles_updated_at
BEFORE UPDATE ON public.production_cycles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fish_lots_updated_at
BEFORE UPDATE ON public.fish_lots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fonctions avancées pour calculs automatiques
CREATE OR REPLACE FUNCTION calculate_cycle_profitability(cycle_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  total_costs DECIMAL(10,2) := 0;
  total_revenue DECIMAL(10,2) := 0;
  profitability DECIMAL(5,2) := 0;
BEGIN
  -- Calculer les coûts totaux du cycle
  SELECT COALESCE(SUM(montant), 0) INTO total_costs
  FROM financial_data fd
  JOIN production_cycles pc ON fd.cage_id = pc.cage_id
  WHERE pc.id = cycle_id
    AND fd.type_transaction = 'expense'
    AND fd.date_transaction BETWEEN pc.date_debut AND COALESCE(pc.date_fin_reelle, pc.date_fin_prevue);
  
  -- Calculer les revenus totaux du cycle
  SELECT COALESCE(SUM(montant), 0) INTO total_revenue
  FROM financial_data fd
  JOIN production_cycles pc ON fd.cage_id = pc.cage_id
  WHERE pc.id = cycle_id
    AND fd.type_transaction = 'income'
    AND fd.date_transaction BETWEEN pc.date_debut AND COALESCE(pc.date_fin_reelle, pc.date_fin_prevue);
  
  -- Calculer la rentabilité
  IF total_costs > 0 THEN
    profitability := ((total_revenue - total_costs) / total_costs) * 100;
  END IF;
  
  -- Mettre à jour le cycle avec les valeurs calculées
  UPDATE production_cycles 
  SET cout_total = total_costs,
      revenu_total = total_revenue,
      marge_beneficiaire = profitability
  WHERE id = cycle_id;
  
  RETURN profitability;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer des alertes automatiques
CREATE OR REPLACE FUNCTION generate_automatic_alerts()
RETURNS void AS $$
BEGIN
  -- Alerte stock faible
  INSERT INTO public.alerts (user_id, type_alerte, priorite, titre, message, source_id)
  SELECT DISTINCT 
    user_id,
    'stock_faible',
    'haute',
    'Stock faible: ' || nom,
    'Le stock de ' || nom || ' est en dessous du minimum (' || stock_actuel || '/' || stock_min || ')',
    id
  FROM inventory
  WHERE stock_actuel <= stock_min
    AND NOT EXISTS (
      SELECT 1 FROM alerts a 
      WHERE a.source_id = inventory.id 
        AND a.type_alerte = 'stock_faible' 
        AND a.date_alerte > now() - interval '1 day'
    );
  
  -- Alerte produits expirés
  INSERT INTO public.alerts (user_id, type_alerte, priorite, titre, message, source_id)
  SELECT DISTINCT 
    user_id,
    'produit_expire',
    'critique',
    'Produit expiré: ' || nom,
    'Le produit ' || nom || ' a expiré le ' || date_expiration,
    id
  FROM inventory
  WHERE date_expiration <= CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM alerts a 
      WHERE a.source_id = inventory.id 
        AND a.type_alerte = 'produit_expire' 
        AND a.date_alerte > now() - interval '1 day'
    );
END;
$$ LANGUAGE plpgsql;