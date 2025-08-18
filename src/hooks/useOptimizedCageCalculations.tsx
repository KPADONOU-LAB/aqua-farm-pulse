import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useFarm } from '@/contexts/FarmContext';

interface CageCalculationResult {
  cage_id: string;
  remaining_fish: number;
  fcr: number;
  mortality_rate: number;
  growth_rate: number;
  cost_per_kg: number;
}

export const useOptimizedCageCalculations = () => {
  const { user } = useAuth();
  const { formatCurrency } = useFarm();
  const [loading, setLoading] = useState(false);
  const [calculations, setCalculations] = useState<Record<string, CageCalculationResult>>({});

  // Mettre à jour automatiquement tous les calculs de cages
  const updateAllCageCalculations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Récupérer toutes les cages actives
      const { data: cages, error: cagesError } = await supabase
        .from('cages')
        .select('id, user_id')
        .eq('user_id', user.id)
        .eq('statut', 'actif');

      if (cagesError) throw cagesError;

      const results: Record<string, CageCalculationResult> = {};

      // Calculer les métriques pour chaque cage en parallèle
      const calculationPromises = (cages || []).map(async (cage) => {
        try {
          // Utiliser la fonction optimisée qui calcule tout en une fois
          const { data: metrics, error } = await supabase.rpc('update_all_cage_metrics', {
            cage_id_param: cage.id
          });

          if (error) throw error;

          if (metrics) {
            const metricsObj = metrics as any;
            results[cage.id] = {
              cage_id: cage.id,
              remaining_fish: metricsObj.remaining_fish || 0,
              fcr: metricsObj.fcr || 0,
              mortality_rate: metricsObj.mortality_rate || 0,
              growth_rate: metricsObj.growth_rate || 0,
              cost_per_kg: metricsObj.cost_per_kg || 0
            };
          }
        } catch (error) {
          console.error(`Erreur calcul métriques cage ${cage.id}:`, error);
        }
      });

      await Promise.allSettled(calculationPromises);
      setCalculations(results);

      return results;
    } catch (error) {
      console.error('Erreur lors du calcul automatique des métriques:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Calculer les métriques pour une cage spécifique
  const calculateSingleCage = async (cageId: string) => {
    if (!user) return null;

    try {
      const { data: metrics, error } = await supabase.rpc('update_all_cage_metrics', {
        cage_id_param: cageId
      });

      if (error) throw error;

      if (metrics) {
        const metricsObj = metrics as any;
        const result: CageCalculationResult = {
          cage_id: cageId,
          remaining_fish: metricsObj.remaining_fish || 0,
          fcr: metricsObj.fcr || 0,
          mortality_rate: metricsObj.mortality_rate || 0,
          growth_rate: metricsObj.growth_rate || 0,
          cost_per_kg: metricsObj.cost_per_kg || 0
        };

        setCalculations(prev => ({
          ...prev,
          [cageId]: result
        }));

        return result;
      }
    } catch (error) {
      console.error(`Erreur calcul métriques cage ${cageId}:`, error);
      return null;
    }
  };

  // Obtenir les calculs pour une cage
  const getCageCalculations = (cageId: string): CageCalculationResult | null => {
    return calculations[cageId] || null;
  };

  // Formater les résultats pour l'affichage
  const formatCalculationResults = (cageId: string) => {
    const calc = calculations[cageId];
    if (!calc) return null;

    return {
      remaining_fish_formatted: calc.remaining_fish.toLocaleString(),
      fcr_formatted: calc.fcr.toFixed(2),
      mortality_rate_formatted: `${calc.mortality_rate.toFixed(1)}%`,
      growth_rate_formatted: `${calc.growth_rate.toFixed(1)}%`,
      cost_per_kg_formatted: formatCurrency(calc.cost_per_kg),
      survival_rate_formatted: `${(100 - calc.mortality_rate).toFixed(1)}%`
    };
  };

  // Calculer le statut de performance d'une cage
  const getPerformanceStatus = (cageId: string) => {
    const calc = calculations[cageId];
    if (!calc) return { status: 'unknown', label: 'Non calculé', color: 'muted' };

    const { fcr, mortality_rate } = calc;

    if (fcr <= 1.5 && mortality_rate <= 5) {
      return { status: 'excellent', label: 'Excellent', color: 'success' };
    } else if (fcr <= 2.0 && mortality_rate <= 10) {
      return { status: 'good', label: 'Bon', color: 'primary' };
    } else if (fcr <= 2.5 && mortality_rate <= 15) {
      return { status: 'average', label: 'Moyen', color: 'warning' };
    } else {
      return { status: 'critical', label: 'Critique', color: 'destructive' };
    }
  };

  // Déclencher les calculs automatiquement au montage et quand l'utilisateur change
  useEffect(() => {
    if (user) {
      updateAllCageCalculations();
    }
  }, [user]);

  return {
    loading,
    calculations,
    updateAllCageCalculations,
    calculateSingleCage,
    getCageCalculations,
    formatCalculationResults,
    getPerformanceStatus
  };
};