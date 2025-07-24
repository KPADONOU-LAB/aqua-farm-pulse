import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PredictionAlert {
  type: 'health' | 'performance' | 'financial' | 'predictive';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  recommendations: string[];
  confidence: number;
  timeframe: string;
  estimatedImpact: number;
  cageId?: string;
  prediction: {
    timeframe: string;
    probability: number;
    preventionActions: string[];
  };
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

    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error('user_id is required');
    }

    console.log(`Generating predictive alerts for user: ${user_id}`);

    // Récupérer les données des cages actives
    const { data: cages, error: cagesError } = await supabase
      .from('cages')
      .select('*')
      .eq('user_id', user_id)
      .eq('statut', 'en_production');

    if (cagesError) throw cagesError;

    const predictions: PredictionAlert[] = [];

    for (const cage of cages || []) {
      // Analyser les tendances FCR
      const fcrPrediction = await analyzeFCRTrend(supabase, cage);
      if (fcrPrediction) predictions.push(fcrPrediction);

      // Analyser les risques de mortalité
      const mortalityPrediction = await analyzeMortalityRisk(supabase, cage);
      if (mortalityPrediction) predictions.push(mortalityPrediction);

      // Analyser la qualité de l'eau
      const waterQualityPrediction = await analyzeWaterQualityTrend(supabase, cage);
      if (waterQualityPrediction) predictions.push(waterQualityPrediction);

      // Analyser les coûts
      const costPrediction = await analyzeCostTrend(supabase, cage);
      if (costPrediction) predictions.push(costPrediction);

      // Prédictions de récolte optimale
      const harvestPrediction = await analyzeOptimalHarvest(supabase, cage);
      if (harvestPrediction) predictions.push(harvestPrediction);
    }

    // Insérer les nouvelles alertes prédictives
    let insertedCount = 0;
    for (const prediction of predictions) {
      try {
        const { error } = await supabase
          .from('smart_alerts')
          .insert({
            user_id,
            type_alerte: prediction.type,
            niveau_criticite: prediction.severity,
            titre: prediction.title,
            message: prediction.message,
            recommandations: prediction.recommendations,
            cage_id: prediction.cageId,
            impact_estime: prediction.estimatedImpact,
            donnees_contexte: {
              confidence: prediction.confidence,
              prediction: prediction.prediction,
              source: 'predictive_analysis'
            },
            statut: 'active'
          });

        if (!error) insertedCount++;
      } catch (error) {
        console.error('Error inserting prediction:', error);
      }
    }

    console.log(`Generated ${insertedCount} predictive alerts`);

    return new Response(
      JSON.stringify({
        success: true,
        predictions_generated: insertedCount,
        total_analyzed: predictions.length,
        cages_analyzed: cages?.length || 0
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error generating predictive alerts:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

async function analyzeFCRTrend(supabase: any, cage: any): Promise<PredictionAlert | null> {
  // Récupérer l'historique des FCR (7 derniers jours)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: feedingData } = await supabase
    .from('feeding_sessions')
    .select('quantite, date_alimentation')
    .eq('cage_id', cage.id)
    .gte('date_alimentation', sevenDaysAgo.toISOString().split('T')[0]);

  const currentFCR = cage.fcr || 0;
  const recentFeeding = feedingData?.reduce((sum: number, session: any) => sum + session.quantite, 0) || 0;

  // Estimation simple de tendance
  const estimatedGrowth = cage.poids_moyen * cage.nombre_poissons * 0.05; // 5% par semaine
  const projectedFCR = estimatedGrowth > 0 ? recentFeeding / estimatedGrowth : currentFCR;

  if (projectedFCR > 2.3 && projectedFCR > currentFCR * 1.1) {
    const severity = projectedFCR > 2.5 ? 'high' : 'medium';
    const confidence = Math.min(0.85, Math.max(0.6, 1 - (Math.abs(projectedFCR - currentFCR) / 2)));

    return {
      type: 'performance',
      severity,
      title: `FCR en dégradation prévue - ${cage.nom}`,
      message: `Le FCR pourrait atteindre ${projectedFCR.toFixed(2)} dans les 7 prochains jours (actuellement ${currentFCR.toFixed(2)})`,
      recommendations: [
        'Réduire la ration alimentaire de 10-15%',
        'Vérifier la qualité de l\'eau',
        'Contrôler l\'état de santé des poissons',
        'Ajuster la fréquence d\'alimentation'
      ],
      confidence,
      timeframe: '7 jours',
      estimatedImpact: (projectedFCR - 2.0) * recentFeeding * 1.2, // Coût supplémentaire estimé
      cageId: cage.id,
      prediction: {
        timeframe: '7 jours',
        probability: confidence * 100,
        preventionActions: [
          'Optimisation immédiate des rations',
          'Surveillance renforcée des paramètres'
        ]
      }
    };
  }

  return null;
}

async function analyzeMortalityRisk(supabase: any, cage: any): Promise<PredictionAlert | null> {
  // Récupérer l'historique de mortalité (14 derniers jours)
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const { data: healthData } = await supabase
    .from('health_observations')
    .select('mortalite, date_observation, statut')
    .eq('cage_id', cage.id)
    .gte('date_observation', twoWeeksAgo.toISOString().split('T')[0])
    .order('date_observation', { ascending: true });

  if (!healthData || healthData.length < 3) return null;

  // Calculer la tendance de mortalité
  const recentMortality = healthData.slice(-7).reduce((sum: number, obs: any) => sum + obs.mortalite, 0);
  const previousMortality = healthData.slice(0, -7).reduce((sum: number, obs: any) => sum + obs.mortalite, 0);
  
  const mortalityTrend = recentMortality - previousMortality;
  const alertCount = healthData.filter((obs: any) => obs.statut === 'alerte').length;

  // Prédiction basée sur la tendance et les alertes récentes
  if (mortalityTrend > 3 || (alertCount > 2 && recentMortality > 5)) {
    const projectedMortality = recentMortality + (mortalityTrend * 1.5);
    const severity = projectedMortality > 15 ? 'critical' : projectedMortality > 8 ? 'high' : 'medium';
    const confidence = Math.min(0.9, 0.7 + (alertCount * 0.1));

    return {
      type: 'health',
      severity,
      title: `Risque de mortalité élevé - ${cage.nom}`,
      message: `Mortalité projetée: ${projectedMortality.toFixed(1)} poissons/semaine (tendance: +${mortalityTrend})`,
      recommendations: [
        'Traitement préventif immédiat',
        'Isolement des poissons malades',
        'Amélioration de la qualité de l\'eau',
        'Consultation vétérinaire urgente',
        'Réduction de la densité si nécessaire'
      ],
      confidence,
      timeframe: '5-7 jours',
      estimatedImpact: projectedMortality * cage.poids_moyen * 6, // Perte estimée en euros
      cageId: cage.id,
      prediction: {
        timeframe: '5-7 jours',
        probability: confidence * 100,
        preventionActions: [
          'Intervention sanitaire immédiate',
          'Surveillance continue 24h/24'
        ]
      }
    };
  }

  return null;
}

async function analyzeWaterQualityTrend(supabase: any, cage: any): Promise<PredictionAlert | null> {
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const { data: waterData } = await supabase
    .from('water_quality')
    .select('temperature, ph, oxygene_dissous, statut, date_mesure')
    .eq('cage_id', cage.id)
    .gte('date_mesure', fiveDaysAgo.toISOString().split('T')[0])
    .order('date_mesure', { ascending: true });

  if (!waterData || waterData.length < 3) return null;

  // Analyser les tendances des paramètres critiques
  const recentData = waterData.slice(-3);
  const olderData = waterData.slice(0, -3);

  const avgRecentTemp = recentData.reduce((sum: number, d: any) => sum + d.temperature, 0) / recentData.length;
  const avgOlderTemp = olderData.length > 0 ? olderData.reduce((sum: number, d: any) => sum + d.temperature, 0) / olderData.length : avgRecentTemp;
  
  const avgRecentO2 = recentData.reduce((sum: number, d: any) => sum + d.oxygene_dissous, 0) / recentData.length;
  const avgOlderO2 = olderData.length > 0 ? olderData.reduce((sum: number, d: any) => sum + d.oxygene_dissous, 0) / olderData.length : avgRecentO2;

  const tempTrend = avgRecentTemp - avgOlderTemp;
  const o2Trend = avgRecentO2 - avgOlderO2;
  const problemCount = waterData.filter((d: any) => d.statut !== 'optimal').length;

  // Détection de conditions problématiques
  if (Math.abs(tempTrend) > 2 || o2Trend < -1 || problemCount > waterData.length * 0.4) {
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let issues = [];

    if (tempTrend > 3) {
      issues.push('augmentation rapide de température');
      severity = 'high';
    }
    if (tempTrend < -3) {
      issues.push('chute de température');
      severity = 'high';
    }
    if (o2Trend < -2) {
      issues.push('baisse d\'oxygène dissous');
      severity = avgRecentO2 < 5 ? 'critical' : 'high';
    }
    if (problemCount > waterData.length * 0.6) {
      severity = 'critical';
    }

    const confidence = Math.min(0.85, 0.6 + (problemCount / waterData.length));

    return {
      type: 'health',
      severity,
      title: `Dégradation qualité eau - ${cage.nom}`,
      message: `Tendances problématiques détectées: ${issues.join(', ')}. O2: ${avgRecentO2.toFixed(1)}mg/L, T°: ${avgRecentTemp.toFixed(1)}°C`,
      recommendations: [
        'Vérifier les systèmes d\'aération',
        'Contrôler la pompe à eau',
        'Réduire l\'alimentation temporairement',
        'Surveiller les paramètres toutes les 2h',
        'Préparer un traitement d\'urgence'
      ],
      confidence,
      timeframe: '2-3 jours',
      estimatedImpact: cage.nombre_poissons * 0.1 * cage.poids_moyen * 6, // Impact sanitaire estimé
      cageId: cage.id,
      prediction: {
        timeframe: '2-3 jours',
        probability: confidence * 100,
        preventionActions: [
          'Intervention technique immédiate',
          'Monitoring intensif des paramètres'
        ]
      }
    };
  }

  return null;
}

async function analyzeCostTrend(supabase: any, cage: any): Promise<PredictionAlert | null> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Coûts récents
  const { data: costs } = await supabase
    .from('cost_tracking')
    .select('montant, date_cout, categorie_cout')
    .eq('cage_id', cage.id)
    .gte('date_cout', thirtyDaysAgo.toISOString().split('T')[0]);

  // Alimentation récente
  const { data: feeding } = await supabase
    .from('feeding_sessions')
    .select('quantite, date_alimentation')
    .eq('cage_id', cage.id)
    .gte('date_alimentation', thirtyDaysAgo.toISOString().split('T')[0]);

  const feedingCost = feeding?.reduce((sum: number, f: any) => sum + (f.quantite * 1.2), 0) || 0;
  const otherCosts = costs?.reduce((sum: number, c: any) => sum + c.montant, 0) || 0;
  const totalCosts = feedingCost + otherCosts;

  const currentBiomass = cage.nombre_poissons * cage.poids_moyen;
  const costPerKg = currentBiomass > 0 ? totalCosts / currentBiomass : 0;

  if (costPerKg > 4.5) {
    const severity = costPerKg > 6 ? 'high' : 'medium';
    const confidence = 0.8;

    return {
      type: 'financial',
      severity,
      title: `Coûts élevés détectés - ${cage.nom}`,
      message: `Coût par kg: ${costPerKg.toFixed(2)}€ (seuil optimal: 4.0€). Coûts totaux: ${totalCosts.toFixed(2)}€`,
      recommendations: [
        'Optimiser les rations alimentaires',
        'Négocier avec les fournisseurs',
        'Améliorer l\'efficacité FCR',
        'Réduire les coûts annexes',
        'Accélérer la croissance'
      ],
      confidence,
      timeframe: '30 jours',
      estimatedImpact: (costPerKg - 4.0) * currentBiomass,
      cageId: cage.id,
      prediction: {
        timeframe: '30 jours',
        probability: confidence * 100,
        preventionActions: [
          'Révision immédiate des protocoles',
          'Optimisation des achats'
        ]
      }
    };
  }

  return null;
}

async function analyzeOptimalHarvest(supabase: any, cage: any): Promise<PredictionAlert | null> {
  const targetWeight = 0.8; // 800g
  const currentWeight = cage.poids_moyen || 0;
  
  if (currentWeight >= targetWeight * 0.9) { // 90% du poids cible
    const daysToOptimal = currentWeight >= targetWeight ? 0 : Math.ceil((targetWeight - currentWeight) / 0.02); // 20g/jour croissance

    const confidence = currentWeight >= targetWeight ? 0.95 : 0.8;
    const severity = currentWeight >= targetWeight ? 'medium' : 'low';

    return {
      type: 'predictive',
      severity,
      title: `Récolte optimale approche - ${cage.nom}`,
      message: daysToOptimal === 0 
        ? `Poids optimal atteint (${currentWeight.toFixed(2)}kg). Récolte recommandée maintenant.`
        : `Poids optimal dans ${daysToOptimal} jours. Poids actuel: ${currentWeight.toFixed(2)}kg`,
      recommendations: [
        'Planifier la récolte',
        'Préparer les équipements',
        'Contacter les acheteurs',
        'Vérifier les prix du marché',
        'Organiser la logistique'
      ],
      confidence,
      timeframe: daysToOptimal === 0 ? 'Immédiat' : `${daysToOptimal} jours`,
      estimatedImpact: cage.nombre_poissons * currentWeight * 6, // Valeur estimée de la récolte
      cageId: cage.id,
      prediction: {
        timeframe: daysToOptimal === 0 ? 'Immédiat' : `${daysToOptimal} jours`,
        probability: confidence * 100,
        preventionActions: [
          'Préparation logistique',
          'Optimisation des prix de vente'
        ]
      }
    };
  }

  return null;
}