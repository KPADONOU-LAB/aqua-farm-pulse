import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Database } from '@/integrations/supabase/types';

// Types pour les tables principales
type Tables = Database['public']['Tables'];
type Cage = Tables['cages']['Row'];
type FeedingSession = Tables['feeding_sessions']['Row'];
type HealthObservation = Tables['health_observations']['Row'];
type WaterQuality = Tables['water_quality']['Row'];
type Sale = Tables['sales']['Row'];
type Inventory = Tables['inventory']['Row'];
type SmartAlert = Tables['smart_alerts']['Row'];

// Hook optimisé pour les cages
export function useOptimizedCages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: cages,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['cages', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Cage[];
    },
    enabled: !!user,
  });

  const createCage = useMutation({
    mutationFn: async (newCage: Tables['cages']['Insert']) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('cages')
        .insert({ ...newCage, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cages'] });
      toast({
        title: "Succès",
        description: "Cage créée avec succès",
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

  const updateCage = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Cage> }) => {
      const { data, error } = await supabase
        .from('cages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cages'] });
      toast({
        title: "Succès",
        description: "Cage mise à jour avec succès",
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

  return {
    cages: cages || [],
    isLoading,
    error,
    refetch,
    createCage: createCage.mutate,
    updateCage: updateCage.mutate,
    isCreating: createCage.isPending,
    isUpdating: updateCage.isPending,
  };
}

// Hook optimisé pour les alertes intelligentes
export function useOptimizedSmartAlerts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: alerts,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['smart_alerts', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('smart_alerts')
        .select('*')
        .eq('statut', 'active')
        .order('date_detection', { ascending: false });

      if (error) throw error;
      return data as SmartAlert[];
    },
    enabled: !!user,
  });

  // Générer les alertes intelligentes
  const generateAlerts = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('generate_intelligent_alerts');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart_alerts'] });
      toast({
        title: "Succès",
        description: "Alertes mises à jour",
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

  const resolveAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('smart_alerts')
        .update({ 
          statut: 'resolved',
          date_resolution: new Date().toISOString()
        })
        .eq('id', alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart_alerts'] });
      toast({
        title: "Succès",
        description: "Alerte résolue",
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

  return {
    alerts: alerts || [],
    isLoading,
    error,
    refetch,
    generateAlerts: generateAlerts.mutate,
    resolveAlert: resolveAlert.mutate,
    isGenerating: generateAlerts.isPending,
    isResolving: resolveAlert.isPending,
  };
}

// Hook optimisé pour les métriques de cages
export function useOptimizedCageMetrics(cageId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMetrics = useMutation({
    mutationFn: async (targetCageId: string) => {
      const { data, error } = await supabase.rpc('update_all_cage_metrics', {
        cage_id_param: targetCageId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cages'] });
      toast({
        title: "Succès",
        description: "Métriques mises à jour",
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

  const updateAllMetrics = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('daily_maintenance');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cages'] });
      queryClient.invalidateQueries({ queryKey: ['smart_alerts'] });
      toast({
        title: "Succès",
        description: "Toutes les métriques ont été mises à jour",
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

  return {
    updateMetrics: updateMetrics.mutate,
    updateAllMetrics: updateAllMetrics.mutate,
    isUpdating: updateMetrics.isPending,
    isUpdatingAll: updateAllMetrics.isPending,
  };
}