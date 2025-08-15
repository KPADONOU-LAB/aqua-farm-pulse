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

    const { user_id, cage_id, prediction_horizon = 30 } = await req.json();

    console.log('Generating price predictions for user:', user_id);

    // Récupérer les données historiques des ventes
    const { data: salesData, error: salesError } = await supabaseClient
      .from('sales')
      .select('*')
      .eq('user_id', user_id)
      .order('date_vente', { ascending: true });

    if (salesError) {
      console.error('Error fetching sales data:', salesError);
      throw salesError;
    }

    // Récupérer les données de cages pour contexte
    const { data: cageData, error: cageError } = await supabaseClient
      .from('cages')
      .select('*')
      .eq('user_id', user_id)
      .eq('id', cage_id || '');

    if (cageError && cage_id) {
      console.error('Error fetching cage data:', cageError);
    }

    // Analyse des tendances de prix
    const priceAnalysis = analyzePriceTrends(salesData);
    
    // Prédictions de prix basées sur les données
    const predictions = generatePricePredictions(priceAnalysis, prediction_horizon, cageData?.[0]);
    
    // Recommandations de vente optimales
    const recommendations = generateSellingRecommendations(predictions, cageData?.[0]);

    return new Response(JSON.stringify({
      success: true,
      data: {
        current_market_analysis: priceAnalysis,
        price_predictions: predictions,
        selling_recommendations: recommendations,
        optimal_selling_periods: findOptimalSellingPeriods(predictions),
        market_factors: getMarketFactors()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in price-predictions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function analyzePriceTrends(salesData: any[]) {
  if (!salesData || salesData.length === 0) {
    return {
      average_price: 6.0,
      price_trend: 'stable',
      seasonal_patterns: {},
      quality_premium: 0.15,
      market_volatility: 0.1
    };
  }

  // Calculer le prix moyen et les tendances
  const prices = salesData.map(sale => sale.prix_par_kg);
  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  
  // Analyser les tendances saisonnières
  const monthlyPrices: { [key: number]: number[] } = {};
  salesData.forEach(sale => {
    const month = new Date(sale.date_vente).getMonth();
    if (!monthlyPrices[month]) monthlyPrices[month] = [];
    monthlyPrices[month].push(sale.prix_par_kg);
  });

  const seasonalPatterns: { [key: number]: number } = {};
  Object.keys(monthlyPrices).forEach(month => {
    const monthNum = parseInt(month);
    seasonalPatterns[monthNum] = monthlyPrices[monthNum].reduce((sum, price) => sum + price, 0) / monthlyPrices[monthNum].length;
  });

  // Déterminer la tendance
  const recentPrices = prices.slice(-5);
  const earlierPrices = prices.slice(0, 5);
  const recentAvg = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
  const earlierAvg = earlierPrices.reduce((sum, price) => sum + price, 0) / earlierPrices.length;
  
  let trend = 'stable';
  if (recentAvg > earlierAvg * 1.05) trend = 'increasing';
  else if (recentAvg < earlierAvg * 0.95) trend = 'decreasing';

  // Calculer la volatilité
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - averagePrice, 2), 0) / prices.length;
  const volatility = Math.sqrt(variance) / averagePrice;

  return {
    average_price: averagePrice,
    price_trend: trend,
    seasonal_patterns: seasonalPatterns,
    quality_premium: calculateQualityPremium(salesData),
    market_volatility: volatility
  };
}

function calculateQualityPremium(salesData: any[]): number {
  // Analyse de la prime de qualité basée sur les ventes
  const premiumSales = salesData.filter(sale => sale.prix_par_kg > 6.5);
  const standardSales = salesData.filter(sale => sale.prix_par_kg <= 6.5);
  
  if (premiumSales.length === 0 || standardSales.length === 0) return 0.15;
  
  const premiumAvg = premiumSales.reduce((sum, sale) => sum + sale.prix_par_kg, 0) / premiumSales.length;
  const standardAvg = standardSales.reduce((sum, sale) => sum + sale.prix_par_kg, 0) / standardSales.length;
  
  return (premiumAvg - standardAvg) / standardAvg;
}

function generatePricePredictions(analysis: any, horizon: number, cageData?: any) {
  const predictions = [];
  const basePrice = analysis.average_price;
  const today = new Date();

  for (let i = 1; i <= horizon; i++) {
    const predictionDate = new Date(today);
    predictionDate.setDate(today.getDate() + i);
    
    const month = predictionDate.getMonth();
    const dayOfYear = Math.floor((predictionDate.getTime() - new Date(predictionDate.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Facteurs saisonniers
    const seasonalFactor = getSeasonalFactor(month);
    
    // Facteurs de tendance
    const trendFactor = getTrendFactor(analysis.price_trend, i);
    
    // Facteur de qualité si on a des données de cage
    const qualityFactor = cageData ? getQualityFactor(cageData) : 1.0;
    
    // Facteur de volatilité du marché
    const volatilityFactor = 1 + (Math.random() - 0.5) * analysis.market_volatility;
    
    const predictedPrice = basePrice * seasonalFactor * trendFactor * qualityFactor * volatilityFactor;
    
    predictions.push({
      date: predictionDate.toISOString().split('T')[0],
      predicted_price: Math.round(predictedPrice * 100) / 100,
      confidence_level: Math.max(0.6, 0.95 - (i / horizon) * 0.35),
      factors: {
        seasonal: seasonalFactor,
        trend: trendFactor,
        quality: qualityFactor,
        market: volatilityFactor
      }
    });
  }

  return predictions;
}

function getSeasonalFactor(month: number): number {
  // Patterns saisonniers pour l'aquaculture (exemple pour tilapia)
  const seasonalMultipliers = {
    0: 1.1,  // Janvier - forte demande
    1: 1.05, // Février
    2: 1.0,  // Mars
    3: 0.95, // Avril
    4: 0.9,  // Mai - production élevée
    5: 0.85, // Juin
    6: 0.9,  // Juillet
    7: 0.95, // Août
    8: 1.0,  // Septembre
    9: 1.05, // Octobre
    10: 1.1, // Novembre - demande fêtes
    11: 1.15 // Décembre - pic demande
  };
  
  return seasonalMultipliers[month as keyof typeof seasonalMultipliers] || 1.0;
}

function getTrendFactor(trend: string, daysAhead: number): number {
  const trendImpact = daysAhead / 365; // Impact progressif sur l'année
  
  switch (trend) {
    case 'increasing':
      return 1 + (0.1 * trendImpact); // +10% par an
    case 'decreasing':
      return 1 - (0.05 * trendImpact); // -5% par an
    default:
      return 1.0;
  }
}

function getQualityFactor(cageData: any): number {
  let qualityScore = 1.0;
  
  // Facteur FCR (plus bas = meilleure qualité)
  if (cageData.fcr) {
    if (cageData.fcr < 1.5) qualityScore += 0.15;
    else if (cageData.fcr < 2.0) qualityScore += 0.05;
    else if (cageData.fcr > 2.5) qualityScore -= 0.1;
  }
  
  // Facteur mortalité (plus bas = meilleure qualité)
  if (cageData.taux_mortalite) {
    if (cageData.taux_mortalite < 3) qualityScore += 0.1;
    else if (cageData.taux_mortalite < 5) qualityScore += 0.05;
    else if (cageData.taux_mortalite > 8) qualityScore -= 0.15;
  }
  
  // Facteur poids (optimum autour de 800g)
  if (cageData.poids_moyen) {
    const optimalWeight = 0.8;
    const weightDiff = Math.abs(cageData.poids_moyen - optimalWeight);
    if (weightDiff < 0.1) qualityScore += 0.05;
    else if (weightDiff > 0.3) qualityScore -= 0.05;
  }
  
  return Math.max(0.8, Math.min(1.3, qualityScore));
}

function generateSellingRecommendations(predictions: any[], cageData?: any) {
  const recommendations = [];
  
  // Trouver les pics de prix
  const maxPrice = Math.max(...predictions.map(p => p.predicted_price));
  const avgPrice = predictions.reduce((sum, p) => sum + p.predicted_price, 0) / predictions.length;
  
  // Recommandations basées sur les prédictions
  const highPricePeriods = predictions.filter(p => p.predicted_price > avgPrice * 1.05);
  const lowPricePeriods = predictions.filter(p => p.predicted_price < avgPrice * 0.95);
  
  if (highPricePeriods.length > 0) {
    recommendations.push({
      type: 'optimal_selling',
      priority: 'high',
      title: 'Période de vente optimale identifiée',
      description: `Prix élevés prévus entre ${highPricePeriods[0].date} et ${highPricePeriods[highPricePeriods.length - 1].date}`,
      action: 'Planifier la récolte pour cette période',
      expected_price: highPricePeriods.reduce((sum, p) => sum + p.predicted_price, 0) / highPricePeriods.length,
      confidence: highPricePeriods.reduce((sum, p) => sum + p.confidence_level, 0) / highPricePeriods.length
    });
  }
  
  if (lowPricePeriods.length > 0) {
    recommendations.push({
      type: 'avoid_selling',
      priority: 'medium',
      title: 'Éviter la vente pendant les prix bas',
      description: `Prix plus bas prévus entre ${lowPricePeriods[0].date} et ${lowPricePeriods[lowPricePeriods.length - 1].date}`,
      action: 'Reporter la récolte si possible',
      expected_price: lowPricePeriods.reduce((sum, p) => sum + p.predicted_price, 0) / lowPricePeriods.length,
      confidence: lowPricePeriods.reduce((sum, p) => sum + p.confidence_level, 0) / lowPricePeriods.length
    });
  }
  
  // Recommandation de qualité si on a des données de cage
  if (cageData) {
    const qualityScore = getQualityFactor(cageData);
    if (qualityScore > 1.1) {
      recommendations.push({
        type: 'premium_pricing',
        priority: 'high',
        title: 'Potentiel de prix premium',
        description: 'Vos métriques de qualité justifient un prix premium',
        action: 'Cibler les acheteurs premium et négocier des prix élevés',
        expected_premium: (qualityScore - 1) * 100,
        confidence: 0.85
      });
    }
  }
  
  return recommendations;
}

function findOptimalSellingPeriods(predictions: any[]) {
  const avgPrice = predictions.reduce((sum, p) => sum + p.predicted_price, 0) / predictions.length;
  
  return predictions
    .filter(p => p.predicted_price > avgPrice * 1.05 && p.confidence_level > 0.7)
    .slice(0, 5)
    .map(p => ({
      date: p.date,
      price: p.predicted_price,
      confidence: p.confidence_level,
      advantage: ((p.predicted_price - avgPrice) / avgPrice * 100).toFixed(1) + '%'
    }));
}

function getMarketFactors() {
  return {
    seasonal_demand: {
      high_season: ['November', 'December', 'January'],
      low_season: ['May', 'June'],
      description: 'Demande élevée pendant les fêtes et période creuse en été'
    },
    external_factors: [
      'Conditions météorologiques affectant l\'offre',
      'Demande des restaurants et hôtels',
      'Importations concurrentes',
      'Réglementations sanitaires'
    ],
    optimization_tips: [
      'Surveiller les prix des concurrents',
      'Maintenir une qualité constante',
      'Diversifier les canaux de vente',
      'Négocier des contrats à terme'
    ]
  };
}