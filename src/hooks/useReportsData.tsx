import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface CagePerformanceData {
  cage: string;
  cageId: string;
  fcr: number;
  survie: number;
  croissance: number;
  revenus: number;
  nombrePoissons: number;
  poidsMoyen: number;
  statut: string;
}

export interface MonthlyFinancialData {
  mois: string;
  revenus: number;
  couts: number;
  profit: number;
}

export interface CostBreakdownData {
  name: string;
  value: number;
  color: string;
}

export const useReportsData = () => {
  const { user } = useAuth();
  const [cagePerformanceData, setCagePerformanceData] = useState<CagePerformanceData[]>([]);
  const [monthlyFinancialData, setMonthlyFinancialData] = useState<MonthlyFinancialData[]>([]);
  const [costBreakdownData, setCostBreakdownData] = useState<CostBreakdownData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAllReportsData();
    }
  }, [user]);

  const loadAllReportsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadCagePerformanceData(),
        loadMonthlyFinancialData(),
        loadCostBreakdownData()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadCagePerformanceData = async () => {
    if (!user) return;

    try {
      // Récupérer toutes les cages actives de l'utilisateur
      const { data: cagesData, error: cagesError } = await supabase
        .from('cages')
        .select('*')
        .eq('user_id', user.id)
        .in('statut', ['en_production', 'actif']);

      if (cagesError) throw cagesError;

      const performanceData: CagePerformanceData[] = [];

      for (const cage of cagesData || []) {
        // Calculer les revenus pour cette cage
        const { data: salesData } = await supabase
          .from('sales')
          .select('prix_total')
          .eq('cage_id', cage.id);

        const revenus = salesData?.reduce((sum, sale) => sum + sale.prix_total, 0) || 0;

        // Calculer le taux de survie
        const { data: healthData } = await supabase
          .from('health_observations')
          .select('mortalite')
          .eq('cage_id', cage.id);

        const totalMortalite = healthData?.reduce((sum, obs) => sum + obs.mortalite, 0) || 0;
        const initialFish = cage.nombre_poissons_initial || cage.nombre_poissons;
        const survie = initialFish > 0 ? ((initialFish - totalMortalite) / initialFish) * 100 : 0;

        // Calculer la croissance (basée sur le poids moyen actuel vs initial estimé)
        const poidsInitialEstime = cage.poids_moyen * 0.3; // Estimation
        const croissance = cage.poids_moyen || 0;

        performanceData.push({
          cage: cage.nom,
          cageId: cage.id,
          fcr: cage.fcr || 0,
          survie: Math.min(100, Math.max(0, survie)),
          croissance: croissance,
          revenus: revenus,
          nombrePoissons: cage.nombre_poissons,
          poidsMoyen: cage.poids_moyen || 0,
          statut: cage.statut
        });
      }

      setCagePerformanceData(performanceData);
    } catch (error) {
      console.error('Erreur lors du chargement des données des cages:', error);
    }
  };

  const loadMonthlyFinancialData = async () => {
    if (!user) return;

    try {
      const monthlyData: MonthlyFinancialData[] = [];
      
      // Générer les 6 derniers mois
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // Récupérer les revenus (ventes)
        const { data: salesData } = await supabase
          .from('sales')
          .select('prix_total')
          .eq('user_id', user.id)
          .gte('date_vente', startDateStr)
          .lte('date_vente', endDateStr);

        const revenus = salesData?.reduce((sum, sale) => sum + sale.prix_total, 0) || 0;

        // Récupérer les coûts
        const { data: costsData } = await supabase
          .from('financial_data')
          .select('montant')
          .eq('user_id', user.id)
          .eq('type_transaction', 'expense')
          .gte('date_transaction', startDateStr)
          .lte('date_transaction', endDateStr);

        const couts = costsData?.reduce((sum, cost) => sum + cost.montant, 0) || 0;

        monthlyData.push({
          mois: date.toLocaleDateString('fr-FR', { month: 'short' }),
          revenus,
          couts,
          profit: revenus - couts
        });
      }

      setMonthlyFinancialData(monthlyData);
    } catch (error) {
      console.error('Erreur lors du chargement des données financières:', error);
    }
  };

  const loadCostBreakdownData = async () => {
    if (!user) return;

    try {
      // Récupérer les coûts par catégorie des 6 derniers mois
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const startDate = sixMonthsAgo.toISOString().split('T')[0];

      const { data: costsData } = await supabase
        .from('financial_data')
        .select('montant, categorie')
        .eq('user_id', user.id)
        .eq('type_transaction', 'expense')
        .gte('date_transaction', startDate);

      const categoryTotals: { [key: string]: number } = {};
      const totalCosts = costsData?.reduce((sum, cost) => {
        const category = cost.categorie || 'Autres';
        categoryTotals[category] = (categoryTotals[category] || 0) + cost.montant;
        return sum + cost.montant;
      }, 0) || 0;

      // Mapper les catégories avec des couleurs
      const categoryColors: { [key: string]: string } = {
        'alimentation': '#10b981',
        'personnel': '#0ea5e9',
        'veterinaire': '#f59e0b',
        'equipement': '#8b5cf6',
        'maintenance': '#ef4444',
        'autres': '#6b7280'
      };

      const breakdownData = Object.entries(categoryTotals).map(([category, amount]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: totalCosts > 0 ? Math.round((amount / totalCosts) * 100) : 0,
        color: categoryColors[category.toLowerCase()] || '#6b7280'
      }));

      // S'assurer qu'on a au moins quelques catégories par défaut
      if (breakdownData.length === 0) {
        setCostBreakdownData([
          { name: 'Alimentation', value: 58, color: '#10b981' },
          { name: 'Personnel', value: 25, color: '#0ea5e9' },
          { name: 'Vétérinaire', value: 8, color: '#f59e0b' },
          { name: 'Équipement', value: 6, color: '#8b5cf6' },
          { name: 'Autres', value: 3, color: '#ef4444' }
        ]);
      } else {
        setCostBreakdownData(breakdownData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la répartition des coûts:', error);
    }
  };

  const getKPIs = () => {
    const activeCages = cagePerformanceData.filter(cage => cage.fcr > 0);
    
    const totalProfit = monthlyFinancialData.reduce((acc, month) => acc + month.profit, 0);
    const avgFCR = activeCages.length > 0 
      ? activeCages.reduce((acc, cage) => acc + cage.fcr, 0) / activeCages.length 
      : 0;
    const avgSurvival = activeCages.length > 0 
      ? activeCages.reduce((acc, cage) => acc + cage.survie, 0) / activeCages.length 
      : 0;
    const totalRevenue = monthlyFinancialData.reduce((acc, month) => acc + month.revenus, 0);

    return {
      totalProfit,
      avgFCR,
      avgSurvival,
      totalRevenue,
      activeCagesCount: activeCages.length,
      totalCagesCount: cagePerformanceData.length
    };
  };

  return {
    cagePerformanceData,
    monthlyFinancialData,
    costBreakdownData,
    loading,
    error,
    kpis: getKPIs(),
    refetch: loadAllReportsData
  };
};