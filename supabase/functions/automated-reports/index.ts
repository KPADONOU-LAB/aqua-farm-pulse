import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReportConfig {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  sections: string[];
  recipients: string[];
  enabled: boolean;
}

interface FinancialData {
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
  period: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, report_type, config_id } = await req.json();

    if (!user_id) {
      throw new Error('user_id is required');
    }

    let reportData: any = {};

    switch (report_type) {
      case 'daily_production':
        reportData = await generateDailyProductionReport(supabase, user_id);
        break;
      case 'weekly_performance':
        reportData = await generateWeeklyPerformanceReport(supabase, user_id);
        break;
      case 'monthly_financial':
        reportData = await generateMonthlyFinancialReport(supabase, user_id);
        break;
      case 'quarterly_analysis':
        reportData = await generateQuarterlyAnalysisReport(supabase, user_id);
        break;
      default:
        throw new Error('Invalid report type');
    }

    // Générer le rapport au format HTML/PDF
    const htmlReport = generateHTMLReport(reportData, report_type);
    
    // Envoyer par email (simulation)
    if (reportData.recipients && reportData.recipients.length > 0) {
      console.log(`Rapport envoyé à: ${reportData.recipients.join(', ')}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        report: reportData,
        html: htmlReport,
        generated_at: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function generateDailyProductionReport(supabase: any, userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  // Sessions d'alimentation du jour
  const { data: feedingSessions } = await supabase
    .from('feeding_sessions')
    .select('*, cages(nom)')
    .eq('user_id', userId)
    .eq('date_alimentation', today);

  // Observations de santé du jour
  const { data: healthObs } = await supabase
    .from('health_observations')
    .select('*, cages(nom)')
    .eq('user_id', userId)
    .eq('date_observation', today);

  // Mesures qualité eau du jour
  const { data: waterQuality } = await supabase
    .from('water_quality')
    .select('*, cages(nom)')
    .eq('user_id', userId)
    .eq('date_mesure', today);

  // Statistiques du jour
  const totalFeeding = feedingSessions?.reduce((sum: number, session: any) => sum + session.quantite, 0) || 0;
  const cagesWithIssues = healthObs?.filter((obs: any) => obs.statut === 'alerte').length || 0;
  const waterIssues = waterQuality?.filter((wq: any) => wq.statut !== 'optimal').length || 0;

  return {
    type: 'daily_production',
    date: today,
    summary: {
      totalFeeding,
      feedingSessions: feedingSessions?.length || 0,
      healthObservations: healthObs?.length || 0,
      waterQualityChecks: waterQuality?.length || 0,
      cagesWithHealthIssues: cagesWithIssues,
      waterQualityIssues: waterIssues
    },
    details: {
      feeding: feedingSessions || [],
      health: healthObs || [],
      waterQuality: waterQuality || []
    },
    recommendations: generateDailyRecommendations(totalFeeding, cagesWithIssues, waterIssues),
    recipients: ['production@ferme.com']
  };
}

async function generateWeeklyPerformanceReport(supabase: any, userId: string) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // Récupérer les cages actives
  const { data: cages } = await supabase
    .from('cages')
    .select('*')
    .eq('user_id', userId)
    .eq('statut', 'en_production');

  const cagePerformance = [];

  for (const cage of cages || []) {
    // Calculer FCR de la semaine
    const { data: feeding } = await supabase
      .from('feeding_sessions')
      .select('quantite')
      .eq('cage_id', cage.id)
      .gte('date_alimentation', startDateStr)
      .lte('date_alimentation', endDateStr);

    const weeklyFeeding = feeding?.reduce((sum: number, f: any) => sum + f.quantite, 0) || 0;
    
    // Estimer la croissance de la semaine
    const weightGain = cage.poids_moyen * 0.1; // Estimation 10% par semaine
    const weeklyFCR = weightGain > 0 ? weeklyFeeding / (cage.nombre_poissons * weightGain) : 0;

    // Mortalité de la semaine
    const { data: mortality } = await supabase
      .from('health_observations')
      .select('mortalite')
      .eq('cage_id', cage.id)
      .gte('date_observation', startDateStr)
      .lte('date_observation', endDateStr);

    const weeklyMortality = mortality?.reduce((sum: number, m: any) => sum + m.mortalite, 0) || 0;
    const mortalityRate = cage.nombre_poissons > 0 ? (weeklyMortality / cage.nombre_poissons) * 100 : 0;

    cagePerformance.push({
      cageName: cage.nom,
      weeklyFCR,
      weeklyFeeding,
      weeklyMortality,
      mortalityRate,
      currentWeight: cage.poids_moyen,
      fishCount: cage.nombre_poissons
    });
  }

  const avgFCR = cagePerformance.reduce((sum: number, cage: any) => sum + cage.weeklyFCR, 0) / (cagePerformance.length || 1);
  const totalMortality = cagePerformance.reduce((sum: number, cage: any) => sum + cage.weeklyMortality, 0);

  return {
    type: 'weekly_performance',
    period: `${startDateStr} - ${endDateStr}`,
    summary: {
      avgFCR: Math.round(avgFCR * 100) / 100,
      totalMortality,
      activeCages: cagePerformance.length,
      totalFeeding: cagePerformance.reduce((sum: number, cage: any) => sum + cage.weeklyFeeding, 0)
    },
    cagePerformance,
    recommendations: generateWeeklyRecommendations(avgFCR, totalMortality, cagePerformance),
    recipients: ['technique@ferme.com']
  };
}

async function generateMonthlyFinancialReport(supabase: any, userId: string) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // Revenus du mois
  const { data: sales } = await supabase
    .from('sales')
    .select('prix_total, quantite_kg, date_vente')
    .eq('user_id', userId)
    .gte('date_vente', startDateStr)
    .lte('date_vente', endDateStr);

  const revenue = sales?.reduce((sum: number, sale: any) => sum + sale.prix_total, 0) || 0;
  const volumeSold = sales?.reduce((sum: number, sale: any) => sum + sale.quantite_kg, 0) || 0;

  // Coûts du mois
  const { data: costs } = await supabase
    .from('cost_tracking')
    .select('montant, categorie_cout')
    .eq('user_id', userId)
    .gte('date_cout', startDateStr)
    .lte('date_cout', endDateStr);

  // Coûts d'alimentation
  const { data: feeding } = await supabase
    .from('feeding_sessions')
    .select('quantite')
    .eq('user_id', userId)
    .gte('date_alimentation', startDateStr)
    .lte('date_alimentation', endDateStr);

  const feedingCost = feeding?.reduce((sum: number, session: any) => sum + (session.quantite * 1.2), 0) || 0;
  const otherCosts = costs?.reduce((sum: number, cost: any) => sum + cost.montant, 0) || 0;
  const totalCosts = feedingCost + otherCosts;

  const profit = revenue - totalCosts;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  // Analyse par catégorie de coûts
  const costBreakdown = {
    feeding: feedingCost,
    labor: costs?.filter((c: any) => c.categorie_cout === 'personnel').reduce((sum: number, c: any) => sum + c.montant, 0) || 0,
    veterinary: costs?.filter((c: any) => c.categorie_cout === 'veterinaire').reduce((sum: number, c: any) => sum + c.montant, 0) || 0,
    equipment: costs?.filter((c: any) => c.categorie_cout === 'equipement').reduce((sum: number, c: any) => sum + c.montant, 0) || 0,
    other: costs?.filter((c: any) => !['personnel', 'veterinaire', 'equipement'].includes(c.categorie_cout)).reduce((sum: number, c: any) => sum + c.montant, 0) || 0
  };

  return {
    type: 'monthly_financial',
    period: `${startDateStr} - ${endDateStr}`,
    summary: {
      revenue,
      totalCosts,
      profit,
      profitMargin: Math.round(profitMargin * 100) / 100,
      volumeSold,
      avgPricePerKg: volumeSold > 0 ? revenue / volumeSold : 0
    },
    costBreakdown,
    trends: await getFinancialTrends(supabase, userId, startDate),
    recommendations: generateFinancialRecommendations(profitMargin, costBreakdown),
    recipients: ['direction@ferme.com', 'comptable@ferme.com']
  };
}

async function generateQuarterlyAnalysisReport(supabase: any, userId: string) {
  const now = new Date();
  const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
  
  const startDateStr = quarterStart.toISOString().split('T')[0];
  const endDateStr = quarterEnd.toISOString().split('T')[0];

  // Analyses des cycles terminés dans le trimestre
  const { data: cycles } = await supabase
    .from('production_cycles')
    .select('*')
    .eq('user_id', userId)
    .eq('statut', 'termine')
    .gte('date_fin_reelle', startDateStr)
    .lte('date_fin_reelle', endDateStr);

  const cycleAnalyses = [];
  let totalRevenue = 0;
  let totalCosts = 0;

  for (const cycle of cycles || []) {
    // Revenus du cycle
    const { data: sales } = await supabase
      .from('sales')
      .select('prix_total')
      .eq('cage_id', cycle.cage_id)
      .gte('date_vente', cycle.date_debut)
      .lte('date_vente', cycle.date_fin_reelle);

    const cycleRevenue = sales?.reduce((sum: number, sale: any) => sum + sale.prix_total, 0) || 0;

    // Coûts du cycle
    const { data: costs } = await supabase
      .from('cost_tracking')
      .select('montant')
      .eq('cycle_id', cycle.id);

    const cycleCosts = costs?.reduce((sum: number, cost: any) => sum + cost.montant, 0) || 0;
    
    const profit = cycleRevenue - cycleCosts;
    const roi = cycleCosts > 0 ? (profit / cycleCosts) * 100 : 0;

    cycleAnalyses.push({
      cycleId: cycle.id,
      duration: Math.ceil((new Date(cycle.date_fin_reelle) - new Date(cycle.date_debut)) / (1000 * 60 * 60 * 24)),
      revenue: cycleRevenue,
      costs: cycleCosts,
      profit,
      roi: Math.round(roi * 100) / 100,
      initialFish: cycle.nombre_poissons_initial,
      finalFish: cycle.nombre_poissons_final,
      survivalRate: cycle.nombre_poissons_initial > 0 ? (cycle.nombre_poissons_final / cycle.nombre_poissons_initial) * 100 : 0
    });

    totalRevenue += cycleRevenue;
    totalCosts += cycleCosts;
  }

  const quarterProfit = totalRevenue - totalCosts;
  const avgROI = cycleAnalyses.length > 0 ? cycleAnalyses.reduce((sum: number, cycle: any) => sum + cycle.roi, 0) / cycleAnalyses.length : 0;
  const avgSurvival = cycleAnalyses.length > 0 ? cycleAnalyses.reduce((sum: number, cycle: any) => sum + cycle.survivalRate, 0) / cycleAnalyses.length : 0;

  return {
    type: 'quarterly_analysis',
    period: `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`,
    summary: {
      totalRevenue,
      totalCosts,
      quarterProfit,
      avgROI: Math.round(avgROI * 100) / 100,
      avgSurvival: Math.round(avgSurvival * 100) / 100,
      completedCycles: cycleAnalyses.length
    },
    cycleAnalyses,
    benchmarks: await getBenchmarks(supabase, userId),
    recommendations: generateQuarterlyRecommendations(avgROI, avgSurvival, cycleAnalyses),
    recipients: ['direction@ferme.com']
  };
}

function generateDailyRecommendations(totalFeeding: number, healthIssues: number, waterIssues: number): string[] {
  const recommendations = [];
  
  if (totalFeeding < 50) {
    recommendations.push("⚠️ Quantité d'alimentation faible aujourd'hui - vérifier les protocoles");
  }
  
  if (healthIssues > 0) {
    recommendations.push(`🚨 ${healthIssues} cage(s) avec problèmes de santé - intervention nécessaire`);
  }
  
  if (waterIssues > 0) {
    recommendations.push(`💧 ${waterIssues} mesure(s) de qualité d'eau non-optimale - contrôler les paramètres`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push("✅ Journée normale - tous les indicateurs sont conformes");
  }
  
  return recommendations;
}

