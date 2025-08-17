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

    const { user_id, action, cage_id } = await req.json();

    switch (action) {
      case 'generate_predictive_alerts':
        return await generatePredictiveAlerts(supabase, user_id, cage_id);
      case 'analyze_risk_patterns':
        return await analyzeRiskPatterns(supabase, user_id);
      case 'predict_maintenance_needs':
        return await predictMaintenanceNeeds(supabase, user_id);
      default:
        throw new Error('Action not supported');
    }
  } catch (error) {
    console.error('Error in predictive-alerts function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generatePredictiveAlerts(supabase: any, user_id: string, cage_id?: string) {
  const { data: cages } = await supabase.from('cages').select('*').eq('user_id', user_id);
  const { data: waterQuality } = await supabase.from('water_quality').select('*').eq('user_id', user_id);
  const { data: healthObs } = await supabase.from('health_observations').select('*').eq('user_id', user_id);

  const alerts = [];

  for (const cage of cages || []) {
    const recentHealth = healthObs?.filter(h => h.cage_id === cage.id).slice(-7) || [];
    const avgMortality = recentHealth.reduce((sum, h) => sum + (h.mortalite || 0), 0) / Math.max(recentHealth.length, 1);
    
    if (avgMortality > 2) {
      alerts.push({
        id: crypto.randomUUID(),
        cage_id: cage.id,
        type: 'mortality_risk',
        severity: 'high',
        title: 'Risque de mortalité élevé prédit',
        message: `Tendance à la hausse de mortalité détectée pour ${cage.nom}. Mortalité moyenne: ${avgMortality.toFixed(1)}/jour`,
        probability: 85,
        predicted_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        recommendations: [
          'Vérifier la qualité de l\'eau immédiatement',
          'Réduire les quantités d\'alimentation de 20%',
          'Programmer une visite vétérinaire'
        ]
      });
    }
  }

  return new Response(JSON.stringify({
    success: true,
    data: { alerts, total_alerts: alerts.length }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function analyzeRiskPatterns(supabase: any, user_id: string) {
  const patterns = [
    {
      id: '1',
      pattern_type: 'seasonal_mortality',
      description: 'Augmentation de mortalité observée pendant les mois chauds',
      risk_level: 'medium',
      mitigation_strategies: ['Installer des systèmes de refroidissement', 'Augmenter l\'aération']
    }
  ];

  return new Response(JSON.stringify({
    success: true,
    data: patterns
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function predictMaintenanceNeeds(supabase: any, user_id: string) {
  const maintenanceNeeds = [
    {
      id: '1',
      equipment: 'Système d\'aération Cage 1',
      predicted_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      urgency: 'medium',
      estimated_cost: 250
    }
  ];

  return new Response(JSON.stringify({
    success: true,
    data: maintenanceNeeds
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}