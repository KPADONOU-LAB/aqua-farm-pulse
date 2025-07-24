import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface CostEntry {
  id: string;
  cage_id: string;
  date_cout: string;
  categorie_cout: string;
  sous_categorie?: string;
  montant: number;
  quantite?: number;
  unite?: string;
  cout_unitaire?: number;
  description?: string;
  reference_facture?: string;
  fournisseur?: string;
  created_at: string;
  cage?: {
    nom: string;
  };
}

interface CostSummary {
  totalCosts: number;
  costPerCategory: { [key: string]: number };
  costPerKg: number;
  avgMonthlyExpense: number;
}

export const useCostTracking = () => {
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [summary, setSummary] = useState<CostSummary>({
    totalCosts: 0,
    costPerCategory: {},
    costPerKg: 0,
    avgMonthlyExpense: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCosts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cost_tracking')
        .select(`
          *,
          cage:cages(nom)
        `)
        .eq('user_id', user.id)
        .order('date_cout', { ascending: false });

      if (error) throw error;
      setCosts(data || []);
      calculateSummary(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des coûts:', error);
      toast.error('Erreur lors du chargement des coûts');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (costsData: CostEntry[]) => {
    const totalCosts = costsData.reduce((sum, cost) => sum + cost.montant, 0);
    
    const costPerCategory = costsData.reduce((acc, cost) => {
      acc[cost.categorie_cout] = (acc[cost.categorie_cout] || 0) + cost.montant;
      return acc;
    }, {} as { [key: string]: number });

    // Calculer la moyenne mensuelle (sur les 3 derniers mois)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentCosts = costsData.filter(cost => 
      new Date(cost.date_cout) >= threeMonthsAgo
    );
    const avgMonthlyExpense = recentCosts.reduce((sum, cost) => sum + cost.montant, 0) / 3;

    setSummary({
      totalCosts,
      costPerCategory,
      costPerKg: 0, // Sera calculé avec la biomasse
      avgMonthlyExpense
    });
  };

  const addCostEntry = async (costData: Omit<CostEntry, 'id' | 'created_at' | 'cage'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cost_tracking')
        .insert([{ ...costData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Coût ajouté avec succès');
      fetchCosts();
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du coût:', error);
      toast.error('Erreur lors de l\'ajout du coût');
      throw error;
    }
  };

  const updateCostEntry = async (id: string, updates: Partial<CostEntry>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cost_tracking')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Coût mis à jour avec succès');
      fetchCosts();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du coût:', error);
      toast.error('Erreur lors de la mise à jour du coût');
      throw error;
    }
  };

  const deleteCostEntry = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cost_tracking')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Coût supprimé avec succès');
      fetchCosts();
    } catch (error) {
      console.error('Erreur lors de la suppression du coût:', error);
      toast.error('Erreur lors de la suppression du coût');
      throw error;
    }
  };

  const getCostsByCage = (cageId: string) => {
    return costs.filter(cost => cost.cage_id === cageId);
  };

  const calculateCostPerKg = async (cageId: string) => {
    try {
      const { data, error } = await supabase.rpc('calculate_cost_per_kg', {
        cage_id_param: cageId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du calcul du coût par kg:', error);
      return 0;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCosts();
    }
  }, [user]);

  return {
    costs,
    summary,
    loading,
    fetchCosts,
    addCostEntry,
    updateCostEntry,
    deleteCostEntry,
    getCostsByCage,
    calculateCostPerKg
  };
};