function generateWeeklyRecommendations(avgFCR: number, totalMortality: number, cagePerformance: any[]): string[] {
  const recommendations = [];
  
  if (avgFCR > 2.2) {
    recommendations.push("📊 FCR moyen élevé cette semaine - optimiser les rations alimentaires");
  }
  
  if (totalMortality > 50) {
    recommendations.push("⚠️ Mortalité élevée - renforcer la surveillance sanitaire");
  }
  
  const poorPerformers = cagePerformance.filter(cage => cage.weeklyFCR > 2.5);
  if (poorPerformers.length > 0) {
    recommendations.push(`🎯 ${poorPerformers.length} cage(s) avec FCR > 2.5 - réviser les protocoles`);
  }
  
  return recommendations;
}

function generateFinancialRecommendations(profitMargin: number, costBreakdown: any): string[] {
  const recommendations = [];
  
  if (profitMargin < 15) {
    recommendations.push("💰 Marge bénéficiaire faible - analyser les coûts et optimiser les prix");
  }
  
  const totalCosts = Object.values(costBreakdown).reduce((sum: number, cost: any) => sum + cost, 0);
  const feedingPercentage = (costBreakdown.feeding / totalCosts) * 100;
  
  if (feedingPercentage > 65) {
    recommendations.push("🐟 Coûts d'alimentation élevés - optimiser les rations et fournisseurs");
  }
  
  if (costBreakdown.veterinary > costBreakdown.feeding * 0.15) {
    recommendations.push("💊 Coûts vétérinaires élevés - renforcer la prévention");
  }
  
  return recommendations;
}

