import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

type FeedingSession = Database['public']['Tables']['feeding_sessions']['Row'];
type FeedingPlan = Database['public']['Tables']['feeding_plans']['Row'];

export function useOptimizedFeedingData(cageId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sessions d'alimentation
  const {
    data: feedingSessions,
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch: refetchSessions
  } = useQuery({
    queryKey: ['feeding_sessions', user?.id, cageId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('feeding_sessions')
        .select('*, cages(nom)')
        .order('date_alimentation', { ascending: false })
        .order('heure', { ascending: false });

      if (cageId) {
        query = query.eq('cage_id', cageId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FeedingSession[];
    },
    enabled: !!user,
  });

  // Plans d'alimentation
  const {
    data: feedingPlans,
    isLoading: isLoadingPlans,
    error: plansError
  } = useQuery({
    queryKey: ['feeding_plans', user?.id, cageId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('feeding_plans')
        .select('*, cages(nom)')
        .eq('statut', 'actif')
        .order('created_at', { ascending: false });

      if (cageId) {
        query = query.eq('cage_id', cageId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FeedingPlan[];
    },
    enabled: !!user,
  });

  // Créer une session d'alimentation
  const createFeedingSession = useMutation({
    mutationFn: async (newSession: Database['public']['Tables']['feeding_sessions']['Insert']) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('feeding_sessions')
        .insert({ ...newSession, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeding_sessions'] });
      queryClient.invalidateQueries({ queryKey: ['cages'] });
      toast({
        title: "Succès",
        description: "Session d'alimentation enregistrée",
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

  // Créer un plan d'alimentation
  const createFeedingPlan = useMutation({
    mutationFn: async (newPlan: Database['public']['Tables']['feeding_plans']['Insert']) => {
      if (!user) throw new Error('User not authenticated');
      
      // Désactiver les anciens plans de la même cage
      if (newPlan.cage_id) {
        await supabase
          .from('feeding_plans')
          .update({ statut: 'inactif' })
          .eq('cage_id', newPlan.cage_id)
          .eq('statut', 'actif');
      }
      
      const { data, error } = await supabase
        .from('feeding_plans')
        .insert({ ...newPlan, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeding_plans'] });
      toast({
        title: "Succès",
        description: "Plan d'alimentation créé",
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

  // Calculer le plan d'alimentation automatique
  const calculateFeedingPlan = useMutation({
    mutationFn: async (targetCageId: string) => {
      const { error } = await supabase.rpc('calculate_feeding_plan', {
        cage_id_param: targetCageId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeding_plans'] });
      toast({
        title: "Succès",
        description: "Plan d'alimentation calculé automatiquement",
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

  // Statistiques consolidées
  const feedingStats = {
    totalSessions: feedingSessions?.length || 0,
    activePlans: feedingPlans?.length || 0,
    totalFeedToday: feedingSessions?.filter(session => 
      new Date(session.date_alimentation).toDateString() === new Date().toDateString()
    ).reduce((total, session) => total + (session.quantite || 0), 0) || 0,
    averageDailyFeed: feedingSessions?.length 
      ? (feedingSessions.reduce((total, session) => total + (session.quantite || 0), 0) / 
         Math.max(1, Math.ceil((Date.now() - new Date(feedingSessions[feedingSessions.length - 1]?.date_alimentation || Date.now()).getTime()) / (1000 * 60 * 60 * 24))))
      : 0
  };

  return {
    // Données
    feedingSessions: feedingSessions || [],
    feedingPlans: feedingPlans || [],
    feedingStats,
    
    // États de chargement
    isLoading: isLoadingSessions || isLoadingPlans,
    isLoadingSessions,
    isLoadingPlans,
    
    // Erreurs
    error: sessionsError || plansError,
    
    // Actions
    createFeedingSession: createFeedingSession.mutate,
    createFeedingPlan: createFeedingPlan.mutate,
    calculateFeedingPlan: calculateFeedingPlan.mutate,
    refetchSessions,
    
    // États des mutations
    isCreatingSession: createFeedingSession.isPending,
    isCreatingPlan: createFeedingPlan.isPending,
    isCalculating: calculateFeedingPlan.isPending,
  };
}