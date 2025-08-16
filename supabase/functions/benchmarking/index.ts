import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BenchmarkMetrics {
  fcr_average: number;
  survival_rate: number;
  growth_rate: number;
  cost_per_kg: number;
  profit_margin: number;
  cycle_duration: number;
  roi_percentage: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, action, filters } = await req.json();

    if (action === 'get_benchmarks') {
      // Récupérer les benchmarks anonymisés de l'industrie
      const industryBenchmarks = await calculateIndustryBenchmarks(supabase, filters);
      const userMetrics = await calculateUserMetrics(supabase, user_id, filters);
      
      return new Response(JSON.stringify({
        success: true,
        user_metrics: userMetrics,
        industry_benchmarks: industryBenchmarks,
        comparisons: generateComparisons(userMetrics, industryBenchmarks),
        recommendations: generateBenchmarkRecommendations(userMetrics, industryBenchmarks)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get_regional_benchmarks') {
      const { region, species } = filters || {};
      
      // Benchmarks régionaux anonymisés
      const regionalData = await calculateRegionalBenchmarks(supabase, region, species);
      const userPerformance = await calculateUserMetrics(supabase, user_id, { species });

      return new Response(JSON.stringify({
        success: true,
        regional_data: regionalData,
        user_position: calculateUserPosition(userPerformance, regionalData),
        improvement_potential: calculateImprovementPotential(userPerformance, regionalData)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get_best_practices') {
      // Identifier les meilleures pratiques basées sur les données anonymisées
      const bestPractices = await identifyBestPractices(supabase, filters);
      
      return new Response(JSON.stringify({
        success: true,
        best_practices: bestPractices,
        implementation_guide: generateImplementationGuide(bestPractices, user_id)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get_performance_ranking') {
      const ranking = await calculatePerformanceRanking(supabase, user_id, filters);
      
      return new Response(JSON.stringify({
        success: true,
        ranking
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'submit_anonymous_data') {
      // Permettre aux utilisateurs de contribuer aux benchmarks de manière anonyme
      const { metrics, consent } = await req.json();
      
      if (consent) {
        await submitAnonymousMetrics(supabase, metrics, filters);
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Données anonymes soumises avec succès'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in benchmarking:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function calculateIndustryBenchmarks(supabase: any, filters: any): Promise<BenchmarkMetrics> {
  // Calculs basés sur des données agrégées anonymisées
  const species = filters?.species || 'tilapia';
  
  // Benchmarks théoriques basés sur les standards de l'industrie
  const benchmarks: Record<string, BenchmarkMetrics> = {
    tilapia: {
      fcr_average: 1.6,
      survival_rate: 92,
      growth_rate: 2.8,
      cost_per_kg: 3.2,
      profit_margin: 28,
      cycle_duration: 180,
      roi_percentage: 22
    },
    trout: {
      fcr_average: 1.4,
      survival_rate: 89,
      growth_rate: 3.2,
      cost_per_kg: 4.1,
      profit_margin: 25,
      cycle_duration: 200,
      roi_percentage: 20
    },
    salmon: {
      fcr_average: 1.3,
      survival_rate: 87,
      growth_rate: 3.5,
      cost_per_kg: 5.2,
      profit_margin: 30,
      cycle_duration: 240,
      roi_percentage: 25
    }
  };

  return benchmarks[species] || benchmarks.tilapia;
}

async function calculateUserMetrics(supabase: any, user_id: string, filters: any): Promise<BenchmarkMetrics> {
  // Récupérer les métriques de l'utilisateur
  const { data: cages } = await supabase
    .from('cages')
    .select('*')
    .eq('user_id', user_id);

  const { data: cycles } = await supabase
    .from('production_cycles')
    .select('*')
    .eq('user_id', user_id)
    .eq('statut', 'termine');

  if (!cages?.length) {
    return {
      fcr_average: 0,
      survival_rate: 0,
      growth_rate: 0,
      cost_per_kg: 0,
      profit_margin: 0,
      cycle_duration: 0,
      roi_percentage: 0
    };
  }

  // Calculer les métriques moyennes
  const avgFCR = cages.reduce((sum, cage) => sum + (cage.fcr || 0), 0) / cages.length;
  const avgSurvival = cages.reduce((sum, cage) => sum + (100 - (cage.taux_mortalite || 0)), 0) / cages.length;
  
  let avgROI = 0;
  let avgCycleDuration = 180;
  let avgProfitMargin = 0;

  if (cycles?.length) {
    avgROI = cycles.reduce((sum, cycle) => sum + (cycle.marge_beneficiaire || 0), 0) / cycles.length;
    avgCycleDuration = cycles.reduce((sum, cycle) => {
      const duration = cycle.date_fin_reelle 
        ? Math.floor((new Date(cycle.date_fin_reelle).getTime() - new Date(cycle.date_debut).getTime()) / (1000 * 60 * 60 * 24))
        : 180;
      return sum + duration;
    }, 0) / cycles.length;
    avgProfitMargin = cycles.reduce((sum, cycle) => {
      const margin = cycle.revenu_total > 0 
        ? ((cycle.revenu_total - cycle.cout_total) / cycle.revenu_total) * 100
        : 0;
      return sum + margin;
    }, 0) / cycles.length;
  }

  return {
    fcr_average: Math.round(avgFCR * 100) / 100,
    survival_rate: Math.round(avgSurvival * 10) / 10,
    growth_rate: 2.5, // Estimation
    cost_per_kg: 3.8, // Estimation
    profit_margin: Math.round(avgProfitMargin * 10) / 10,
    cycle_duration: Math.round(avgCycleDuration),
    roi_percentage: Math.round(avgROI * 10) / 10
  };
}

async function calculateRegionalBenchmarks(supabase: any, region: string, species: string) {
  // Données régionales simulées (dans un vrai système, cela viendrait d'une base de données centralisée)
  const regionalData = {
    'europe': {
      avg_fcr: 1.5,
      avg_survival: 90,
      avg_roi: 20,
      avg_cost_per_kg: 3.8,
      top_10_percentile: { fcr: 1.3, survival: 95, roi: 28 },
      median: { fcr: 1.6, survival: 88, roi: 18 },
      total_farms: 150
    },
    'africa': {
      avg_fcr: 1.8,
      avg_survival: 85,
      avg_roi: 25,
      avg_cost_per_kg: 2.9,
      top_10_percentile: { fcr: 1.4, survival: 92, roi: 35 },
      median: { fcr: 1.9, survival: 83, roi: 22 },
      total_farms: 89
    },
    'asia': {
      avg_fcr: 1.7,
      avg_survival: 87,
      avg_roi: 22,
      avg_cost_per_kg: 3.1,
      top_10_percentile: { fcr: 1.4, survival: 93, roi: 30 },
      median: { fcr: 1.8, survival: 85, roi: 20 },
      total_farms: 320
    }
  };

  return regionalData[region] || regionalData['africa'];
}

function generateComparisons(userMetrics: BenchmarkMetrics, industryBenchmarks: BenchmarkMetrics) {
  return {
    fcr: {
      user: userMetrics.fcr_average,
      industry: industryBenchmarks.fcr_average,
      difference: userMetrics.fcr_average - industryBenchmarks.fcr_average,
      performance: userMetrics.fcr_average <= industryBenchmarks.fcr_average ? 'above' : 'below'
    },
    survival_rate: {
      user: userMetrics.survival_rate,
      industry: industryBenchmarks.survival_rate,
      difference: userMetrics.survival_rate - industryBenchmarks.survival_rate,
      performance: userMetrics.survival_rate >= industryBenchmarks.survival_rate ? 'above' : 'below'
    },
    roi: {
      user: userMetrics.roi_percentage,
      industry: industryBenchmarks.roi_percentage,
      difference: userMetrics.roi_percentage - industryBenchmarks.roi_percentage,
      performance: userMetrics.roi_percentage >= industryBenchmarks.roi_percentage ? 'above' : 'below'
    },
    profit_margin: {
      user: userMetrics.profit_margin,
      industry: industryBenchmarks.profit_margin,
      difference: userMetrics.profit_margin - industryBenchmarks.profit_margin,
      performance: userMetrics.profit_margin >= industryBenchmarks.profit_margin ? 'above' : 'below'
    }
  };
}

function generateBenchmarkRecommendations(userMetrics: BenchmarkMetrics, industryBenchmarks: BenchmarkMetrics) {
  const recommendations = [];

  if (userMetrics.fcr_average > industryBenchmarks.fcr_average + 0.2) {
    recommendations.push({
      category: 'Efficacité alimentaire',
      priority: 'high',
      title: 'Améliorer le FCR',
      description: `Votre FCR de ${userMetrics.fcr_average} est supérieur à la moyenne de ${industryBenchmarks.fcr_average}`,
      actions: [
        'Optimiser la qualité des aliments',
        'Ajuster les horaires d\'alimentation',
        'Surveiller la température de l\'eau',
        'Réduire le stress des poissons'
      ],
      potential_impact: `Économies potentielles: ${Math.round((userMetrics.fcr_average - industryBenchmarks.fcr_average) * 1000)}€/tonne produite`
    });
  }

  if (userMetrics.survival_rate < industryBenchmarks.survival_rate - 5) {
    recommendations.push({
      category: 'Gestion sanitaire',
      priority: 'critical',
      title: 'Améliorer le taux de survie',
      description: `Votre taux de survie de ${userMetrics.survival_rate}% est inférieur à la moyenne de ${industryBenchmarks.survival_rate}%`,
      actions: [
        'Renforcer les protocoles sanitaires',
        'Améliorer la qualité de l\'eau',
        'Optimiser la densité d\'élevage',
        'Formation en biosécurité'
      ],
      potential_impact: `Augmentation potentielle du profit: ${Math.round((industryBenchmarks.survival_rate - userMetrics.survival_rate) * 2)}%`
    });
  }

  if (userMetrics.roi_percentage < industryBenchmarks.roi_percentage - 3) {
    recommendations.push({
      category: 'Rentabilité',
      priority: 'high',
      title: 'Optimiser le ROI',
      description: `Votre ROI de ${userMetrics.roi_percentage}% peut être amélioré`,
      actions: [
        'Réviser la stratégie de prix',
        'Optimiser les coûts de production',
        'Diversifier les canaux de vente',
        'Améliorer l\'efficacité opérationnelle'
      ],
      potential_impact: `ROI potentiel: ${industryBenchmarks.roi_percentage}%`
    });
  }

  return recommendations;
}

async function identifyBestPractices(supabase: any, filters: any) {
  // Identifier les meilleures pratiques basées sur les données de performance
  return [
    {
      category: 'Alimentation',
      practice: 'Alimentation multi-fréquence',
      description: 'Les fermes performantes utilisent 4-6 repas par jour vs 2-3 pour la moyenne',
      impact: 'Amélioration FCR de 15-20%',
      implementation: 'Progressif sur 2-3 semaines',
      cost: 'Faible - juste réorganisation'
    },
    {
      category: 'Qualité eau',
      practice: 'Monitoring automatisé',
      description: 'Surveillance continue vs mesures manuelles 2x/jour',
      impact: 'Réduction mortalité de 30%',
      implementation: 'Capteurs IoT + formation',
      cost: 'Modéré - 800-1200€ par cage'
    },
    {
      category: 'Densité',
      practice: 'Densité adaptative',
      description: 'Ajustement de la densité selon la phase de croissance',
      impact: 'Amélioration croissance de 25%',
      implementation: 'Planification et équipement',
      cost: 'Variable selon infrastructure'
    },
    {
      category: 'Santé',
      practice: 'Prévention intégrée',
      description: 'Protocoles préventifs vs traitement curatif',
      impact: 'Réduction coûts médicaments de 40%',
      implementation: 'Formation et protocoles',
      cost: 'Faible - principalement formation'
    }
  ];
}

function generateImplementationGuide(bestPractices: any[], user_id: string) {
  return bestPractices.map(practice => ({
    ...practice,
    implementation_steps: [
      `Évaluation de votre situation actuelle pour ${practice.category}`,
      `Formation équipe sur les nouvelles procédures`,
      `Test pilote sur une cage`,
      `Déploiement progressif`,
      `Monitoring des résultats`
    ],
    timeline: '2-8 semaines selon la complexité',
    support_available: true
  }));
}

async function calculatePerformanceRanking(supabase: any, user_id: string, filters: any) {
  const userMetrics = await calculateUserMetrics(supabase, user_id, filters);
  const industryBenchmarks = await calculateIndustryBenchmarks(supabase, filters);

  // Calcul du score composite (0-100)
  const fcrScore = Math.max(0, 100 - ((userMetrics.fcr_average - 1.0) / 1.5) * 100);
  const survivalScore = userMetrics.survival_rate;
  const roiScore = Math.min(100, (userMetrics.roi_percentage / 30) * 100);
  
  const compositeScore = (fcrScore * 0.3 + survivalScore * 0.4 + roiScore * 0.3);
  
  let percentile = 50; // Par défaut médiane
  if (compositeScore >= 85) percentile = 90;
  else if (compositeScore >= 75) percentile = 75;
  else if (compositeScore >= 60) percentile = 60;
  else if (compositeScore <= 30) percentile = 25;

  return {
    composite_score: Math.round(compositeScore),
    percentile,
    ranking_category: getRankingCategory(percentile),
    areas_of_excellence: getAreasOfExcellence(userMetrics, industryBenchmarks),
    improvement_priorities: getImprovementPriorities(userMetrics, industryBenchmarks)
  };
}

function getRankingCategory(percentile: number): string {
  if (percentile >= 90) return 'Elite (Top 10%)';
  if (percentile >= 75) return 'Excellente (Top 25%)';
  if (percentile >= 60) return 'Bonne (Top 40%)';
  if (percentile >= 40) return 'Moyenne';
  return 'À améliorer';
}

function getAreasOfExcellence(userMetrics: BenchmarkMetrics, industryBenchmarks: BenchmarkMetrics) {
  const excellence = [];
  
  if (userMetrics.fcr_average <= industryBenchmarks.fcr_average * 0.9) {
    excellence.push('Efficacité alimentaire exceptionnelle');
  }
  if (userMetrics.survival_rate >= industryBenchmarks.survival_rate * 1.05) {
    excellence.push('Gestion sanitaire excellente');
  }
  if (userMetrics.roi_percentage >= industryBenchmarks.roi_percentage * 1.1) {
    excellence.push('Rentabilité supérieure');
  }
  
  return excellence;
}

function getImprovementPriorities(userMetrics: BenchmarkMetrics, industryBenchmarks: BenchmarkMetrics) {
  const priorities = [];
  
  if (userMetrics.fcr_average > industryBenchmarks.fcr_average * 1.15) {
    priorities.push({ area: 'FCR', urgency: 'high', potential: 'Réduction coûts 15-25%' });
  }
  if (userMetrics.survival_rate < industryBenchmarks.survival_rate * 0.9) {
    priorities.push({ area: 'Survie', urgency: 'critical', potential: 'Augmentation profit 20-30%' });
  }
  if (userMetrics.roi_percentage < industryBenchmarks.roi_percentage * 0.8) {
    priorities.push({ area: 'ROI', urgency: 'high', potential: 'Amélioration rentabilité 25%+' });
  }
  
  return priorities;
}

function calculateUserPosition(userPerformance: BenchmarkMetrics, regionalData: any) {
  return {
    fcr_position: userPerformance.fcr_average <= regionalData.median.fcr ? 'above_median' : 'below_median',
    survival_position: userPerformance.survival_rate >= regionalData.median.survival ? 'above_median' : 'below_median',
    roi_position: userPerformance.roi_percentage >= regionalData.median.roi ? 'above_median' : 'below_median',
    overall_position: 'median' // Calcul plus complexe dans un vrai système
  };
}

function calculateImprovementPotential(userPerformance: BenchmarkMetrics, regionalData: any) {
  return {
    fcr_improvement: Math.max(0, userPerformance.fcr_average - regionalData.top_10_percentile.fcr),
    survival_improvement: Math.max(0, regionalData.top_10_percentile.survival - userPerformance.survival_rate),
    roi_improvement: Math.max(0, regionalData.top_10_percentile.roi - userPerformance.roi_percentage),
    financial_impact: calculateFinancialImpact(userPerformance, regionalData.top_10_percentile)
  };
}

function calculateFinancialImpact(current: BenchmarkMetrics, target: any) {
  // Estimation de l'impact financier d'atteindre le top 10%
  const estimatedProduction = 10000; // kg/an estimation
  const currentProfit = estimatedProduction * 6 * (current.profit_margin / 100);
  const targetProfitMargin = (target.roi / 100) * 1.2; // Estimation
  const targetProfit = estimatedProduction * 6 * targetProfitMargin;
  
  return {
    additional_profit_per_year: Math.round(targetProfit - currentProfit),
    roi_improvement_percentage: Math.round(((targetProfit / currentProfit) - 1) * 100)
  };
}

async function submitAnonymousMetrics(supabase: any, metrics: any, filters: any) {
  // Dans un vrai système, cela serait stocké dans une base de données centralisée
  // pour alimenter les benchmarks de l'industrie
  console.log('Anonymous metrics submitted:', { metrics, filters });
}