function generateQuarterlyRecommendations(avgROI: number, avgSurvival: number, cycles: any[]): string[] {
  const recommendations = [];
  
  if (avgROI < 20) {
    recommendations.push("📈 ROI moyen faible - réviser la stratégie de pricing et de coûts");
  }
  
  if (avgSurvival < 90) {
    recommendations.push("🐟 Taux de survie à améliorer - renforcer les protocoles sanitaires");
  }
  
  const shortCycles = cycles.filter(cycle => cycle.duration < 150);
  if (shortCycles.length > cycles.length * 0.3) {
    recommendations.push("⏱️ Plusieurs cycles courts - analyser les causes et optimiser la durée");
  }
  
  return recommendations;
}

async function getFinancialTrends(supabase: any, userId: string, currentMonth: Date) {
  // Comparer avec le mois précédent (simplifié)
  const prevMonth = new Date(currentMonth);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  
  return {
    revenueGrowth: 8.5, // Simulation
    costReduction: -3.2,
    profitImprovement: 12.1
  };
}

async function getBenchmarks(supabase: any, userId: string) {
  // Benchmarks industrie (simulés)
  return {
    industryAvgFCR: 1.9,
    industryAvgSurvival: 92,
    industryAvgROI: 25,
    targetFCR: 1.8,
    targetSurvival: 95,
    targetROI: 30
  };
}

