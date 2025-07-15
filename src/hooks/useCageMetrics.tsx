import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface CageMetrics {
  fcr: number;
  growthRate: number;
  mortalityRate: number;
}

interface DailyHistory {
  date_activite: string;
  alimentation: any;
  qualite_eau: any;
  sante: any;
  ventes: any;
  finance: any;
}

export const useCageMetrics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const calculateCageMetrics = async (cageId: string): Promise<CageMetrics> => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Calculer FCR
      const { data: fcrData, error: fcrError } = await supabase.rpc('calculate_cage_fcr', {
        cage_id_param: cageId
      });

      if (fcrError) throw fcrError;

      // Calculer taux de croissance
      const { data: growthData, error: growthError } = await supabase.rpc('calculate_cage_growth_rate', {
        cage_id_param: cageId
      });

      if (growthError) throw growthError;

      // Calculer taux de mortalité
      const { data: mortalityData, error: mortalityError } = await supabase.rpc('calculate_cage_mortality_rate', {
        cage_id_param: cageId
      });

      if (mortalityError) throw mortalityError;

      // Mettre à jour le taux de mortalité dans la table cages
      await supabase
        .from('cages')
        .update({ taux_mortalite: mortalityData })
        .eq('id', cageId)
        .eq('user_id', user.id);

      return {
        fcr: fcrData || 0,
        growthRate: growthData || 0,
        mortalityRate: mortalityData || 0,
      };
    } finally {
      setLoading(false);
    }
  };

  const getCageDailyHistory = async (
    cageId: string, 
    dateDebut?: string, 
    dateFin?: string
  ): Promise<DailyHistory[]> => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_cage_daily_history', {
        cage_id_param: cageId,
        date_debut: dateDebut || null,
        date_fin: dateFin || null
      });

      if (error) throw error;

      return data || [];
    } finally {
      setLoading(false);
    }
  };

  const updateAllCageMetrics = async (cageId: string) => {
    if (!user) return;

    try {
      const metrics = await calculateCageMetrics(cageId);
      
      // Rafraîchir les données de la cage
      await supabase
        .from('cages')
        .select('*')
        .eq('id', cageId)
        .eq('user_id', user.id)
        .single();

      return metrics;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des métriques:', error);
      throw error;
    }
  };

  return {
    calculateCageMetrics,
    getCageDailyHistory,
    updateAllCageMetrics,
    loading
  };
};