import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, action, location } = await req.json();

    switch (action) {
      case 'get_weather_forecast':
        return await getWeatherForecast(supabase, user_id, location);
      case 'analyze_weather_impact':
        return await analyzeWeatherImpact(supabase, user_id);
      case 'get_weather_alerts':
        return await getWeatherAlerts(supabase, user_id, location);
      default:
        throw new Error('Action not supported');
    }
  } catch (error) {
    console.error('Error in weather-integration function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getWeatherForecast(supabase: any, user_id: string, location?: string) {
  const forecast = {
    current: {
      temperature: 26,
      humidity: 72,
      wind_speed: 12,
      description: 'Partiellement nuageux'
    },
    daily: [
      {
        date: new Date().toISOString(),
        temp_min: 22,
        temp_max: 28,
        humidity: 75,
        precipitation: 20,
        description: 'Averses éparses'
      }
    ]
  };

  return new Response(JSON.stringify({
    success: true,
    data: forecast
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function analyzeWeatherImpact(supabase: any, user_id: string) {
  const impact_analysis = {
    overall_risk: 'medium',
    recommendations: [
      {
        category: 'temperature',
        recommendation: 'Augmenter l\'aération dans les cages',
        priority: 'high'
      }
    ]
  };

  return new Response(JSON.stringify({
    success: true,
    data: impact_analysis
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getWeatherAlerts(supabase: any, user_id: string, location?: string) {
  const alerts = [
    {
      id: crypto.randomUUID(),
      type: 'temperature_warning',
      severity: 'medium',
      title: 'Alerte canicule',
      message: 'Températures supérieures à 30°C prévues',
      actions_recommended: ['Augmenter l\'aération', 'Réduire les densités']
    }
  ];

  return new Response(JSON.stringify({
    success: true,
    data: { alerts, total_alerts: alerts.length }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}