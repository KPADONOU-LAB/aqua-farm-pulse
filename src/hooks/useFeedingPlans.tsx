import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface FeedingPlan {
  id: string;
  cage_id: string;
  pourcentage_poids_corporel: number;
  frequence_par_jour: number;
  poids_corporel_total: number;
  quantite_prevue_jour: number;
  date_debut: string;
  date_fin?: string;
  statut: string;
  notes?: string;
  cage?: {
    nom: string;
    espece: string;
  } | null;
}

export const useFeedingPlans = () => {
  const [feedingPlans, setFeedingPlans] = useState<FeedingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFeedingPlans = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('feeding_plans')
        .select(`
          *,
          cage:cages(nom, espece)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedingPlans((data as unknown as FeedingPlan[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des plans d\'alimentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFeedingPlan = async (plan: Omit<FeedingPlan, 'id' | 'cage'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('feeding_plans')
        .insert([{ ...plan, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      // Calculer automatiquement la planification
      await supabase.rpc('calculate_feeding_plan', { cage_id_param: plan.cage_id });
      
      await fetchFeedingPlans();
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du plan:', error);
      throw error;
    }
  };

  const updateFeedingPlan = async (id: string, updates: Partial<FeedingPlan>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('feeding_plans')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchFeedingPlans();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  };

  const calculateDailyQuantity = (biomass: number, percentage: number) => {
    return (biomass * percentage) / 100;
  };

  useEffect(() => {
    fetchFeedingPlans();
  }, [user]);

  return {
    feedingPlans,
    loading,
    createFeedingPlan,
    updateFeedingPlan,
    calculateDailyQuantity,
    refetch: fetchFeedingPlans
  };
};