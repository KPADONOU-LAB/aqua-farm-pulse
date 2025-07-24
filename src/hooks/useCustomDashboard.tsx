import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DashboardWidget {
  id: string;
  user_id?: string;
  nom_widget: string;
  type_widget: 'metric' | 'chart' | 'table' | 'alert' | 'progress';
  configuration: any;
  est_public?: boolean;
  categories?: string[];
  description?: string;
  icone?: string;
  taille_defaut?: 'small' | 'medium' | 'large' | 'xl';
}

export interface DashboardLayout {
  id: string;
  widgetId: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface CustomDashboard {
  id: string;
  user_id: string;
  nom_dashboard: string;
  configuration: DashboardLayout[];
  est_par_defaut?: boolean;
  ordre_affichage?: number;
  description?: string;
  icone?: string;
  couleur?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCustomDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Récupérer tous les dashboards
  const { data: dashboards, isLoading: dashboardsLoading } = useQuery({
    queryKey: ['custom-dashboards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_dashboards')
        .select('*')
        .order('ordre_affichage', { ascending: true });
      
      if (error) throw error;
      return data?.map(d => ({
        ...d,
        configuration: Array.isArray(d.configuration) ? d.configuration as unknown as DashboardLayout[] : []
      })) as CustomDashboard[];
    },
  });

  // Récupérer les widgets disponibles
  const { data: availableWidgets, isLoading: widgetsLoading } = useQuery({
    queryKey: ['dashboard-widgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .select('*')
        .or('est_public.eq.true,user_id.eq.' + (await supabase.auth.getUser()).data.user?.id);
      
      if (error) throw error;
      return data as DashboardWidget[];
    },
  });

  // Sélectionner le dashboard par défaut au chargement
  useEffect(() => {
    if (dashboards && !selectedDashboard) {
      const defaultDashboard = dashboards.find(d => d.est_par_defaut) || dashboards[0];
      if (defaultDashboard) {
        setSelectedDashboard(defaultDashboard.id);
      }
    }
  }, [dashboards, selectedDashboard]);

  // Dashboard actuel
  const currentDashboard = dashboards?.find(d => d.id === selectedDashboard);

  // Widgets du dashboard actuel avec leurs configurations
  const dashboardWidgets = currentDashboard?.configuration.map(layout => {
    const widget = availableWidgets?.find(w => w.id === layout.widgetId);
    return widget ? { ...widget, layout } : null;
  }).filter(Boolean) || [];

