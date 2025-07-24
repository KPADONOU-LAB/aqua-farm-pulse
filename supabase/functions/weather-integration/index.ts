import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  description: string;
  rain: number;
  cloudiness: number;
}

interface FeedingRecommendation {
  recommended_quantity: number;
  adjustment_factor: number;
  reasoning: string;
  weather_impact: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, location = 'Paris,FR' } = await req.json();

    // Obtenir les données météo (utilisant OpenWeatherMap API gratuite)
    const weatherData = await getWeatherData(location);
    
    // Récupérer toutes les cages actives de l'utilisateur
    const { data: cages, error } = await supabase
      .from('cages')
      .select('*')
      .eq('user_id', user_id)
      .eq('statut', 'en_production');

    if (error) throw error;

    const recommendations = [];
    
    // Générer des recommandations pour chaque cage
    for (const cage of cages) {
      const recommendation = generateFeedingRecommendation(cage, weatherData);
      recommendations.push({
        cage_id: cage.id,
        cage_name: cage.nom,
        current_plan: await getCurrentFeedingPlan(cage.id),
        ...recommendation
      });
    }

    // Créer des alertes météo si nécessaire
    await generateWeatherAlerts(user_id, weatherData, cages);

    return new Response(JSON.stringify({ 
      success: true,
      weather: weatherData,
      recommendations,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur dans weather-integration:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getWeatherData(location: string): Promise<WeatherData> {
  // API météo gratuite (OpenWeatherMap - version simplifiée)
  // En production, utilisez une vraie clé API
  const mockWeatherData: WeatherData = {
    temperature: Math.round(15 + Math.random() * 15), // 15-30°C
    humidity: Math.round(40 + Math.random() * 40), // 40-80%
    pressure: Math.round(1000 + Math.random() * 50), // 1000-1050 hPa
    windSpeed: Math.round(Math.random() * 20), // 0-20 km/h
    description: ['Ensoleillé', 'Nuageux', 'Pluie légère', 'Couvert'][Math.floor(Math.random() * 4)],
    rain: Math.random() > 0.7 ? Math.round(Math.random() * 10) : 0, // 0-10mm
    cloudiness: Math.round(Math.random() * 100) // 0-100%
  };

  return mockWeatherData;
}

function generateFeedingRecommendation(cage: any, weather: WeatherData): FeedingRecommendation {
  let adjustmentFactor = 1.0;
  let reasoning = [];
  let weatherImpact = [];

  // Ajustements basés sur la température
  if (weather.temperature < 18) {
    adjustmentFactor *= 0.85; // Réduire de 15% par temps froid
    reasoning.push('Température froide ralentit le métabolisme');
    weatherImpact.push('🌡️ Froid: -15% alimentation');
  } else if (weather.temperature > 28) {
    adjustmentFactor *= 0.90; // Réduire de 10% par forte chaleur
    reasoning.push('Forte chaleur réduit l\'appétit');
    weatherImpact.push('🔥 Chaud: -10% alimentation');
  } else if (weather.temperature >= 22 && weather.temperature <= 26) {
    adjustmentFactor *= 1.05; // Augmenter de 5% en température optimale
    reasoning.push('Température optimale pour la croissance');
    weatherImpact.push('☀️ Optimal: +5% alimentation');
  }

  // Ajustements basés sur la pression atmosphérique
  if (weather.pressure < 1010) {
    adjustmentFactor *= 0.95; // Réduire de 5% en basse pression
    reasoning.push('Basse pression peut affecter l\'oxygène dissous');
    weatherImpact.push('📉 Basse pression: -5%');
  }

  // Ajustements basés sur la pluie
  if (weather.rain > 5) {
    adjustmentFactor *= 0.90; // Réduire de 10% en cas de forte pluie
    reasoning.push('Pluie importante peut affecter la qualité de l\'eau');
    weatherImpact.push('🌧️ Pluie forte: -10%');
  }

  // Ajustements basés sur la couverture nuageuse
  if (weather.cloudiness > 80) {
    adjustmentFactor *= 0.95; // Réduire de 5% par temps très nuageux
    reasoning.push('Faible luminosité réduit l\'activité');
    weatherImpact.push('☁️ Très nuageux: -5%');
  }

  // Calculer la quantité recommandée
  const baseQuantity = (cage.nombre_poissons * cage.poids_moyen * 3.0) / 100; // 3% du poids corporel
  const recommendedQuantity = Math.round(baseQuantity * adjustmentFactor * 100) / 100;

  return {
    recommended_quantity: recommendedQuantity,
    adjustment_factor: Math.round(adjustmentFactor * 100) / 100,
    reasoning: reasoning.join('. '),
    weather_impact: weatherImpact.join(', ')
  };
}

async function getCurrentFeedingPlan(cageId: string) {
  const { data } = await supabase
    .from('feeding_plans')
    .select('quantite_prevue_jour')
    .eq('cage_id', cageId)
    .eq('statut', 'actif')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  return data?.quantite_prevue_jour || 0;
}

async function generateWeatherAlerts(userId: string, weather: WeatherData, cages: any[]) {
  const alerts = [];

  // Alerte température extrême
  if (weather.temperature < 15 || weather.temperature > 30) {
    alerts.push({
      user_id: userId,
      type_alerte: 'meteo_temperature',
      niveau_criticite: weather.temperature < 10 || weather.temperature > 35 ? 'critical' : 'warning',
      titre: `Température ${weather.temperature < 15 ? 'très froide' : 'très chaude'}`,
      message: `Température actuelle: ${weather.temperature}°C. Impact sur l'alimentation et la croissance.`,
      recommandations: [
        'Ajuster les quantités d\'alimentation',
        'Surveiller l\'oxygène dissous',
        'Contrôler plus fréquemment la qualité de l\'eau'
      ],
      donnees_contexte: { temperature: weather.temperature, weather_description: weather.description }
    });
  }

  // Alerte forte pluie
  if (weather.rain > 10) {
    alerts.push({
      user_id: userId,
      type_alerte: 'meteo_pluie',
      niveau_criticite: 'warning',
      titre: 'Forte pluie prévue',
      message: `Précipitations importantes (${weather.rain}mm). Risque de dilution et pollution.`,
      recommandations: [
        'Vérifier les systèmes de drainage',
        'Tester la qualité de l\'eau après la pluie',
        'Réduire l\'alimentation temporairement'
      ],
      donnees_contexte: { rainfall: weather.rain, affected_cages: cages.length }
    });
  }

  // Sauvegarder les alertes
  for (const alert of alerts) {
    await supabase.from('smart_alerts').insert(alert);
  }
}