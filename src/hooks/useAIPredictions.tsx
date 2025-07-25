import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface AIPrediction {
  type: string;
  value: number;
  horizon_days: number;
  confidence: number;
  parameters: any;
  reasoning: string;
}

interface PredictionResult {
  success: boolean;
  predictions: AIPrediction[];
  message: string;
}

export const useAIPredictions = () => {
  const [loading, setLoading] = useState(false);
  const [lastPredictions, setLastPredictions] = useState<AIPrediction[]>([]);
  const { user } = useAuth();

  const generatePredictions = async (
    cageId: string, 
    predictionTypes: string[] = ['poids_final', 'biomasse_totale', 'profit_estime', 'jours_recolte', 'fcr_final']
  ): Promise<PredictionResult> => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-predictions', {
        body: {
          cage_id: cageId,
          user_id: user.id,
          prediction_types: predictionTypes
        }
      });

      if (error) {
        console.error('Erreur Edge Function:', error);
        // Fallback vers des prédictions simplifiées
        const fallbackPredictions = await generateFallbackPredictions(cageId, predictionTypes);
        setLastPredictions(fallbackPredictions);
        toast.success('Prédictions de base générées (mode hors ligne)');
        return { success: true, predictions: fallbackPredictions, message: 'Prédictions générées en mode local' };
      }

      if (data.success) {
        setLastPredictions(data.predictions);
        toast.success(data.message || 'Prédictions IA générées avec succès');
      } else {
        throw new Error(data.error || 'Erreur lors de la génération des prédictions');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la génération des prédictions IA:', error);
      // Fallback en cas d'erreur
      try {
        const fallbackPredictions = await generateFallbackPredictions(cageId, predictionTypes);
        setLastPredictions(fallbackPredictions);
        toast.error('Service IA indisponible - Prédictions de base générées');
        return { success: true, predictions: fallbackPredictions, message: 'Prédictions de base' };
      } catch (fallbackError) {
        toast.error('Erreur lors de la génération des prédictions');
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async (cageId: string) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-predictions', {
        body: {
          cage_id: cageId,
          user_id: user.id,
          prediction_types: ['recommandations_alimentation', 'optimisation_fcr', 'plan_recolte']
        }
      });

      if (error) throw error;

      toast.success('Recommandations IA générées');
      return data;
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
      toast.error('Erreur lors de la génération des recommandations');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const analyzeCagePerformance = async (cageId: string) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-predictions', {
        body: {
          cage_id: cageId,
          user_id: user.id,
          prediction_types: ['analyse_performance', 'comparaison_objectifs', 'points_amelioration']
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'analyse de performance:', error);
      throw error;
    }
  };

  const predictOptimalHarvestTime = async (cageId: string) => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-predictions', {
        body: {
          cage_id: cageId,
          user_id: user.id,
          prediction_types: ['date_recolte_optimale', 'poids_optimal', 'profit_maximal']
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la prédiction de récolte:', error);
      throw error;
    }
  };

  // Fonction locale pour générer des prédictions de base sans IA
  const generateFallbackPredictions = async (cageId: string, predictionTypes: string[]): Promise<AIPrediction[]> => {
    // Récupérer les données de base de la cage
    const { data: cage } = await supabase
      .from('cages')
      .select('*')
      .eq('id', cageId)
      .eq('user_id', user.id)
      .single();

    if (!cage) return [];

    const predictions: AIPrediction[] = [];
    const currentWeight = cage.poids_moyen || 0.1;
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
        reasoning: 'Calcul basé sur taux de croissance moyen standardisé'
      });
    }
    
    if (predictionTypes.includes('biomasse_totale')) {
      const finalBiomass = cage.nombre_poissons * targetWeight;
      predictions.push({
        type: 'biomasse_totale',
        value: finalBiomass,
        horizon_days: 60,
        confidence: 80,
        parameters: { fish_count: cage.nombre_poissons, target_weight: targetWeight },
        reasoning: 'Biomasse estimée à maturité commerciale'
      });
    }
    
    if (predictionTypes.includes('profit_estime')) {
      const revenue = cage.nombre_poissons * targetWeight * 6.5; // 6.5€/kg
      const estimatedCosts = cage.nombre_poissons * targetWeight * 3.8; // 3.8€/kg
      const profit = revenue - estimatedCosts;
      
      predictions.push({
        type: 'profit_estime',
        value: profit,
        horizon_days: 60,
        confidence: 70,
        parameters: { revenue, costs: estimatedCosts, price_per_kg: 6.5 },
        reasoning: 'Profit basé sur prix marché actuel et coûts moyens'
      });
    }

    if (predictionTypes.includes('jours_recolte')) {
      const daysToHarvest = Math.ceil(Math.log(targetWeight / currentWeight) / Math.log(1 + dailyGrowthRate));
      predictions.push({
        type: 'jours_recolte',
        value: daysToHarvest,
        horizon_days: daysToHarvest,
        confidence: 75,
        parameters: { current_weight: currentWeight, target_weight: targetWeight },
        reasoning: 'Estimation basée sur la courbe de croissance standard'
      });
    }
    
    return predictions;
  };

  return {
    loading,
    lastPredictions,
    generatePredictions,
    generateRecommendations,
    analyzeCagePerformance,
    predictOptimalHarvestTime
  };
};