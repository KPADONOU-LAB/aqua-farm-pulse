import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FinancialData {
  id: string;
  user_id: string;
  cage_id?: string;
  type_transaction: 'income' | 'expense' | 'investment';
  categorie: string;
  montant: number;
  description?: string;
  date_transaction: string;
  reference_document?: string;
  created_at: string;
  updated_at: string;
}

interface Budget {
  id: string;
  user_id: string;
  nom_budget: string;
  periode_debut: string;
  periode_fin: string;
  budget_aliments: number;
  budget_medicaments: number;
  budget_equipements: number;
  budget_personnel: number;
  budget_maintenance: number;
  objectif_chiffre_affaires: number;
  objectif_marge: number;
  reel_aliments: number;
  reel_medicaments: number;
  reel_equipements: number;
  reel_personnel: number;
  reel_maintenance: number;
  reel_chiffre_affaires: number;
  statut: string;
  created_at: string;
  updated_at: string;
}

interface KPIs {
  totalRevenue: number;
  totalCosts: number;
  profitMargin: number;
  roi: number;
  revenueGrowth: number;
  costGrowth: number;
  profitabilityTrend: number;
  averageMarginPerCage: number;
  bestPerformingCage: string | null;
  costBreakdown: {
    food: number;
    medicine: number;
    equipment: number;
    labor: number;
    maintenance: number;
  };
}

export const useFinanceData = () => {
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [kpis, setKpis] = useState<KPIs>({
    totalRevenue: 0,
    totalCosts: 0,
    profitMargin: 0,
    roi: 0,
    revenueGrowth: 0,
    costGrowth: 0,
    profitabilityTrend: 0,
    averageMarginPerCage: 0,
    bestPerformingCage: null,
    costBreakdown: {
      food: 0,
      medicine: 0,
      equipment: 0,
      labor: 0,
      maintenance: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFinanceData();
    }
  }, [user]);

  const loadFinanceData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load financial transactions
      const { data: financialTransactions } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user.id)
        .order('date_transaction', { ascending: false });

      // Load budgets
      const { data: budgetData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setFinancialData((financialTransactions || []) as FinancialData[]);
      setBudgets((budgetData || []) as Budget[]);

      // Calculate KPIs
      await calculateKPIs((financialTransactions || []) as FinancialData[]);

    } catch (error) {
      console.error('Erreur lors du chargement des données financières:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIs = async (transactions: FinancialData[]) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Current month data
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date_transaction);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    // Last month data
    const lastMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date_transaction);
      return transactionDate.getMonth() === lastMonth && 
             transactionDate.getFullYear() === lastMonthYear;
    });

    // Calculate totals
    const currentRevenue = currentMonthTransactions
      .filter(t => t.type_transaction === 'income')
      .reduce((sum, t) => sum + t.montant, 0);

    const currentCosts = currentMonthTransactions
      .filter(t => t.type_transaction === 'expense')
      .reduce((sum, t) => sum + t.montant, 0);

    const lastRevenue = lastMonthTransactions
      .filter(t => t.type_transaction === 'income')
      .reduce((sum, t) => sum + t.montant, 0);

    const lastCosts = lastMonthTransactions
      .filter(t => t.type_transaction === 'expense')
      .reduce((sum, t) => sum + t.montant, 0);

    // Calculate growth rates
    const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;
    const costGrowth = lastCosts > 0 ? ((currentCosts - lastCosts) / lastCosts) * 100 : 0;

    // Calculate profit margin
    const profitMargin = currentRevenue > 0 ? ((currentRevenue - currentCosts) / currentRevenue) * 100 : 0;

    // Calculate ROI
    const roi = currentCosts > 0 ? ((currentRevenue - currentCosts) / currentCosts) * 100 : 0;

    // Calculate cost breakdown
    const totalCosts = currentCosts > 0 ? currentCosts : 1; // Avoid division by zero
    const foodCosts = currentMonthTransactions
      .filter(t => t.type_transaction === 'expense' && t.categorie === 'food')
      .reduce((sum, t) => sum + t.montant, 0);
    const medicineCosts = currentMonthTransactions
      .filter(t => t.type_transaction === 'expense' && t.categorie === 'medicine')
      .reduce((sum, t) => sum + t.montant, 0);
    const equipmentCosts = currentMonthTransactions
      .filter(t => t.type_transaction === 'expense' && t.categorie === 'equipment')
      .reduce((sum, t) => sum + t.montant, 0);
    const laborCosts = currentMonthTransactions
      .filter(t => t.type_transaction === 'expense' && t.categorie === 'labor')
      .reduce((sum, t) => sum + t.montant, 0);
    const maintenanceCosts = currentMonthTransactions
      .filter(t => t.type_transaction === 'expense' && t.categorie === 'maintenance')
      .reduce((sum, t) => sum + t.montant, 0);

    const costBreakdown = {
      food: (foodCosts / totalCosts) * 100,
      medicine: (medicineCosts / totalCosts) * 100,
      equipment: (equipmentCosts / totalCosts) * 100,
      labor: (laborCosts / totalCosts) * 100,
      maintenance: (maintenanceCosts / totalCosts) * 100,
    };

    // Get best performing cage (simplified)
    try {
      const { data: cages } = await supabase
        .from('cages')
        .select('nom, fcr')
        .eq('user_id', user!.id)
        .order('fcr', { ascending: true })
        .limit(1);

      const bestPerformingCage = cages && cages.length > 0 ? cages[0].nom : null;

      setKpis({
        totalRevenue: currentRevenue,
        totalCosts: currentCosts,
        profitMargin,
        roi,
        revenueGrowth,
        costGrowth,
        profitabilityTrend: profitMargin - ((lastRevenue - lastCosts) / (lastRevenue || 1)) * 100,
        averageMarginPerCage: profitMargin, // Simplified
        bestPerformingCage,
        costBreakdown
      });
    } catch (error) {
      console.error('Erreur lors du calcul des KPIs:', error);
    }
  };

  const refreshData = () => {
    loadFinanceData();
  };

  return {
    financialData,
    budgets,
    kpis,
    loading,
    refreshData
  };
};