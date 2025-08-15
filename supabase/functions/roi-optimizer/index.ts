import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { user_id, optimization_type = 'comprehensive' } = await req.json();

    console.log('Generating ROI optimization for user:', user_id);

    // Récupérer toutes les données nécessaires
    const [cagesData, feedingData, salesData, costsData, waterQualityData] = await Promise.all([
      supabaseClient.from('cages').select('*').eq('user_id', user_id),
      supabaseClient.from('feeding_sessions').select('*').eq('user_id', user_id),
      supabaseClient.from('sales').select('*').eq('user_id', user_id),
      supabaseClient.from('cost_tracking').select('*').eq('user_id', user_id),
      supabaseClient.from('water_quality').select('*').eq('user_id', user_id)
    ]);

    if (cagesData.error || feedingData.error || salesData.error || costsData.error) {
      throw new Error('Failed to fetch required data');
    }

    // Analyser les performances actuelles
    const currentPerformance = analyzeCurrentPerformance(
      cagesData.data,
      feedingData.data,
      salesData.data,
      costsData.data,
      waterQualityData.data
    );

    // Identifier les opportunités d'optimisation
    const optimizationOpportunities = identifyOptimizationOpportunities(currentPerformance);

    // Calculer les projections ROI
    const roiProjections = calculateROIProjections(currentPerformance, optimizationOpportunities);

    // Générer le plan d'action
    const actionPlan = generateActionPlan(optimizationOpportunities);

    return new Response(JSON.stringify({
      success: true,
      data: {
        current_performance: currentPerformance,
        optimization_opportunities: optimizationOpportunities,
        roi_projections: roiProjections,
        action_plan: actionPlan,
        priority_actions: actionPlan.filter(action => action.priority === 'critical' || action.priority === 'high'),
        expected_improvement: calculateExpectedImprovement(optimizationOpportunities)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in roi-optimizer function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzeCurrentPerformance(cages: any[], feeding: any[], sales: any[], costs: any[], waterQuality: any[]) {
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.prix_total, 0);
  const totalCosts = costs.reduce((sum, cost) => sum + cost.montant, 0);
  const totalFeedCosts = feeding.reduce((sum, feed) => sum + (feed.quantite * 1.2), 0); // 1.2€/kg estimation
  
  const totalInvestment = totalCosts + totalFeedCosts;
  const netProfit = totalRevenue - totalInvestment;
  const currentROI = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

  // Analyser par cage
  const cagePerformance = cages.map(cage => {
    const cageSales = sales.filter(s => s.cage_id === cage.id);
    const cageCosts = costs.filter(c => c.cage_id === cage.id);
    const cageFeeding = feeding.filter(f => f.cage_id === cage.id);
    
    const cageRevenue = cageSales.reduce((sum, sale) => sum + sale.prix_total, 0);
    const cageCostTotal = cageCosts.reduce((sum, cost) => sum + cost.montant, 0);
    const cageFeedCost = cageFeeding.reduce((sum, feed) => sum + (feed.quantite * 1.2), 0);
    const cageTotalInvestment = cageCostTotal + cageFeedCost;
    
    const cageProfit = cageRevenue - cageTotalInvestment;
    const cageROI = cageTotalInvestment > 0 ? (cageProfit / cageTotalInvestment) * 100 : 0;
    
    return {
      cage_id: cage.id,
      cage_name: cage.nom,
      revenue: cageRevenue,
      costs: cageTotalInvestment,
      profit: cageProfit,
      roi: cageROI,
      fcr: cage.fcr || 0,
      mortality_rate: cage.taux_mortalite || 0,
      biomass: (cage.nombre_poissons || 0) * (cage.poids_moyen || 0),
      performance_score: calculatePerformanceScore(cage, cageROI)
    };
  });

  return {
    global_metrics: {
      total_revenue: totalRevenue,
      total_costs: totalInvestment,
      net_profit: netProfit,
      roi_percentage: currentROI,
      profit_margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    },
    cage_performance: cagePerformance,
    benchmarks: calculateBenchmarks(cagePerformance),
    efficiency_metrics: calculateEfficiencyMetrics(cages, feeding, sales)
  };
}

function calculatePerformanceScore(cage: any, roi: number): number {
  let score = 50; // Base score
  
  // FCR impact (30% of score)
  if (cage.fcr < 1.5) score += 20;
  else if (cage.fcr < 2.0) score += 10;
  else if (cage.fcr > 2.5) score -= 15;
  
  // Mortality impact (25% of score)
  if (cage.taux_mortalite < 3) score += 15;
  else if (cage.taux_mortalite < 5) score += 8;
  else if (cage.taux_mortalite > 10) score -= 20;
  
  // ROI impact (35% of score)
  if (roi > 25) score += 25;
  else if (roi > 15) score += 15;
  else if (roi > 5) score += 5;
  else if (roi < -5) score -= 20;
  
  // Growth rate impact (10% of score)
  const growthMatch = cage.croissance?.match(/(\d+\.?\d*)%/);
  if (growthMatch) {
    const growthRate = parseFloat(growthMatch[1]);
    if (growthRate > 2) score += 10;
    else if (growthRate > 1) score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

function calculateBenchmarks(cagePerformance: any[]) {
  if (cagePerformance.length === 0) return null;
  
  const rois = cagePerformance.map(c => c.roi);
  const fcrs = cagePerformance.map(c => c.fcr).filter(fcr => fcr > 0);
  const mortalities = cagePerformance.map(c => c.mortality_rate);
  
  return {
    average_roi: rois.reduce((sum, roi) => sum + roi, 0) / rois.length,
    best_roi: Math.max(...rois),
    worst_roi: Math.min(...rois),
    average_fcr: fcrs.reduce((sum, fcr) => sum + fcr, 0) / fcrs.length,
    best_fcr: Math.min(...fcrs),
    average_mortality: mortalities.reduce((sum, mort) => sum + mort, 0) / mortalities.length,
    top_performer: cagePerformance.reduce((best, current) => 
      current.performance_score > best.performance_score ? current : best
    )
  };
}

function calculateEfficiencyMetrics(cages: any[], feeding: any[], sales: any[]) {
  const totalBiomass = cages.reduce((sum, cage) => sum + ((cage.nombre_poissons || 0) * (cage.poids_moyen || 0)), 0);
  const totalFeed = feeding.reduce((sum, feed) => sum + feed.quantite, 0);
  const totalSalesWeight = sales.reduce((sum, sale) => sum + sale.quantite_kg, 0);
  
  return {
    feed_conversion_efficiency: totalSalesWeight > 0 ? totalFeed / totalSalesWeight : 0,
    biomass_density: totalBiomass / Math.max(1, cages.length),
    production_efficiency: totalSalesWeight / Math.max(1, cages.filter(c => c.statut === 'en_production').length),
    cost_per_kg: totalSalesWeight > 0 ? feeding.reduce((sum, f) => sum + (f.quantite * 1.2), 0) / totalSalesWeight : 0
  };
}

function identifyOptimizationOpportunities(performance: any) {
  const opportunities = [];
  
  // Analyser chaque cage pour les opportunités
  performance.cage_performance.forEach((cage: any) => {
    // Opportunité FCR
    if (cage.fcr > 2.0) {
      opportunities.push({
        type: 'fcr_optimization',
        cage_id: cage.cage_id,
        cage_name: cage.cage_name,
        current_value: cage.fcr,
        target_value: 1.8,
        potential_savings: calculateFCRSavings(cage),
        priority: cage.fcr > 2.5 ? 'critical' : 'high',
        implementation_effort: 'medium',
        estimated_roi_improvement: calculateFCRROIImprovement(cage)
      });
    }
    
    // Opportunité mortalité
    if (cage.mortality_rate > 5) {
      opportunities.push({
        type: 'mortality_reduction',
        cage_id: cage.cage_id,
        cage_name: cage.cage_name,
        current_value: cage.mortality_rate,
        target_value: 3,
        potential_savings: calculateMortalitySavings(cage),
        priority: cage.mortality_rate > 10 ? 'critical' : 'high',
        implementation_effort: 'high',
        estimated_roi_improvement: calculateMortalityROIImprovement(cage)
      });
    }
    
    // Opportunité prix de vente
    if (cage.roi < 15 && cage.roi > 0) {
      opportunities.push({
        type: 'pricing_optimization',
        cage_id: cage.cage_id,
        cage_name: cage.cage_name,
        current_roi: cage.roi,
        target_roi: 20,
        potential_revenue_increase: calculatePricingOpportunity(cage),
        priority: 'medium',
        implementation_effort: 'low',
        estimated_roi_improvement: 5
      });
    }
  });
  
  // Opportunités globales
  if (performance.global_metrics.roi_percentage < 20) {
    opportunities.push({
      type: 'global_efficiency',
      description: 'Optimisation globale de l\'efficacité opérationnelle',
      potential_improvement: calculateGlobalOptimization(performance),
      priority: 'high',
      implementation_effort: 'high',
      estimated_roi_improvement: 8
    });
  }
  
  return opportunities.sort((a, b) => {
    const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
    return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
  });
}

function calculateFCRSavings(cage: any): number {
  const currentFCR = cage.fcr;
  const targetFCR = 1.8;
  const improvement = currentFCR - targetFCR;
  
  // Estimation des économies basées sur la biomasse et le coût de l'aliment
  const feedCostPerKg = 1.2;
  const estimatedBiomass = cage.biomass || 100;
  
  return improvement * estimatedBiomass * feedCostPerKg;
}

function calculateFCRROIImprovement(cage: any): number {
  const fcrImprovement = Math.max(0, cage.fcr - 1.8);
  return Math.min(15, fcrImprovement * 8); // Max 15% improvement
}

function calculateMortalitySavings(cage: any): number {
  const currentMortality = cage.mortality_rate;
  const targetMortality = 3;
  const improvement = currentMortality - targetMortality;
  
  // Économies basées sur la valeur des poissons sauvés
  const fishValue = 6; // 6€/kg
  const avgWeight = 0.5; // 500g
  const totalFish = cage.biomass / avgWeight;
  
  return improvement / 100 * totalFish * avgWeight * fishValue;
}

function calculateMortalityROIImprovement(cage: any): number {
  const mortalityImprovement = Math.max(0, cage.mortality_rate - 3);
  return Math.min(20, mortalityImprovement * 2); // Max 20% improvement
}

function calculatePricingOpportunity(cage: any): number {
  // Estimation d'augmentation de prix de 5-10%
  return cage.revenue * 0.075;
}

function calculateGlobalOptimization(performance: any): number {
  const currentROI = performance.global_metrics.roi_percentage;
  const targetROI = 25;
  return Math.max(0, targetROI - currentROI);
}

function calculateROIProjections(performance: any, opportunities: any[]) {
  const currentROI = performance.global_metrics.roi_percentage;
  const totalPotentialImprovement = opportunities.reduce((sum, opp) => sum + (opp.estimated_roi_improvement || 0), 0);
  
  const projections = {
    current_roi: currentROI,
    optimized_roi: currentROI + totalPotentialImprovement,
    improvement_potential: totalPotentialImprovement,
    timeframe_months: 6,
    confidence_level: 0.8
  };
  
  // Projections par scénario
  const scenarios = {
    conservative: {
      roi_improvement: totalPotentialImprovement * 0.5,
      probability: 0.9,
      timeframe: 8
    },
    realistic: {
      roi_improvement: totalPotentialImprovement * 0.75,
      probability: 0.7,
      timeframe: 6
    },
    optimistic: {
      roi_improvement: totalPotentialImprovement,
      probability: 0.4,
      timeframe: 4
    }
  };
  
  return {
    ...projections,
    scenarios,
    break_even_analysis: calculateBreakEvenAnalysis(performance, opportunities)
  };
}

function calculateBreakEvenAnalysis(performance: any, opportunities: any[]) {
  const implementationCosts = opportunities.reduce((sum, opp) => {
    const costEstimate = {
      fcr_optimization: 500,
      mortality_reduction: 1000,
      pricing_optimization: 100,
      global_efficiency: 2000
    };
    return sum + (costEstimate[opp.type as keyof typeof costEstimate] || 200);
  }, 0);
  
  const monthlyBenefit = opportunities.reduce((sum, opp) => {
    return sum + ((opp.potential_savings || 0) / 12);
  }, 0);
  
  return {
    implementation_cost: implementationCosts,
    monthly_benefit: monthlyBenefit,
    break_even_months: monthlyBenefit > 0 ? implementationCosts / monthlyBenefit : null,
    net_benefit_year_1: (monthlyBenefit * 12) - implementationCosts
  };
}

function generateActionPlan(opportunities: any[]) {
  return opportunities.map(opp => ({
    id: `action-${opp.type}-${opp.cage_id || 'global'}`,
    title: getActionTitle(opp),
    description: getActionDescription(opp),
    priority: opp.priority,
    effort: opp.implementation_effort,
    estimated_impact: opp.estimated_roi_improvement,
    timeline: getTimeline(opp),
    required_resources: getRequiredResources(opp),
    success_metrics: getSuccessMetrics(opp),
    cage_id: opp.cage_id
  }));
}

function getActionTitle(opp: any): string {
  const titles = {
    fcr_optimization: `Optimiser l'efficacité alimentaire - ${opp.cage_name}`,
    mortality_reduction: `Réduire la mortalité - ${opp.cage_name}`,
    pricing_optimization: `Optimiser les prix de vente - ${opp.cage_name}`,
    global_efficiency: 'Améliorer l\'efficacité globale'
  };
  return titles[opp.type as keyof typeof titles] || 'Action d\'optimisation';
}

function getActionDescription(opp: any): string {
  const descriptions = {
    fcr_optimization: `Réduire le FCR de ${opp.current_value} à ${opp.target_value} par optimisation alimentaire`,
    mortality_reduction: `Diminuer la mortalité de ${opp.current_value}% à ${opp.target_value}% par amélioration sanitaire`,
    pricing_optimization: `Augmenter les prix de vente pour améliorer la marge`,
    global_efficiency: 'Optimisation des processus et standardisation des bonnes pratiques'
  };
  return descriptions[opp.type as keyof typeof descriptions] || 'Optimisation non définie';
}

function getTimeline(opp: any): string {
  const timelines = {
    fcr_optimization: '2-4 semaines',
    mortality_reduction: '1-3 mois',
    pricing_optimization: '1-2 semaines',
    global_efficiency: '3-6 mois'
  };
  return timelines[opp.type as keyof typeof timelines] || '1-2 mois';
}

function getRequiredResources(opp: any): string[] {
  const resources = {
    fcr_optimization: ['Révision plan alimentaire', 'Formation équipe', 'Suivi hebdomadaire'],
    mortality_reduction: ['Analyse vétérinaire', 'Amélioration infrastructure', 'Protocoles sanitaires'],
    pricing_optimization: ['Étude marché', 'Négociation clients', 'Stratégie commerciale'],
    global_efficiency: ['Audit complet', 'Formation équipe', 'Système de suivi']
  };
  return resources[opp.type as keyof typeof resources] || ['Ressources à définir'];
}

function getSuccessMetrics(opp: any): string[] {
  const metrics = {
    fcr_optimization: [`FCR < ${opp.target_value}`, 'Réduction coûts aliment 15%'],
    mortality_reduction: [`Mortalité < ${opp.target_value}%`, 'Augmentation survie 20%'],
    pricing_optimization: ['Prix moyen +7%', 'Marge améliorée'],
    global_efficiency: ['ROI global +8%', 'Efficacité +15%']
  };
  return metrics[opp.type as keyof typeof metrics] || ['Métriques à définir'];
}

function calculateExpectedImprovement(opportunities: any[]) {
  const totalROIImprovement = opportunities.reduce((sum, opp) => sum + (opp.estimated_roi_improvement || 0), 0);
  const totalSavings = opportunities.reduce((sum, opp) => sum + (opp.potential_savings || 0), 0);
  
  return {
    roi_improvement_percentage: totalROIImprovement,
    annual_savings_euro: totalSavings,
    payback_period_months: 4,
    confidence_level: 0.75,
    risk_factors: [
      'Conditions météorologiques',
      'Fluctuations du marché',
      'Mise en œuvre des actions'
    ]
  };
}