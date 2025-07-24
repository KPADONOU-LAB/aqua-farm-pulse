import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface ProductionPrediction {
  id: string;
  cage_id: string;
  type_prediction: string;
  valeur_predite: number;
  horizon_jours: number;
  intervalle_confiance: number;
  date_prediction: string;
  created_at: string;
  cage?: {
    nom: string;
  };
}

export const useProductionPredictions = () => {
  const [predictions, setPredictions] = useState<ProductionPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPredictions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('production_predictions')
        .select(`
          *,
          cage:cages(nom)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPredictions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des prédictions:', error);
      toast.error('Erreur lors du chargement des prédictions');
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async (cageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('generate_production_predictions', {
        cage_id_param: cageId
      });

      if (error) throw error;
      toast.success('Prédictions générées avec succès');
      fetchPredictions();
    } catch (error) {
      console.error('Erreur lors de la génération des prédictions:', error);
      toast.error('Erreur lors de la génération des prédictions');
    }
  };

  const getPredictionsByType = (type: string) => {
    return predictions.filter(p => p.type_prediction === type);
  };

  const getPredictionsByCage = (cageId: string) => {
    return predictions.filter(p => p.cage_id === cageId);
  };

  useEffect(() => {
    if (user) {
      fetchPredictions();
    }
  }, [user]);

  return {
    predictions,
    loading,
    fetchPredictions,
    generatePredictions,
    getPredictionsByType,
    getPredictionsByCage
  };
};