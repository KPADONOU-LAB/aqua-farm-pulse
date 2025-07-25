import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type FinancialData = Database['public']['Tables']['financial_data']['Row'];
type Sale = Database['public']['Tables']['sales']['Row'];
type CostTracking = Database['public']['Tables']['cost_tracking']['Row'];

export function useOptimizedFinanceData(cageId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Données financières générales
  const {
    data: financialData,
    isLoading: isLoadingFinancial,
    error: financialError
  } = useQuery({
    queryKey: ['financial_data', user?.id, cageId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('financial_data')
        .select('*')
        .order('date_transaction', { ascending: false });

      if (cageId) {
        query = query.eq('cage_id', cageId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FinancialData[];
    },
    enabled: !!user,
  });

  // Ventes
  const {
    data: sales,
    isLoading: isLoadingSales,
    error: salesError
  } = useQuery({
    queryKey: ['sales', user?.id, cageId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('sales')
        .select('*, cages(nom)')
        .order('date_vente', { ascending: false });

      if (cageId) {
        query = query.eq('cage_id', cageId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Sale[];
    },
    enabled: !!user,
  });

  // Suivi des coûts
  const {
    data: costTracking,
    isLoading: isLoadingCosts,
    error: costsError
  } = useQuery({
    queryKey: ['cost_tracking', user?.id, cageId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('cost_tracking')
        .select('*, cages(nom)')
        .order('date_cout', { ascending: false });

      if (cageId) {
        query = query.eq('cage_id', cageId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CostTracking[];
    },
    enabled: !!user,
  });

  // Créer une vente
  const createSale = useMutation({
    mutationFn: async (newSale: Database['public']['Tables']['sales']['Insert']) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('sales')
        .insert({ ...newSale, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['cages'] });
      queryClient.invalidateQueries({ queryKey: ['financial_data'] });
      toast({
        title: "Succès",
        description: "Vente enregistrée avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Créer une entrée de coût
  const createCostEntry = useMutation({
    mutationFn: async (newCost: Database['public']['Tables']['cost_tracking']['Insert']) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('cost_tracking')
        .insert({ ...newCost, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost_tracking'] });
      queryClient.invalidateQueries({ queryKey: ['cages'] });
      toast({
        title: "Succès",
        description: "Coût enregistré avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Créer une transaction financière
  const createFinancialEntry = useMutation({
    mutationFn: async (newEntry: Database['public']['Tables']['financial_data']['Insert']) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('financial_data')
        .insert({ ...newEntry, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_data'] });
      toast({
        title: "Succès",
        description: "Transaction enregistrée avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Statistiques financières consolidées
  const totalRevenue = sales?.reduce((total, sale) => total + (sale.prix_total || 0), 0) || 0;
  const totalCosts = costTracking?.reduce((total, cost) => total + (cost.montant || 0), 0) || 0;
  const monthlyRevenue = sales?.filter(sale => 
    new Date(sale.date_vente) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).reduce((total, sale) => total + (sale.prix_total || 0), 0) || 0;
  const monthlyCosts = costTracking?.filter(cost => 
    new Date(cost.date_cout) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).reduce((total, cost) => total + (cost.montant || 0), 0) || 0;
  
  const profit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const monthlyProfit = monthlyRevenue - monthlyCosts;

  const financeStats = {
    totalRevenue,
    totalCosts,
    totalSales: sales?.length || 0,
    totalExpenses: financialData?.filter(entry => entry.type_transaction === 'expense')
      .reduce((total, entry) => total + (entry.montant || 0), 0) || 0,
    totalIncome: financialData?.filter(entry => entry.type_transaction === 'income')
      .reduce((total, entry) => total + (entry.montant || 0), 0) || 0,
    monthlyRevenue,
    monthlyCosts,
    profit,
    profitMargin,
    monthlyProfit,
  };

  return {
    // Données
    financialData: financialData || [],
    sales: sales || [],
    costTracking: costTracking || [],
    financeStats,
    
    // États de chargement
    isLoading: isLoadingFinancial || isLoadingSales || isLoadingCosts,
    isLoadingFinancial,
    isLoadingSales,
    isLoadingCosts,
    
    // Erreurs
    error: financialError || salesError || costsError,
    
    // Actions
    createSale: createSale.mutate,
    createCostEntry: createCostEntry.mutate,
    createFinancialEntry: createFinancialEntry.mutate,
    
    // États des mutations
    isCreatingSale: createSale.isPending,
    isCreatingCost: createCostEntry.isPending,
    isCreatingEntry: createFinancialEntry.isPending,
  };
}