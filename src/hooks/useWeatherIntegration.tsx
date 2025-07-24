import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  description: string;
  rain: number;
  cloudiness: number;
}

interface FeedingRecommendation {
  cage_id: string;
  cage_name: string;
  current_plan: number;
  recommended_quantity: number;
  adjustment_factor: number;
  reasoning: string;
  weather_impact: string;
}

interface WeatherResponse {
  success: boolean;
  weather: WeatherData;
  recommendations: FeedingRecommendation[];
  timestamp: string;
}

export const useWeatherIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<FeedingRecommendation[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const { user } = useAuth();

  const getWeatherRecommendations = async (location: string = 'Paris,FR'): Promise<WeatherResponse> => {
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('weather-integration', {
        body: {
          user_id: user.id,
          location
        }
      });

      if (error) throw error;

      if (data.success) {
        setWeatherData(data.weather);
        setRecommendations(data.recommendations);
        setLastUpdate(data.timestamp);
        
        toast.success('Recommandations météo mises à jour');
      } else {
        throw new Error(data.error || 'Erreur lors de la récupération des données météo');
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données météo:', error);
      toast.error('Erreur lors de la récupération des données météo');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const applyWeatherAdjustments = async (cageId: string, adjustmentFactor: number) => {
    if (!user) return;

    try {
      // Récupérer le plan d'alimentation actuel
      const { data: plan } = await supabase
        .from('feeding_plans')
        .select('*')
        .eq('cage_id', cageId)
        .eq('statut', 'actif')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (plan) {
        const newQuantity = plan.quantite_prevue_jour * adjustmentFactor;
        
        // Enregistrer l'ajustement
        await supabase.from('feeding_adjustments').insert({
          user_id: user.id,
          cage_id: cageId,
          feeding_plan_id: plan.id,
          ancienne_quantite: plan.quantite_prevue_jour,
          nouvelle_quantite: newQuantity,
          ancien_pourcentage: plan.pourcentage_poids_corporel,
          nouveau_pourcentage: plan.pourcentage_poids_corporel * adjustmentFactor,
          raison_ajustement: 'ajustement_meteo',
          biomasse_actuelle: plan.poids_corporel_total,
          poids_moyen_actuel: plan.poids_corporel_total / plan.quantite_prevue_jour * 3, // estimation
          notes: `Ajustement automatique basé sur les conditions météorologiques (facteur: ${adjustmentFactor})`
        });

        // Mettre à jour le plan
        await supabase
          .from('feeding_plans')
          .update({
            quantite_prevue_jour: newQuantity,
            pourcentage_poids_corporel: plan.pourcentage_poids_corporel * adjustmentFactor,
            updated_at: new Date().toISOString()
          })
          .eq('id', plan.id);

        toast.success('Plan d\'alimentation ajusté selon la météo');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajustement du plan:', error);
      toast.error('Erreur lors de l\'ajustement du plan d\'alimentation');
    }
  };

  const getWeatherImpactSummary = () => {
    if (!weatherData || !recommendations.length) return null;

    const avgAdjustment = recommendations.reduce((acc, rec) => acc + rec.adjustment_factor, 0) / recommendations.length;
    const totalImpactedCages = recommendations.filter(rec => rec.adjustment_factor !== 1.0).length;
    
    return {
      temperature: weatherData.temperature,
      description: weatherData.description,
      avgAdjustmentFactor: Math.round(avgAdjustment * 100) / 100,
      impactedCages: totalImpactedCages,
      totalCages: recommendations.length,
      strongestImpact: recommendations.reduce((max, rec) => 
        Math.abs(rec.adjustment_factor - 1) > Math.abs(max.adjustment_factor - 1) ? rec : max
      , recommendations[0])
    };
  };

  // Mise à jour automatique toutes les 2 heures
  useEffect(() => {
    if (user) {
      getWeatherRecommendations();
      
      const interval = setInterval(() => {
        getWeatherRecommendations();
      }, 2 * 60 * 60 * 1000); // 2 heures

      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    loading,
    weatherData,
    recommendations,
    lastUpdate,
    getWeatherRecommendations,
    applyWeatherAdjustments,
    getWeatherImpactSummary
  };
};