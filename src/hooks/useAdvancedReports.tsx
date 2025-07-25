import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FinancialReport {
  period: string;
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
  costBreakdown: {
    feeding: number;
    labor: number;
    veterinary: number;
    equipment: number;
    other: number;
  };
}

interface CycleAnalysis {
  cycleId: string;
  cageName: string;
  startDate: string;
  endDate?: string;
  initialStock: number;
  currentStock: number;
  totalCosts: number;
  revenue: number;
  profit: number;
  roi: number;
  fcr: number;
  survivalRate: number;
  avgWeight: number;
  status: 'active' | 'completed';
}

interface AutomatedReportConfig {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  sections: string[];
  recipients: string[];
  lastGenerated?: string;
  nextGeneration: string;
  enabled: boolean;
}

export const useAdvancedReports = () => {
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([]);
  const [cycleAnalyses, setCycleAnalyses] = useState<CycleAnalysis[]>([]);
  const [automatedConfigs, setAutomatedConfigs] = useState<AutomatedReportConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        generateFinancialReports(),
        generateCycleAnalyses(),
        loadAutomatedConfigs()
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFinancialReports = async () => {
    if (!user) return;

    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        start: new Date(date.getFullYear(), date.getMonth(), 1),
        end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
        label: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
      });
    }

    const reports: FinancialReport[] = [];

    for (const month of months) {
      const startDate = month.start.toISOString().split('T')[0];
      const endDate = month.end.toISOString().split('T')[0];

      // Revenus du mois
      const { data: sales } = await supabase
        .from('sales')
        .select('prix_total')
        .eq('user_id', user.id)
        .gte('date_vente', startDate)
        .lte('date_vente', endDate);

      const revenue = sales?.reduce((sum, sale) => sum + sale.prix_total, 0) || 0;

      // Coûts du mois
      const { data: costs } = await supabase
        .from('cost_tracking')
        .select('montant, categorie_cout')
        .eq('user_id', user.id)
        .gte('date_cout', startDate)
        .lte('date_cout', endDate);

      // Coûts d'alimentation estimés
      const { data: feeding } = await supabase
        .from('feeding_sessions')
        .select('quantite')
        .eq('user_id', user.id)
        .gte('date_alimentation', startDate)
        .lte('date_alimentation', endDate);

      const feedingCost = feeding?.reduce((sum, session) => sum + (session.quantite * 1.2), 0) || 0;
      const totalCosts = (costs?.reduce((sum, cost) => sum + cost.montant, 0) || 0) + feedingCost;

      // Répartition des coûts
      const costBreakdown = {
        feeding: feedingCost,
        labor: costs?.filter(c => c.categorie_cout === 'personnel').reduce((sum, c) => sum + c.montant, 0) || 0,
        veterinary: costs?.filter(c => c.categorie_cout === 'veterinaire').reduce((sum, c) => sum + c.montant, 0) || 0,
        equipment: costs?.filter(c => c.categorie_cout === 'equipement').reduce((sum, c) => sum + c.montant, 0) || 0,
        other: costs?.filter(c => !['personnel', 'veterinaire', 'equipement'].includes(c.categorie_cout)).reduce((sum, c) => sum + c.montant, 0) || 0
      };

      const profit = revenue - totalCosts;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      reports.push({
        period: month.label,
        revenue,
        costs: totalCosts,
        profit,
        profitMargin,
        costBreakdown
      });
    }

    setFinancialReports(reports);
  };

  const generateCycleAnalyses = async () => {
    if (!user) return;

    // Récupérer les cycles de production
    const { data: cycles } = await supabase
      .from('production_cycles')
      .select('*')
      .eq('user_id', user.id)
      .order('date_debut', { ascending: false });

    if (!cycles) return;

    const analyses: CycleAnalysis[] = [];

    for (const cycle of cycles) {
      try {
        // Récupérer les infos de la cage
        const { data: cage } = await supabase
          .from('cages')
          .select('nom, nombre_poissons, poids_moyen, fcr')
          .eq('id', cycle.cage_id)
          .single();

        // Calculer les coûts totaux du cycle
        const { data: costs } = await supabase
          .from('cost_tracking')
          .select('montant')
          .eq('cycle_id', cycle.id);

        const totalCosts = costs?.reduce((sum, cost) => sum + cost.montant, 0) || 0;

        // Calculer les revenus du cycle
        const { data: sales } = await supabase
          .from('sales')
          .select('prix_total')
          .eq('cage_id', cycle.cage_id)
          .gte('date_vente', cycle.date_debut)
          .lte('date_vente', cycle.date_fin_reelle || new Date().toISOString().split('T')[0]);

        const revenue = sales?.reduce((sum, sale) => sum + sale.prix_total, 0) || 0;

        // Calculer le taux de survie
        const { data: mortality } = await supabase
          .from('health_observations')
          .select('mortalite')
          .eq('cage_id', cycle.cage_id)
          .gte('date_observation', cycle.date_debut);

        const totalMortality = mortality?.reduce((sum, obs) => sum + obs.mortalite, 0) || 0;
        const survivalRate = cycle.nombre_poissons_initial > 0 
          ? ((cycle.nombre_poissons_initial - totalMortality) / cycle.nombre_poissons_initial) * 100 
          : 0;

        const profit = revenue - totalCosts;
        const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;

        analyses.push({
          cycleId: cycle.id,
          cageName: cage?.nom || `Cage ${cycle.cage_id.slice(-4)}`,
          startDate: cycle.date_debut,
          endDate: cycle.date_fin_reelle,
          initialStock: cycle.nombre_poissons_initial,
          currentStock: cycle.nombre_poissons_final || cage?.nombre_poissons || 0,
          totalCosts,
          revenue,
          profit,
          roi,
          fcr: cage?.fcr || 0,
          survivalRate,
          avgWeight: cycle.poids_final_moyen || cage?.poids_moyen || 0,
          status: cycle.statut === 'termine' ? 'completed' : 'active'
        });
      } catch (error) {
        console.error(`Erreur lors de l'analyse du cycle ${cycle.id}:`, error);
        // Continuer avec les autres cycles même si un échoue
      }
    }

    setCycleAnalyses(analyses);
  };

  const loadAutomatedConfigs = async () => {
    // Configurations par défaut (sera stocké en base plus tard)
    const defaultConfigs: AutomatedReportConfig[] = [
      {
        id: '1',
        name: 'Rapport quotidien de production',
        type: 'daily',
        sections: ['feeding', 'water_quality', 'mortality'],
        recipients: ['manager@ferme.com'],
        nextGeneration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        enabled: true
      },
      {
        id: '2',
        name: 'Analyse hebdomadaire FCR',
        type: 'weekly',
        sections: ['performance', 'fcr_analysis', 'feeding_efficiency'],
        recipients: ['technique@ferme.com'],
        nextGeneration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        enabled: true
      },
      {
        id: '3',
        name: 'Bilan financier mensuel',
        type: 'monthly',
        sections: ['financial_summary', 'cost_analysis', 'profitability', 'forecasts'],
        recipients: ['direction@ferme.com', 'comptable@ferme.com'],
        nextGeneration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        enabled: true
      }
    ];

    setAutomatedConfigs(defaultConfigs);
  };

  const generateAutomatedReport = async (configId: string) => {
    const config = automatedConfigs.find(c => c.id === configId);
    if (!config) return null;

    const reportData = {
      title: config.name,
      period: config.type,
      generatedAt: new Date().toISOString(),
      sections: {}
    };

    // Générer les sections selon la configuration
    for (const section of config.sections) {
      switch (section) {
        case 'feeding':
          const feedingData = await generateFeedingSection();
          reportData.sections['feeding'] = feedingData;
          break;
        case 'financial_summary':
          const financialData = financialReports.slice(-1)[0];
          reportData.sections['financial_summary'] = financialData;
          break;
        case 'performance':
          const performanceData = await generatePerformanceSection();
          reportData.sections['performance'] = performanceData;
          break;
        // Ajouter d'autres sections selon les besoins
      }
    }

    return reportData;
  };

  const generateFeedingSection = async () => {
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];
    const { data: sessions } = await supabase
      .from('feeding_sessions')
      .select('*, cages!inner(nom)')
      .eq('user_id', user.id)
      .eq('date_alimentation', today);

    return {
      totalQuantity: sessions?.reduce((sum, s) => sum + s.quantite, 0) || 0,
      sessionsCount: sessions?.length || 0,
      cagesWithIssues: sessions?.filter(s => s.appetit === 'faible').length || 0
    };
  };

  const generatePerformanceSection = async () => {
    if (!user) return null;

    const { data: cages } = await supabase
      .from('cages')
      .select('*')
      .eq('user_id', user.id)
      .eq('statut', 'en_production');

    return {
      activeCages: cages?.length || 0,
      avgFCR: cages?.reduce((sum, c) => sum + (c.fcr || 0), 0) / (cages?.length || 1) || 0,
      totalFish: cages?.reduce((sum, c) => sum + c.nombre_poissons, 0) || 0
    };
  };

  const scheduleAutomatedReport = async (config: AutomatedReportConfig) => {
    // Planifier le prochain rapport (logique côté serveur)
    const nextGeneration = new Date();
    switch (config.type) {
      case 'daily':
        nextGeneration.setDate(nextGeneration.getDate() + 1);
        break;
      case 'weekly':
        nextGeneration.setDate(nextGeneration.getDate() + 7);
        break;
      case 'monthly':
        nextGeneration.setMonth(nextGeneration.getMonth() + 1);
        break;
      case 'quarterly':
        nextGeneration.setMonth(nextGeneration.getMonth() + 3);
        break;
    }

    // Mettre à jour la configuration
    const updatedConfigs = automatedConfigs.map(c => 
      c.id === config.id 
        ? { ...c, lastGenerated: new Date().toISOString(), nextGeneration: nextGeneration.toISOString() }
        : c
    );
    setAutomatedConfigs(updatedConfigs);
  };

  const exportToExcel = async (reportType: 'financial' | 'cycles') => {
    const data = reportType === 'financial' ? financialReports : cycleAnalyses;
    
    // Créer un CSV simple
    let csvContent = '';
    if (reportType === 'financial') {
      csvContent = 'Période,Revenus,Coûts,Profit,Marge (%)\n';
      financialReports.forEach(report => {
        csvContent += `${report.period},${report.revenue},${report.costs},${report.profit},${report.profitMargin.toFixed(2)}\n`;
      });
    } else {
      csvContent = 'Cycle,Cage,Début,Fin,Stock Initial,Stock Actuel,Coûts,Revenus,Profit,ROI (%),FCR,Survie (%)\n';
      cycleAnalyses.forEach(cycle => {
        csvContent += `${cycle.cycleId},${cycle.cageName},${cycle.startDate},${cycle.endDate || 'En cours'},${cycle.initialStock},${cycle.currentStock},${cycle.totalCosts},${cycle.revenue},${cycle.profit},${cycle.roi.toFixed(2)},${cycle.fcr},${cycle.survivalRate.toFixed(2)}\n`;
      });
    }

    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    financialReports,
    cycleAnalyses,
    automatedConfigs,
    loading,
    generateAutomatedReport,
    scheduleAutomatedReport,
    exportToExcel,
    refreshData: loadReportData
  };
};