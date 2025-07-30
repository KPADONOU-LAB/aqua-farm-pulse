import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CageData {
  id: string;
  nom: string;
  espece: string;
  nombre_poissons: number;
  poids_moyen: number;
  fcr: number;
  taux_mortalite: number;
  date_introduction: string;
  feeding_data: any[];
  water_quality_data: any[];
  health_data: any[];
  cost_data: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cage_id, user_id, prediction_types } = await req.json();

    // Récupérer les données complètes de la cage
    const { data: cage, error: cageError } = await supabase
      .from('cages')
      .select('*')
      .eq('id', cage_id)
      .eq('user_id', user_id)
      .single();

    if (cageError || !cage) {
      throw new Error('Cage non trouvée');
    }

    // Récupérer les données historiques
    const [feedingData, waterData, healthData, costData] = await Promise.all([
      supabase.from('feeding_sessions').select('*').eq('cage_id', cage_id).order('date_alimentation', { ascending: false }).limit(30),
      supabase.from('water_quality').select('*').eq('cage_id', cage_id).order('date_mesure', { ascending: false }).limit(30),
      supabase.from('health_observations').select('*').eq('cage_id', cage_id).order('date_observation', { ascending: false }).limit(10),
      supabase.from('cost_tracking').select('*').eq('cage_id', cage_id).order('date_cout', { ascending: false }).limit(20)
    ]);

    const cageData: CageData = {
      ...cage,
      feeding_data: feedingData.data || [],
      water_quality_data: waterData.data || [],
      health_data: healthData.data || [],
      cost_data: costData.data || []
    };

    // Générer les prédictions avec OpenAI
    const predictions = await generateAIPredictions(cageData, prediction_types);

    // Sauvegarder les prédictions en base
    for (const prediction of predictions) {
      await supabase.from('production_predictions').upsert({
        user_id,
        cage_id,
        type_prediction: prediction.type,
        valeur_predite: prediction.value,
        horizon_jours: prediction.horizon_days,
        intervalle_confiance: prediction.confidence,
        parametres_calcul: prediction.parameters,
        statut: 'active'
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      predictions,
      message: `${predictions.length} prédictions générées avec succès`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur dans ai-predictions:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateAIPredictions(cageData: CageData, predictionTypes: string[]) {
  const prompt = `
En tant qu'expert en aquaculture, analysez ces données et générez des prédictions précises :

DONNÉES DE LA CAGE "${cageData.nom}":
- Espèce: ${cageData.espece}
- Poissons: ${cageData.nombre_poissons}
- Poids moyen actuel: ${cageData.poids_moyen}kg
- FCR: ${cageData.fcr}
- Taux mortalité: ${cageData.taux_mortalite}%
- Jours d'élevage: ${Math.floor((Date.now() - new Date(cageData.date_introduction).getTime()) / (1000 * 60 * 60 * 24))}

HISTORIQUE ALIMENTATION (30 derniers jours):
${cageData.feeding_data.slice(0, 5).map(f => `- ${f.date_alimentation}: ${f.quantite}kg (${f.appetit})`).join('\n')}

QUALITÉ EAU (30 derniers jours):
${cageData.water_quality_data.slice(0, 5).map(w => `- ${w.date_mesure}: Temp ${w.temperature}°C, pH ${w.ph}, O2 ${w.oxygene_dissous}mg/L`).join('\n')}

OBSERVATIONS SANTÉ:
${cageData.health_data.slice(0, 3).map(h => `- ${h.date_observation}: ${h.mortalite} morts, statut ${h.statut}`).join('\n')}

COÛTS RÉCENTS:
${cageData.cost_data.slice(0, 3).map(c => `- ${c.date_cout}: ${c.montant}€ (${c.categorie_cout})`).join('\n')}

Générez des prédictions pour : ${predictionTypes.join(', ')}

Répondez UNIQUEMENT avec un JSON valide de ce format:
{
  "predictions": [
    {
      "type": "poids_final",
      "value": 0.85,
      "horizon_days": 45,
      "confidence": 87,
      "parameters": {"current_growth_rate": 0.02, "target_weight": 0.8},
      "reasoning": "Basé sur la croissance actuelle..."
    }
  ]
}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'Tu es un expert en aquaculture avec 20 ans d\'expérience. Tu analyses les données et fais des prédictions précises basées sur les tendances historiques, les pratiques optimales et les modèles de croissance.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }),
  });

  const data = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    console.error('No choices returned from OpenAI API');
    return generateFallbackPredictions(cageData, predictionTypes);
  }
  
  const aiResponse = data.choices[0].message.content;
  
  try {
    const parsedResponse = JSON.parse(aiResponse);
    return parsedResponse.predictions;
  } catch (e) {
    console.error('Erreur parsing JSON IA:', e, aiResponse);
    // Fallback avec prédictions de base
    return generateFallbackPredictions(cageData, predictionTypes);
  }
}

function generateFallbackPredictions(cageData: CageData, predictionTypes: string[]) {
  const predictions = [];
  const currentWeight = cageData.poids_moyen;
  const targetWeight = 0.8; // 800g objectif
  const dailyGrowthRate = 0.018; // 1.8% par jour
  
  if (predictionTypes.includes('poids_final')) {
    const daysToTarget = Math.ceil(Math.log(targetWeight / currentWeight) / Math.log(1 + dailyGrowthRate));
    predictions.push({
      type: 'poids_final',
      value: targetWeight,
      horizon_days: daysToTarget,
      confidence: 75,
      parameters: { daily_growth_rate: dailyGrowthRate, current_weight: currentWeight },
      reasoning: 'Calcul basé sur taux de croissance moyen'
    });
  }
  
  if (predictionTypes.includes('biomasse_totale')) {
    const finalBiomass = cageData.nombre_poissons * targetWeight;
    predictions.push({
      type: 'biomasse_totale',
      value: finalBiomass,
      horizon_days: 60,
      confidence: 80,
      parameters: { fish_count: cageData.nombre_poissons, target_weight: targetWeight },
      reasoning: 'Biomasse estimée à maturité'
    });
  }
  
  if (predictionTypes.includes('profit_estime')) {
    const revenue = cageData.nombre_poissons * targetWeight * 6.5; // 6.5€/kg
    const estimatedCosts = cageData.nombre_poissons * targetWeight * 3.8; // 3.8€/kg
    const profit = revenue - estimatedCosts;
    
    predictions.push({
      type: 'profit_estime',
      value: profit,
      horizon_days: 60,
      confidence: 70,
      parameters: { revenue, costs: estimatedCosts, price_per_kg: 6.5 },
      reasoning: 'Profit basé sur prix marché actuel'
    });
  }
  
  return predictions;
}