function generateHTMLReport(reportData: any, reportType: string): string {
  const title = getReportTitle(reportType);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: #f8f9fa; }
        .summary { background: #e3f2fd; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .recommendations { background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f2f2f2; }
        .positive { color: #28a745; }
        .negative { color: #dc3545; }
        .warning { color: #ffc107; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>Période: ${reportData.period || reportData.date}</p>
        <p>Généré le: ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>
      
      <div class="summary">
        <h2>Résumé Exécutif</h2>
        ${generateSummaryHTML(reportData)}
      </div>
      
      ${generateDetailsHTML(reportData, reportType)}
      
      <div class="recommendations">
        <h2>Recommandations</h2>
        <ul>
          ${reportData.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
      
      <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
        <p>Rapport généré automatiquement par PisciManager</p>
      </div>
    </body>
    </html>
  `;
}

function getReportTitle(reportType: string): string {
  const titles = {
    'daily_production': 'Rapport Quotidien de Production',
    'weekly_performance': 'Analyse Hebdomadaire de Performance',
    'monthly_financial': 'Bilan Financier Mensuel',
    'quarterly_analysis': 'Analyse Trimestrielle'
  };
  return titles[reportType] || 'Rapport';
}

function generateSummaryHTML(reportData: any): string {
  const summary = reportData.summary;
  let html = '';
  
  for (const [key, value] of Object.entries(summary)) {
    html += `<div class="metric">
      <strong>${formatKey(key)}:</strong> ${formatValue(value)}
    </div>`;
  }
  
  return html;
}

function generateDetailsHTML(reportData: any, reportType: string): string {
  switch (reportType) {
    case 'weekly_performance':
      return generatePerformanceTable(reportData.cagePerformance);
    case 'monthly_financial':
      return generateCostBreakdownTable(reportData.costBreakdown);
    case 'quarterly_analysis':
      return generateCycleAnalysisTable(reportData.cycleAnalyses);
    default:
      return '';
  }
}

function generatePerformanceTable(cagePerformance: any[]): string {
  if (!cagePerformance || cagePerformance.length === 0) return '';
  
  let html = '<h2>Performance par Cage</h2><table class="table"><thead><tr>';
  html += '<th>Cage</th><th>FCR</th><th>Alimentation (kg)</th><th>Mortalité</th><th>Taux (%)</th>';
  html += '</tr></thead><tbody>';
  
  for (const cage of cagePerformance) {
    html += `<tr>
      <td>${cage.cageName}</td>
      <td class="${cage.weeklyFCR > 2.2 ? 'warning' : 'positive'}">${cage.weeklyFCR.toFixed(2)}</td>
      <td>${cage.weeklyFeeding.toFixed(1)}</td>
      <td>${cage.weeklyMortality}</td>
      <td class="${cage.mortalityRate > 5 ? 'negative' : 'positive'}">${cage.mortalityRate.toFixed(1)}%</td>
    </tr>`;
  }
  
  html += '</tbody></table>';
  return html;
}

function generateCostBreakdownTable(costBreakdown: any): string {
  let html = '<h2>Répartition des Coûts</h2><table class="table"><thead><tr>';
  html += '<th>Catégorie</th><th>Montant (€)</th><th>Pourcentage</th>';
  html += '</tr></thead><tbody>';
  
  const total = Object.values(costBreakdown).reduce((sum: number, cost: any) => sum + cost, 0);
  
  for (const [category, amount] of Object.entries(costBreakdown)) {
    const percentage = total > 0 ? ((amount as number) / total) * 100 : 0;
    html += `<tr>
      <td>${formatKey(category)}</td>
      <td>${(amount as number).toLocaleString()} €</td>
      <td>${percentage.toFixed(1)}%</td>
    </tr>`;
  }
  
  html += '</tbody></table>';
  return html;
}

function generateCycleAnalysisTable(cycleAnalyses: any[]): string {
  if (!cycleAnalyses || cycleAnalyses.length === 0) return '';
  
  let html = '<h2>Analyse des Cycles</h2><table class="table"><thead><tr>';
  html += '<th>Cycle</th><th>Durée (j)</th><th>ROI (%)</th><th>Survie (%)</th><th>Profit (€)</th>';
  html += '</tr></thead><tbody>';
  
  for (const cycle of cycleAnalyses) {
    html += `<tr>
      <td>${cycle.cycleId.slice(-8)}</td>
      <td>${cycle.duration}</td>
      <td class="${cycle.roi > 20 ? 'positive' : cycle.roi > 10 ? 'warning' : 'negative'}">${cycle.roi}%</td>
      <td class="${cycle.survivalRate > 90 ? 'positive' : 'warning'}">${cycle.survivalRate.toFixed(1)}%</td>
      <td class="${cycle.profit > 0 ? 'positive' : 'negative'}">${cycle.profit.toLocaleString()} €</td>
    </tr>`;
  }
  
  html += '</tbody></table>';
  return html;
}

function formatKey(key: string): string {
  const labels = {
    'totalFeeding': 'Alimentation Totale',
    'feedingSessions': 'Sessions Alimentation',
    'avgFCR': 'FCR Moyen',
    'totalMortality': 'Mortalité Totale',
    'revenue': 'Chiffre d\'Affaires',
    'totalCosts': 'Coûts Totaux',
    'profit': 'Profit',
    'profitMargin': 'Marge (%)',
    'feeding': 'Alimentation',
    'labor': 'Personnel',
    'veterinary': 'Vétérinaire',
    'equipment': 'Équipement',
    'other': 'Autres'
  };
  return labels[key] || key;
}

function formatValue(value: any): string {
  if (typeof value === 'number') {
    if (value > 1000) {
      return value.toLocaleString();
    }
    return value.toFixed(2);
  }
  return String(value);
}