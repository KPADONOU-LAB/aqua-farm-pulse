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

      if (error) throw error;

      if (data.success) {
        setLastPredictions(data.predictions);
        toast.success(data.message || 'Prédictions IA générées avec succès');
      } else {
        throw new Error(data.error || 'Erreur lors de la génération des prédictions');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la génération des prédictions IA:', error);
      toast.error('Erreur lors de la génération des prédictions IA');
      throw error;
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

  return {
    loading,
    lastPredictions,
    generatePredictions,
    generateRecommendations,
    analyzeCagePerformance,
    predictOptimalHarvestTime
  };
};