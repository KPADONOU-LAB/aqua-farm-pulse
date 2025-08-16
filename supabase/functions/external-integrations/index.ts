import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  precipitation: number;
  forecast_7_days: any[];
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

    const { user_id, action, location, cage_id } = await req.json();

    if (action === 'get_weather_forecast') {
      // Simuler des données météo (dans un vrai système, utiliser une API météo)
      const weatherData: WeatherData = {
        temperature: 24 + Math.random() * 8,
        humidity: 70 + Math.random() * 20,
        pressure: 1010 + Math.random() * 20,
        wind_speed: 5 + Math.random() * 10,
        precipitation: Math.random() * 10,
        forecast_7_days: generateWeatherForecast()
      };

      // Générer des alertes météo et recommandations
      const weatherAlerts = await generateWeatherAlerts(supabase, user_id, weatherData);
      const recommendations = generateWeatherRecommendations(weatherData);

      return new Response(JSON.stringify({
        success: true,
        weather: weatherData,
        alerts: weatherAlerts,
        recommendations,
        impact_predictions: calculateWeatherImpact(weatherData)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get_supplier_integration') {
      // Simuler intégration avec fournisseurs
      const supplierData = await getSupplierData();
      
      return new Response(JSON.stringify({
        success: true,
        suppliers: supplierData,
        price_alerts: generatePriceAlerts(supplierData),
        auto_order_suggestions: generateAutoOrderSuggestions(supplierData, user_id)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'create_smart_notification') {
      const { notification_type, priority, message, target_audience } = await req.json();
      
      // Créer notification intelligente
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id,
          type_notification: notification_type,
          titre: generateSmartTitle(notification_type, priority),
          message,
          priorite: priority,
          data_contexte: { target_audience, created_by: 'ai_system' }
        });

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Notification intelligente créée'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generate_automated_report') {
      const report = await generateAutomatedReport(supabase, user_id);
      
      return new Response(JSON.stringify({
        success: true,
        report
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'optimize_feeding_schedule') {
      const optimizedSchedule = await optimizeFeedingSchedule(supabase, user_id, cage_id);
      
      return new Response(JSON.stringify({
        success: true,
        optimized_schedule: optimizedSchedule,
        estimated_improvement: calculateFeedingImprovement(optimizedSchedule)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in external-integrations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateWeatherForecast() {
  const forecast = [];
  for (let i = 0; i < 7; i++) {
    forecast.push({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      temperature_min: 18 + Math.random() * 5,
      temperature_max: 25 + Math.random() * 8,
      precipitation_probability: Math.random() * 100,
      wind_speed: 3 + Math.random() * 12,
      conditions: ['sunny', 'cloudy', 'rainy', 'stormy'][Math.floor(Math.random() * 4)]
    });
  }
  return forecast;
}

async function generateWeatherAlerts(supabase: any, user_id: string, weather: WeatherData) {
  const alerts = [];

  // Alerte température extrême
  if (weather.temperature > 32 || weather.temperature < 15) {
    alerts.push({
      user_id,
      type_alerte: 'temperature_extreme',
      niveau_criticite: weather.temperature > 35 || weather.temperature < 10 ? 'error' : 'warning',
      titre: `Température ${weather.temperature > 32 ? 'élevée' : 'basse'} prévue`,
      message: `Température de ${weather.temperature.toFixed(1)}°C prévue. Impact possible sur vos poissons.`,
      recommandations: weather.temperature > 32 
        ? ['Activer l\'aération', 'Réduire l\'alimentation', 'Surveiller l\'oxygène']
        : ['Réduire l\'alimentation', 'Surveiller les poissons', 'Éviter les manipulations']
    });
  }

  // Alerte précipitations importantes
  if (weather.precipitation > 15) {
    alerts.push({
      user_id,
      type_alerte: 'precipitation_forte',
      niveau_criticite: 'warning',
      titre: 'Fortes précipitations prévues',
      message: `${weather.precipitation.toFixed(1)}mm de pluie prévus. Risque de dilution et pollution.`,
      recommandations: ['Vérifier les filets', 'Surveiller la qualité eau', 'Préparer la filtration']
    });
  }

  // Insérer les alertes
  for (const alert of alerts) {
    await supabase.from('smart_alerts').insert(alert);
  }

  return alerts;
}

function generateWeatherRecommendations(weather: WeatherData) {
  const recommendations = [];

  if (weather.temperature > 28) {
    recommendations.push({
      category: 'alimentation',
      action: 'Réduire l\'alimentation de 15%',
      reason: 'Température élevée réduit l\'appétit',
      urgency: 'medium'
    });
  }

  if (weather.wind_speed > 15) {
    recommendations.push({
      category: 'securite',
      action: 'Vérifier l\'ancrage des cages',
      reason: 'Vents forts prévus',
      urgency: 'high'
    });
  }

  if (weather.pressure < 1005) {
    recommendations.push({
      category: 'sante',
      action: 'Surveiller le comportement des poissons',
      reason: 'Basse pression peut causer du stress',
      urgency: 'low'
    });
  }

  return recommendations;
}

function calculateWeatherImpact(weather: WeatherData) {
  let impact_score = 0;
  const impacts = [];

  // Impact température
  if (weather.temperature > 30) {
    impact_score += 0.3;
    impacts.push('Réduction appétit estimée: 10-20%');
  }
  if (weather.temperature < 18) {
    impact_score += 0.2;
    impacts.push('Ralentissement croissance estimé: 15%');
  }

  // Impact précipitations
  if (weather.precipitation > 10) {
    impact_score += 0.2;
    impacts.push('Risque qualité eau: modéré');
  }

  return {
    impact_score: Math.round(impact_score * 100),
    financial_impact: Math.round(impact_score * 500), // €
    detailed_impacts: impacts
  };
}

async function getSupplierData() {
  return [
    {
      supplier: 'AquaFeed Pro',
      product: 'Aliment croissance tilapia',
      current_price: 1.2,
      price_trend: 'stable',
      availability: 'in_stock',
      delivery_time: 3,
      quality_score: 95
    },
    {
      supplier: 'FishNutrition Plus',
      product: 'Aliment croissance tilapia',
      current_price: 1.15,
      price_trend: 'decreasing',
      availability: 'limited',
      delivery_time: 5,
      quality_score: 88
    },
    {
      supplier: 'TropicalFeed Supply',
      product: 'Aliment croissance tilapia',
      current_price: 1.35,
      price_trend: 'increasing',
      availability: 'in_stock',
      delivery_time: 2,
      quality_score: 92
    }
  ];
}

function generatePriceAlerts(suppliers: any[]) {
  const alerts = [];
  
  const cheapest = suppliers.reduce((min, supplier) => 
    supplier.current_price < min.current_price ? supplier : min
  );

  if (cheapest.price_trend === 'decreasing') {
    alerts.push({
      type: 'price_opportunity',
      message: `Prix en baisse chez ${cheapest.supplier}: ${cheapest.current_price}€/kg`,
      urgency: 'medium',
      savings_potential: 0.1 * 1000 // €
    });
  }

  return alerts;
}

function generateAutoOrderSuggestions(suppliers: any[], user_id: string) {
  const bestSupplier = suppliers.reduce((best, supplier) => {
    const score = (100 - supplier.current_price * 50) + supplier.quality_score + (10 / supplier.delivery_time * 10);
    const bestScore = (100 - best.current_price * 50) + best.quality_score + (10 / best.delivery_time * 10);
    return score > bestScore ? supplier : best;
  });

  return {
    recommended_supplier: bestSupplier.supplier,
    recommended_quantity: 500, // kg
    estimated_savings: 50, // €
    auto_order_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reasoning: [
      `Meilleur rapport qualité-prix: ${bestSupplier.quality_score}/100`,
      `Prix compétitif: ${bestSupplier.current_price}€/kg`,
      `Livraison rapide: ${bestSupplier.delivery_time} jours`
    ]
  };
}

function generateSmartTitle(type: string, priority: string): string {
  const titles = {
    'feeding_optimization': 'Optimisation alimentation disponible',
    'weather_alert': 'Alerte météorologique',
    'price_opportunity': 'Opportunité prix fournisseur',
    'health_prediction': 'Prédiction santé préventive',
    'harvest_timing': 'Moment optimal de récolte'
  };
  
  const prefix = priority === 'critical' ? '🚨 URGENT: ' : priority === 'high' ? '⚡ Important: ' : '💡 ';
  return prefix + (titles[type] || 'Notification intelligente');
}

async function generateAutomatedReport(supabase: any, user_id: string) {
  // Générer un rapport automatisé hebdomadaire/mensuel
  const { data: cages } = await supabase
    .from('cages')
    .select('*')
    .eq('user_id', user_id);

  const report = {
    period: 'weekly',
    generated_at: new Date().toISOString(),
    summary: {
      total_cages: cages?.length || 0,
      active_cages: cages?.filter(c => c.statut === 'en_production').length || 0,
      avg_fcr: 1.8,
      total_biomass: 2500,
      estimated_harvest_value: 15000
    },
    alerts_summary: {
      critical: 2,
      high: 5,
      medium: 8
    },
    recommendations: [
      'Optimiser FCR cage C-003 (actuellement 2.4)',
      'Planifier récolte cage A-001 dans 15 jours',
      'Réviser protocole alimentation pour améliorer croissance'
    ],
    financial_outlook: {
      projected_revenue_next_month: 18500,
      cost_optimization_potential: 1200,
      roi_improvement_suggestions: 3
    }
  };

  return report;
}

async function optimizeFeedingSchedule(supabase: any, user_id: string, cage_id: string) {
  // Optimiser les horaires d'alimentation basé sur l'IA
  const { data: feedingSessions } = await supabase
    .from('feeding_sessions')
    .select('*')
    .eq('cage_id', cage_id)
    .order('date_alimentation', { ascending: false })
    .limit(50);

  // Analyser les patterns d'appétit
  const optimizedSchedule = {
    recommended_times: ['07:00', '12:30', '18:00'],
    frequency_per_day: 3,
    quantity_adjustments: {
      morning: 1.2, // 20% de plus le matin
      afternoon: 1.0,
      evening: 0.8  // 20% de moins le soir
    },
    seasonal_adjustments: {
      summer: { frequency: 4, total_reduction: 0.9 },
      winter: { frequency: 2, total_increase: 1.1 }
    },
    weather_based_rules: {
      hot_day: 'reduce_by_15_percent',
      rainy_day: 'maintain_normal',
      windy_day: 'increase_by_10_percent'
    }
  };

  return optimizedSchedule;
}

function calculateFeedingImprovement(schedule: any) {
  return {
    fcr_improvement: 0.15, // Amélioration FCR estimée
    growth_rate_increase: 12, // % d'augmentation croissance
    cost_savings_monthly: 180, // € économisées par mois
    implementation_effort: 'low'
  };
}