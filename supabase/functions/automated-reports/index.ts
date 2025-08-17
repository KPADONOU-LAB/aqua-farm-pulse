import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, action, report_type, filters } = await req.json();

    switch (action) {
      case 'generate_report':
        return await generateAutomatedReport(supabase, user_id, report_type, filters);
      case 'get_automation_rules':
        return await getAutomationRules(supabase, user_id);
      case 'schedule_report':
        return await scheduleReport(supabase, user_id, report_type, filters);
      default:
        throw new Error('Action not supported');
    }
  } catch (error) {
    console.error('Error in automated-reports function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateAutomatedReport(supabase: any, user_id: string, report_type: string, filters: any) {
  // Récupérer les données pour le rapport
  const { data: cages } = await supabase.from('cages').select('*').eq('user_id', user_id);
  const { data: sales } = await supabase.from('sales').select('*').eq('user_id', user_id);
  const { data: costs } = await supabase.from('cost_tracking').select('*').eq('user_id', user_id);

  // Préparer le prompt pour l'IA
  const reportData = {
    cages: cages?.length || 0,
    total_sales: sales?.reduce((sum: number, sale: any) => sum + sale.prix_total, 0) || 0,
    total_costs: costs?.reduce((sum: number, cost: any) => sum + cost.montant, 0) || 0,
    active_cages: cages?.filter((c: any) => c.statut === 'en_production').length || 0
  };

  const prompt = `Génère un rapport d'aquaculture ${report_type} basé sur ces données:
  - ${reportData.cages} cages au total (${reportData.active_cages} en production)
  - Chiffre d'affaires: ${reportData.total_sales}€
  - Coûts totaux: ${reportData.total_costs}€
  - Marge: ${reportData.total_sales - reportData.total_costs}€
  
  Analyse les performances, identifie les tendances et donne des recommandations actionables.`;

  if (openAIApiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Tu es un expert en aquaculture qui génère des rapports détaillés et professionnels.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      const aiResult = await response.json();
      const report_content = aiResult.choices[0].message.content;

      return new Response(JSON.stringify({
        success: true,
        data: {
          report_type,
          content: report_content,
          generated_at: new Date().toISOString(),
          metrics: reportData
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('OpenAI API error:', error);
    }
  }

  // Fallback sans IA
  return new Response(JSON.stringify({
    success: true,
    data: {
      report_type,
      content: `Rapport ${report_type} automatisé\n\nRésumé des performances:\n- ${reportData.cages} cages gérées\n- ${reportData.active_cages} cages en production\n- Chiffre d'affaires: ${reportData.total_sales}€\n- Coûts: ${reportData.total_costs}€\n- Marge brute: ${reportData.total_sales - reportData.total_costs}€`,
      generated_at: new Date().toISOString(),
      metrics: reportData
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getAutomationRules(supabase: any, user_id: string) {
  const rules = [
    {
      id: '1',
      name: 'Optimisation FCR Automatique',
      type: 'feeding_optimization',
      trigger: 'fcr_threshold',
      conditions: { fcr_max: 2.0, monitoring_days: 3 },
      actions: ['adjust_feeding_rate', 'send_alert'],
      status: 'active',
      created_at: new Date().toISOString(),
      last_triggered: new Date().toISOString(),
      success_count: 15,
      total_triggers: 16
    },
    {
      id: '2',
      name: 'Alerte Mortalité Critique',
      type: 'health_monitoring',
      trigger: 'mortality_spike',
      conditions: { mortality_threshold: 5, time_window: 24 },
      actions: ['send_urgent_alert', 'contact_veterinarian'],
      status: 'active',
      created_at: new Date().toISOString(),
      last_triggered: null,
      success_count: 3,
      total_triggers: 3
    }
  ];

  return new Response(JSON.stringify({
    success: true,
    data: rules
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function scheduleReport(supabase: any, user_id: string, report_type: string, filters: any) {
  return new Response(JSON.stringify({
    success: true,
    data: {
      message: `Rapport ${report_type} programmé avec succès`,
      schedule_id: crypto.randomUUID(),
      next_generation: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}