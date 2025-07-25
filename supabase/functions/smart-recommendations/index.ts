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

interface SmartRecommendation {
  id: string;
  type: 'feeding' | 'water_quality' | 'health' | 'financial' | 'harvest' | 'performance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action_items: string[];
  reasoning: string;
  impact_score: number;
  cage_id?: string;
  cage_name?: string;
  estimated_improvement: string;
  implementation_difficulty: 'easy' | 'medium' | 'hard';
  cost_estimate?: number;
  roi_estimate?: number;
  deadline?: string;
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, analysis_depth = 'standard' } = await req.json();

    // Récupérer toutes les données de l'utilisateur
    const userData = await collectUserData(user_id);
    
    // Générer les recommandations avec l'IA
    const recommendations = await generateSmartRecommendations(userData, analysis_depth);

    return new Response(JSON.stringify({ 
      success: true, 
      recommendations,
      analysis_depth,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur dans smart-recommendations:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function collectUserData(userId: string) {
  const [cages, feeding, waterQuality, health, sales, costs, cycles] = await Promise.all([
    supabase.from('cages').select('*').eq('user_id', userId),
    supabase.from('feeding_sessions').select('*').eq('user_id', userId).order('date_alimentation', { ascending: false }).limit(50),
    supabase.from('water_quality').select('*').eq('user_id', userId).order('date_mesure', { ascending: false }).limit(50),
    supabase.from('health_observations').select('*').eq('user_id', userId).order('date_observation', { ascending: false }).limit(30),
    supabase.from('sales').select('*').eq('user_id', userId).order('date_vente', { ascending: false }).limit(30),
    supabase.from('cost_tracking').select('*').eq('user_id', userId).order('date_cout', { ascending: false }).limit(50),
    supabase.from('production_cycles').select('*').eq('user_id', userId).order('date_debut', { ascending: false }).limit(10)
  ]);

  return {
    cages: cages.data || [],
    feeding: feeding.data || [],
    waterQuality: waterQuality.data || [],
    health: health.data || [],
    sales: sales.data || [],
    costs: costs.data || [],
    cycles: cycles.data || []
  };
}

async function generateSmartRecommendations(userData: any, analysisDepth: string): Promise<SmartRecommendation[]> {
  if (!openAIApiKey) {
    return generateFallbackRecommendations(userData);
  }

  const prompt = `
En tant qu'expert en aquaculture avec 20 ans d'expérience, analysez ces données et générez des recommandations intelligentes et actionnables :

DONNÉES GÉNÉRALES:
- Nombre de cages: ${userData.cages.length}
- Cages actives: ${userData.cages.filter(c => c.statut === 'en_production').length}
- Total poissons: ${userData.cages.reduce((sum, c) => sum + c.nombre_poissons, 0)}

PERFORMANCE DES CAGES:
${userData.cages.map(cage => `
- ${cage.nom}: ${cage.nombre_poissons} poissons, poids moyen ${cage.poids_moyen}kg, FCR ${cage.fcr}, mortalité ${cage.taux_mortalite}%
`).join('')}

ALIMENTATION RÉCENTE (10 derniers):
${userData.feeding.slice(0, 10).map(f => `- ${f.date_alimentation}: ${f.quantite}kg, appétit ${f.appetit}`).join('\n')}

QUALITÉ EAU RÉCENTE:
${userData.waterQuality.slice(0, 5).map(w => `- ${w.date_mesure}: Temp ${w.temperature}°C, pH ${w.ph}, O2 ${w.oxygene_dissous}mg/L`).join('\n')}

SANTÉ RÉCENTE:
${userData.health.slice(0, 5).map(h => `- ${h.date_observation}: ${h.mortalite} morts, statut ${h.statut}`).join('\n')}

VENTES RÉCENTES:
${userData.sales.slice(0, 5).map(s => `- ${s.date_vente}: ${s.quantite_kg}kg à ${s.prix_par_kg}€/kg`).join('\n')}

COÛTS RÉCENTS:
${userData.costs.slice(0, 5).map(c => `- ${c.date_cout}: ${c.montant}€ (${c.categorie_cout})`).join('\n')}

Générez entre 5 et 10 recommandations prioritaires avec un focus sur la rentabilité et la performance.

Répondez UNIQUEMENT avec un JSON valide de ce format:
{
  "recommendations": [
    {
      "id": "unique-id",
      "type": "feeding|water_quality|health|financial|harvest|performance",
      "priority": "low|medium|high|critical",
      "title": "Titre court et clair",
      "description": "Description détaillée du problème/opportunité",
      "action_items": ["Action 1", "Action 2", "Action 3"],
      "reasoning": "Justification scientifique et économique",
      "impact_score": 85,
      "cage_id": "id-cage-si-applicable",
      "cage_name": "nom-cage-si-applicable",
      "estimated_improvement": "Amélioration quantifiée attendue",
      "implementation_difficulty": "easy|medium|hard",
      "cost_estimate": 500,
      "roi_estimate": 2000,
      "deadline": "2024-02-15T00:00:00.000Z"
    }
  ]
}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un expert en aquaculture spécialisé dans l\'optimisation des performances et de la rentabilité. Tu génères des recommandations précises, actionnables et basées sur les données.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 3000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No choices returned from OpenAI API');
    }
    
    const aiResponse = data.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(aiResponse);
      return parsedResponse.recommendations.map((rec: any) => ({
        ...rec,
        created_at: new Date().toISOString()
      }));
    } catch (e) {
      console.error('Erreur parsing JSON IA:', e, aiResponse);
      return generateFallbackRecommendations(userData);
    }
  } catch (error) {
    console.error('Erreur OpenAI:', error);
    return generateFallbackRecommendations(userData);
  }
}

function generateFallbackRecommendations(userData: any): SmartRecommendation[] {
  const recommendations: SmartRecommendation[] = [];
  const now = new Date().toISOString();

  for (const cage of userData.cages) {
    // FCR élevé
    if (cage.fcr > 2.0) {
      recommendations.push({
        id: `fcr-${cage.id}`,
        type: 'feeding',
        priority: cage.fcr > 2.5 ? 'high' : 'medium',
        title: `Optimiser l'efficacité alimentaire - ${cage.nom}`,
        description: `FCR de ${cage.fcr} supérieur à l'objectif de 2.0. Optimisation nécessaire.`,
        action_items: [
          'Réduire la quantité d\'aliment de 10%',
          'Surveiller l\'appétit plus fréquemment',
          'Vérifier la qualité de l\'aliment',
          'Ajuster la fréquence des repas'
        ],
        reasoning: 'Un FCR élevé indique une mauvaise conversion alimentaire, impactant directement la rentabilité.',
        impact_score: 85,
        cage_id: cage.id,
        cage_name: cage.nom,
        estimated_improvement: 'Réduction de 15-20% des coûts alimentaires',
        implementation_difficulty: 'easy',
        cost_estimate: 0,
        roi_estimate: 1500,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: now
      });
    }

    // Mortalité élevée
    if (cage.taux_mortalite > 5) {
      recommendations.push({
        id: `mortality-${cage.id}`,
        type: 'health',
        priority: cage.taux_mortalite > 10 ? 'critical' : 'high',
        title: `Urgence: Réduire la mortalité - ${cage.nom}`,
        description: `Taux de mortalité de ${cage.taux_mortalite}% dépasse dangereusement l'objectif de 5%.`,
        action_items: [
          'Vérifier la qualité de l\'eau immédiatement',
          'Consulter un vétérinaire',
          'Réviser le plan d\'alimentation',
          'Augmenter la surveillance'
        ],
        reasoning: 'Une mortalité élevée indique des problèmes sanitaires graves nécessitant une action immédiate.',
        impact_score: 95,
        cage_id: cage.id,
        cage_name: cage.nom,
        estimated_improvement: 'Sauvegarde de 20-30% du stock',
        implementation_difficulty: 'medium',
        cost_estimate: 200,
        roi_estimate: 3000,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: now
      });
    }

    // Récolte recommandée
    if (cage.poids_moyen >= 0.7) {
      recommendations.push({
        id: `harvest-${cage.id}`,
        type: 'harvest',
        priority: 'medium',
        title: `Planifier la récolte - ${cage.nom}`,
        description: `Poids optimal atteint (${cage.poids_moyen}kg). Récolte recommandée pour maximiser la valeur.`,
        action_items: [
          'Contacter les acheteurs',
          'Préparer les équipements',
          'Planifier la logistique',
          'Finaliser les analyses'
        ],
        reasoning: 'Récolter au bon moment maximise la valeur commerciale et évite la surcharge.',
        impact_score: 75,
        cage_id: cage.id,
        cage_name: cage.nom,
        estimated_improvement: 'Optimisation du prix de vente de 10-15%',
        implementation_difficulty: 'medium',
        cost_estimate: 500,
        roi_estimate: 2000,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: now
      });
    }
  }

  // Recommandation générale
  if (userData.cages.length > 1) {
    recommendations.push({
      id: 'performance-analysis',
      type: 'performance',
      priority: 'low',
      title: 'Analyse comparative des performances',
      description: 'Identifiez et reproduisez les meilleures pratiques entre vos cages.',
      action_items: [
        'Identifier la cage la plus performante',
        'Analyser les facteurs de succès',
        'Appliquer aux autres cages',
        'Standardiser les protocoles'
      ],
      reasoning: 'L\'analyse comparative permet d\'identifier et reproduire les meilleures pratiques.',
      impact_score: 60,
      estimated_improvement: 'Amélioration globale de 15% des performances',
      implementation_difficulty: 'easy',
      cost_estimate: 0,
      roi_estimate: 1000,
      created_at: now
    });
  }

  return recommendations.sort((a, b) => b.impact_score - a.impact_score);
}