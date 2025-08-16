import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IoTSensorData {
  sensor_id: string;
  sensor_type: string;
  cage_id: string;
  values: {
    temperature?: number;
    ph?: number;
    dissolved_oxygen?: number;
    turbidity?: number;
    ammonia?: number;
    nitrite?: number;
    nitrate?: number;
  };
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    depth?: number;
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

    const { user_id, action, sensor_data, cage_id } = await req.json();

    if (action === 'process_sensor_data') {
      const results = [];
      
      // Traiter les données des capteurs IoT
      for (const data of sensor_data as IoTSensorData[]) {
        // Insérer les données de qualité d'eau automatiquement
        if (data.values.temperature || data.values.ph || data.values.dissolved_oxygen) {
          const { error: waterError } = await supabase
            .from('water_quality')
            .insert({
              user_id,
              cage_id: data.cage_id,
              date_mesure: new Date(data.timestamp).toISOString().split('T')[0],
              heure: new Date(data.timestamp).toTimeString().split(' ')[0],
              temperature: data.values.temperature || 25,
              ph: data.values.ph || 7.5,
              oxygene_dissous: data.values.dissolved_oxygen || 8,
              turbidite: data.values.turbidity || 5,
              statut: determineWaterStatus(data.values),
              observations: `Données automatiques capteur ${data.sensor_id}`
            });

          if (waterError) {
            console.error('Error inserting water quality:', waterError);
          }
        }

        // Générer des alertes automatiques basées sur les seuils
        const alerts = generateIoTAlerts(data, user_id);
        
        for (const alert of alerts) {
          const { error: alertError } = await supabase
            .from('smart_alerts')
            .insert(alert);
            
          if (alertError) {
            console.error('Error inserting alert:', alertError);
          }
        }

        results.push({
          sensor_id: data.sensor_id,
          processed: true,
          alerts_generated: alerts.length
        });
      }

      return new Response(JSON.stringify({
        success: true,
        processed_sensors: results.length,
        results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get_sensor_recommendations') {
      // Recommandations intelligentes pour l'installation de capteurs
      const { data: cages } = await supabase
        .from('cages')
        .select('*')
        .eq('user_id', user_id)
        .eq('statut', 'en_production');

      const recommendations = [];

      for (const cage of cages || []) {
        // Analyser les données existantes pour identifier les besoins
        const { data: waterQuality } = await supabase
          .from('water_quality')
          .select('*')
          .eq('cage_id', cage.id)
          .order('date_mesure', { ascending: false })
          .limit(10);

        const { data: healthObs } = await supabase
          .from('health_observations')
          .select('*')
          .eq('cage_id', cage.id)
          .order('date_observation', { ascending: false })
          .limit(10);

        const recommendation = generateSensorRecommendations(cage, waterQuality, healthObs);
        recommendations.push(recommendation);
      }

      return new Response(JSON.stringify({
        success: true,
        recommendations
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'automated_feeding_adjustment') {
      // Ajustement automatique de l'alimentation basé sur les capteurs
      const { data: recentData } = await supabase
        .from('water_quality')
        .select('*')
        .eq('cage_id', cage_id)
        .order('date_mesure', { ascending: false })
        .limit(5);

      const { data: feedingPlan } = await supabase
        .from('feeding_plans')
        .select('*')
        .eq('cage_id', cage_id)
        .eq('statut', 'actif')
        .single();

      if (recentData && feedingPlan) {
        const adjustment = calculateFeedingAdjustment(recentData, feedingPlan);
        
        if (adjustment.should_adjust) {
          const { error } = await supabase
            .from('feeding_adjustments')
            .insert({
              user_id,
              cage_id,
              feeding_plan_id: feedingPlan.id,
              ancienne_quantite: feedingPlan.quantite_prevue_jour,
              nouvelle_quantite: adjustment.new_quantity,
              ancien_pourcentage: feedingPlan.pourcentage_poids_corporel,
              nouveau_pourcentage: adjustment.new_percentage,
              raison_ajustement: 'iot_automatic',
              biomasse_actuelle: feedingPlan.poids_corporel_total,
              poids_moyen_actuel: 0,
              notes: `Ajustement automatique: ${adjustment.reason}`
            });

          if (!error) {
            await supabase
              .from('feeding_plans')
              .update({
                quantite_prevue_jour: adjustment.new_quantity,
                pourcentage_poids_corporel: adjustment.new_percentage
              })
              .eq('id', feedingPlan.id);
          }

          return new Response(JSON.stringify({
            success: true,
            adjustment_made: true,
            details: adjustment
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        adjustment_made: false,
        message: 'No adjustment needed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in iot-integration:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function determineWaterStatus(values: any): string {
  const { temperature, ph, dissolved_oxygen } = values;
  
  if (temperature && (temperature < 20 || temperature > 30)) return 'critique';
  if (ph && (ph < 6.5 || ph > 8.5)) return 'critique';
  if (dissolved_oxygen && dissolved_oxygen < 5) return 'critique';
  
  if (temperature && (temperature < 22 || temperature > 28)) return 'attention';
  if (ph && (ph < 7 || ph > 8)) return 'attention';
  if (dissolved_oxygen && dissolved_oxygen < 6) return 'attention';
  
  return 'optimal';
}

function generateIoTAlerts(data: IoTSensorData, user_id: string) {
  const alerts = [];
  const { values } = data;

  if (values.temperature && values.temperature < 18) {
    alerts.push({
      user_id,
      cage_id: data.cage_id,
      type_alerte: 'temperature_critique',
      niveau_criticite: 'error',
      titre: 'Température critique détectée',
      message: `Température de ${values.temperature}°C trop basse (capteur ${data.sensor_id})`,
      recommandations: ['Vérifier le système de chauffage', 'Surveiller les poissons', 'Ajuster l\'alimentation'],
      donnees_contexte: { sensor_id: data.sensor_id, value: values.temperature }
    });
  }

  if (values.dissolved_oxygen && values.dissolved_oxygen < 4) {
    alerts.push({
      user_id,
      cage_id: data.cage_id,
      type_alerte: 'oxygene_critique',
      niveau_criticite: 'error',
      titre: 'Oxygène dissous critique',
      message: `Niveau d'oxygène de ${values.dissolved_oxygen}mg/L trop bas`,
      recommandations: ['Activer l\'aérateur d\'urgence', 'Réduire l\'alimentation', 'Vérifier la densité'],
      donnees_contexte: { sensor_id: data.sensor_id, value: values.dissolved_oxygen }
    });
  }

  if (values.ph && (values.ph < 6.0 || values.ph > 9.0)) {
    alerts.push({
      user_id,
      cage_id: data.cage_id,
      type_alerte: 'ph_critique',
      niveau_criticite: 'error',
      titre: 'pH critique détecté',
      message: `pH de ${values.ph} hors limites acceptables`,
      recommandations: ['Ajuster le pH immédiatement', 'Tester l\'eau', 'Vérifier les sources de pollution'],
      donnees_contexte: { sensor_id: data.sensor_id, value: values.ph }
    });
  }

  return alerts;
}

function generateSensorRecommendations(cage: any, waterQuality: any[], healthObs: any[]) {
  const recommendations = {
    cage_id: cage.id,
    cage_name: cage.nom,
    priority_sensors: [],
    optional_sensors: [],
    estimated_roi: 0,
    implementation_cost: 0
  };

  // Analyser les problèmes récurrents
  const hasWaterIssues = waterQuality?.some(wq => wq.statut === 'critique') || false;
  const hasHealthIssues = healthObs?.some(ho => ho.mortalite > 5) || false;
  const hasFrequentMeasurements = waterQuality?.length > 8;

  if (hasWaterIssues) {
    recommendations.priority_sensors.push({
      type: 'Capteur multi-paramètres eau',
      description: 'Surveillance continue pH, O2, température',
      estimated_cost: 800,
      roi_months: 3
    });
  }

  if (hasHealthIssues) {
    recommendations.priority_sensors.push({
      type: 'Caméra sous-marine IA',
      description: 'Détection précoce de comportements anormaux',
      estimated_cost: 1200,
      roi_months: 4
    });
  }

  if (!hasFrequentMeasurements) {
    recommendations.optional_sensors.push({
      type: 'Station météo locale',
      description: 'Prédiction des variations environnementales',
      estimated_cost: 500,
      roi_months: 6
    });
  }

  recommendations.estimated_roi = calculateSensorROI(cage, recommendations.priority_sensors);
  recommendations.implementation_cost = recommendations.priority_sensors.reduce((sum, sensor) => sum + sensor.estimated_cost, 0);

  return recommendations;
}

function calculateFeedingAdjustment(waterData: any[], feedingPlan: any) {
  const latestData = waterData[0];
  const avgOxygen = waterData.reduce((sum, item) => sum + item.oxygene_dissous, 0) / waterData.length;
  const avgTemp = waterData.reduce((sum, item) => sum + item.temperature, 0) / waterData.length;

  let adjustmentFactor = 1.0;
  let reason = '';

  // Ajustement basé sur l'oxygène dissous
  if (avgOxygen < 5) {
    adjustmentFactor *= 0.8; // Réduire de 20%
    reason += 'Oxygène faible, ';
  } else if (avgOxygen > 8) {
    adjustmentFactor *= 1.1; // Augmenter de 10%
    reason += 'Oxygène optimal, ';
  }

  // Ajustement basé sur la température
  if (avgTemp < 20) {
    adjustmentFactor *= 0.9; // Réduire de 10%
    reason += 'Température basse, ';
  } else if (avgTemp > 28) {
    adjustmentFactor *= 0.85; // Réduire de 15%
    reason += 'Température élevée, ';
  }

  const newQuantity = feedingPlan.quantite_prevue_jour * adjustmentFactor;
  const newPercentage = feedingPlan.pourcentage_poids_corporel * adjustmentFactor;

  return {
    should_adjust: Math.abs(adjustmentFactor - 1.0) > 0.05, // Ajuster si différence > 5%
    new_quantity: Math.round(newQuantity * 100) / 100,
    new_percentage: Math.round(newPercentage * 100) / 100,
    adjustment_factor: adjustmentFactor,
    reason: reason.slice(0, -2) // Enlever la dernière virgule
  };
}

function calculateSensorROI(cage: any, sensors: any[]): number {
  // Calcul simplifié du ROI basé sur la réduction des pertes
  const averageLossReduction = 0.15; // 15% de réduction des pertes
  const cageValue = (cage.nombre_poissons || 0) * (cage.poids_moyen || 0) * 6; // 6€/kg
  const monthlySavings = cageValue * averageLossReduction / 12;
  const sensorCost = sensors.reduce((sum, sensor) => sum + sensor.estimated_cost, 0);
  
  return sensorCost > 0 ? (monthlySavings * 12) / sensorCost * 100 : 0;
}