  // Créer un nouveau dashboard
  const createDashboard = useMutation({
    mutationFn: async (dashboard: Partial<CustomDashboard>) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Utilisateur non connecté');
      
      const { data, error } = await supabase
        .from('custom_dashboards')
        .insert({
          user_id: user.data.user.id,
          nom_dashboard: dashboard.nom_dashboard || 'Nouveau dashboard',
          configuration: JSON.stringify(dashboard.configuration || []),
          description: dashboard.description,
          icone: dashboard.icone || 'layout-dashboard',
          couleur: dashboard.couleur || '#3b82f6',
          ordre_affichage: (dashboards?.length || 0) + 1
        })
        .select()
        .single();
      
      if (error) throw error;
      return {
        ...data,
        configuration: Array.isArray(data.configuration) ? data.configuration as unknown as DashboardLayout[] : []
      } as CustomDashboard;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom-dashboards'] });
      setSelectedDashboard(data.id);
      toast({
        title: "Dashboard créé",
        description: "Votre nouveau dashboard a été créé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le dashboard.",
        variant: "destructive",
      });
    },
  });

  // Mettre à jour un dashboard
  const updateDashboard = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CustomDashboard> }) => {
      const updateData: any = { ...updates };
      
      // Convertir la configuration en JSON si elle existe
      if (updates.configuration) {
        updateData.configuration = JSON.stringify(updates.configuration);
      }
      
      const { data, error } = await supabase
        .from('custom_dashboards')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return {
        ...data,
        configuration: Array.isArray(data.configuration) ? data.configuration as unknown as DashboardLayout[] : []
      } as CustomDashboard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-dashboards'] });
      toast({
        title: "Dashboard mis à jour",
        description: "Les modifications ont été sauvegardées.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    },
  });

  // Supprimer un dashboard
  const deleteDashboard = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_dashboards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-dashboards'] });
      if (selectedDashboard && dashboards) {
        const remaining = dashboards.filter(d => d.id !== selectedDashboard);
        setSelectedDashboard(remaining[0]?.id || null);
      }
      toast({
        title: "Dashboard supprimé",
        description: "Le dashboard a été supprimé avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le dashboard.",
        variant: "destructive",
      });
    },
  });

  // Créer un widget personnalisé
  const createWidget = useMutation({
    mutationFn: async (widget: { nom_widget: string; type_widget: string; configuration: any; description?: string; icone?: string; taille_defaut?: string; categories?: string[] }) => {
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .insert({
          nom_widget: widget.nom_widget,
          type_widget: widget.type_widget,
          configuration: JSON.stringify(widget.configuration),
          description: widget.description,
          icone: widget.icone,
          taille_defaut: widget.taille_defaut || 'medium',
          categories: widget.categories || [],
          est_public: false
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets'] });
      toast({
        title: "Widget créé",
        description: "Votre widget personnalisé a été créé.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le widget.",
        variant: "destructive",
      });
    },
  });

  // Ajouter un widget au dashboard actuel
  const addWidgetToDashboard = (widgetId: string, position?: { x: number; y: number; w: number; h: number }) => {
    if (!currentDashboard) return;

    const newLayout: DashboardLayout = {
      id: `widget-${Date.now()}`,
      widgetId,
      position: position || { x: 0, y: 0, w: 4, h: 3 }
    };

    const updatedConfiguration = [...currentDashboard.configuration, newLayout];
    
    updateDashboard.mutate({
      id: currentDashboard.id,
      updates: { configuration: updatedConfiguration }
    });
  };

  // Supprimer un widget du dashboard
  const removeWidgetFromDashboard = (layoutId: string) => {
    if (!currentDashboard) return;

    const updatedConfiguration = currentDashboard.configuration.filter(
      layout => layout.id !== layoutId
    );
    
    updateDashboard.mutate({
      id: currentDashboard.id,
      updates: { configuration: updatedConfiguration }
    });
  };

  // Mettre à jour la disposition des widgets
  const updateWidgetLayout = (layouts: DashboardLayout[]) => {
    if (!currentDashboard) return;

    updateDashboard.mutate({
      id: currentDashboard.id,
      updates: { configuration: layouts }
    });
  };

  // Définir comme dashboard par défaut
  const setAsDefault = useMutation({
    mutationFn: async (dashboardId: string) => {
      // Retirer le statut par défaut de tous les dashboards
      await supabase
        .from('custom_dashboards')
        .update({ est_par_defaut: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Définir le nouveau dashboard par défaut
      const { error } = await supabase
        .from('custom_dashboards')
        .update({ est_par_defaut: true })
        .eq('id', dashboardId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-dashboards'] });
      toast({
        title: "Dashboard par défaut défini",
        description: "Ce dashboard sera affiché par défaut.",
      });
    },
  });

  return {
    // État
    dashboards,
    currentDashboard,
    selectedDashboard,
    dashboardWidgets,
    availableWidgets,
    editMode,
    setEditMode,
    
    // Actions
    setSelectedDashboard,
    createDashboard: createDashboard.mutate,
    updateDashboard: updateDashboard.mutate,
    deleteDashboard: deleteDashboard.mutate,
    createWidget: createWidget.mutate,
    addWidgetToDashboard,
    removeWidgetFromDashboard,
    updateWidgetLayout,
    setAsDefault: setAsDefault.mutate,
    
    // États de chargement
    isLoading: dashboardsLoading || widgetsLoading,
    isUpdating: updateDashboard.isPending,
    isCreating: createDashboard.isPending,
  };
};