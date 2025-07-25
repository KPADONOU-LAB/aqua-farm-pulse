import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type HealthObservation = Database['public']['Tables']['health_observations']['Row'];
type WeeklyWeighing = Database['public']['Tables']['weekly_weighings']['Row'];

export function useOptimizedHealthData(cageId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Observations de santé
  const {
    data: healthObservations,
    isLoading: isLoadingHealth,
    error: healthError,
    refetch: refetchHealth
  } = useQuery({
    queryKey: ['health_observations', user?.id, cageId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('health_observations')
        .select('*, cages(nom)')
        .order('date_observation', { ascending: false });

      if (cageId) {
        query = query.eq('cage_id', cageId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HealthObservation[];
    },
    enabled: !!user,
  });

  // Pesées hebdomadaires
  const {
    data: weeklyWeighings,
    isLoading: isLoadingWeighings,
    error: weighingsError
  } = useQuery({
    queryKey: ['weekly_weighings', user?.id, cageId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('weekly_weighings')
        .select('*, cages(nom)')
        .order('date_pesee', { ascending: false });

      if (cageId) {
        query = query.eq('cage_id', cageId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WeeklyWeighing[];
    },
    enabled: !!user,
  });

  // Créer une observation de santé
  const createHealthObservation = useMutation({
    mutationFn: async (newObservation: Database['public']['Tables']['health_observations']['Insert']) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('health_observations')
        .insert({ ...newObservation, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health_observations'] });
      queryClient.invalidateQueries({ queryKey: ['cages'] });
      queryClient.invalidateQueries({ queryKey: ['smart_alerts'] });
      toast({
        title: "Succès",
        description: "Observation de santé enregistrée",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Créer une pesée hebdomadaire
  const createWeeklyWeighing = useMutation({
    mutationFn: async (newWeighing: Database['public']['Tables']['weekly_weighings']['Insert']) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('weekly_weighings')
        .insert({ ...newWeighing, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly_weighings'] });
      queryClient.invalidateQueries({ queryKey: ['cages'] });
      toast({
        title: "Succès",
        description: "Pesée hebdomadaire enregistrée",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Statistiques consolidées de santé
  const healthStats = {
    totalObservations: healthObservations?.length || 0,
    totalMortality: healthObservations?.reduce((total, obs) => total + (obs.mortalite || 0), 0) || 0,
    recentMortality: healthObservations?.filter(obs => 
      new Date(obs.date_observation) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).reduce((total, obs) => total + (obs.mortalite || 0), 0) || 0,
    abnormalObservations: healthObservations?.filter(obs => obs.statut !== 'normal').length || 0,
    totalWeighings: weeklyWeighings?.length || 0,
    latestWeight: weeklyWeighings?.[0]?.poids_moyen_echantillon || 0,
    weightTrend: weeklyWeighings && weeklyWeighings.length >= 2 
      ? ((weeklyWeighings[0]?.poids_moyen_echantillon || 0) - (weeklyWeighings[1]?.poids_moyen_echantillon || 0))
      : 0
  };

  return {
    // Données
    healthObservations: healthObservations || [],
    weeklyWeighings: weeklyWeighings || [],
    healthStats,
    
    // États de chargement
    isLoading: isLoadingHealth || isLoadingWeighings,
    isLoadingHealth,
    isLoadingWeighings,
    
    // Erreurs
    error: healthError || weighingsError,
    
    // Actions
    createHealthObservation: createHealthObservation.mutate,
    createWeeklyWeighing: createWeeklyWeighing.mutate,
    refetchHealth,
    
    // États des mutations
    isCreatingObservation: createHealthObservation.isPending,
    isCreatingWeighing: createWeeklyWeighing.isPending,
  };
}