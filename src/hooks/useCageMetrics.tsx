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
  const [cages, setCages] = useState<any[]>([]);

  // Charger toutes les cages de l'utilisateur
  const fetchCages = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCages(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des cages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCages();
    }
  }, [user]);

  const calculateCageMetrics = async (cageId: string): Promise<CageMetrics> => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    try {
      // Utiliser la fonction optimisée qui calcule tous les métriques en une fois
      const { data: allMetrics, error: metricsError } = await supabase.rpc('update_all_cage_metrics', {
        cage_id_param: cageId
      });

      if (metricsError) throw metricsError;

      const metrics = allMetrics as any;
      return {
        fcr: metrics?.fcr || 0,
        growthRate: metrics?.growth_rate || 0,
        mortalityRate: metrics?.mortality_rate || 0,
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

      // Recharger la liste des cages
      fetchCages();

      return metrics;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des métriques:', error);
      throw error;
    }
  };

  return {
    cages,
    fetchCages,
    calculateCageMetrics,
    getCageDailyHistory,
    updateAllCageMetrics,
    loading
  };
};