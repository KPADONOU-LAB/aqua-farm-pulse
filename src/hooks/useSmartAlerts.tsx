import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface SmartAlert {
  id: string;
  cage_id?: string;
  type_alerte: string;
  niveau_criticite: string;
  titre: string;
  message: string;
  recommandations: string[];
  donnees_contexte: any;
  date_detection: string;
  date_lecture?: string;
  date_resolution?: string;
  statut: string;
  actions_effectuees: string[];
  impact_estime?: number;
  created_at: string;
  cage?: {
    nom: string;
  } | null;
}

export const useSmartAlerts = () => {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAlerts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('smart_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('date_detection', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des alertes:', error);
        toast.error('Erreur lors du chargement des alertes');
      } else {
        setAlerts(data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
      toast.error('Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  };

  const generateSmartAlerts = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('generate_intelligent_alerts');
      if (error) throw error;
      
      toast.success('Alertes intelligentes générées');
      fetchAlerts();
    } catch (error) {
      console.error('Erreur lors de la génération des alertes:', error);
      toast.error('Erreur lors de la génération des alertes');
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('smart_alerts')
        .update({ 
          statut: 'read',
          date_lecture: new Date().toISOString()
        })
        .eq('id', alertId)
        .eq('user_id', user?.id);

      if (error) throw error;
      fetchAlerts();
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      toast.error('Erreur lors du marquage comme lu');
    }
  };

  const markAsResolved = async (alertId: string, actions: string[]) => {
    try {
      const { error } = await supabase
        .from('smart_alerts')
        .update({ 
          statut: 'resolved',
          date_resolution: new Date().toISOString(),
          actions_effectuees: actions
        })
        .eq('id', alertId)
        .eq('user_id', user?.id);

      if (error) throw error;
      toast.success('Alerte marquée comme résolue');
      fetchAlerts();
    } catch (error) {
      console.error('Erreur lors de la résolution:', error);
      toast.error('Erreur lors de la résolution');
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('smart_alerts')
        .update({ statut: 'dismissed' })
        .eq('id', alertId)
        .eq('user_id', user?.id);

      if (error) throw error;
      fetchAlerts();
    } catch (error) {
      console.error('Erreur lors de l\'ignorance de l\'alerte:', error);
      toast.error('Erreur lors de l\'ignorance de l\'alerte');
    }
  };

  const getAlertsByType = (type: string) => {
    return alerts.filter(alert => alert.type_alerte === type);
  };

  const getAlertsByCriticality = (level: string) => {
    return alerts.filter(alert => alert.niveau_criticite === level);
  };

  const getActiveAlerts = () => {
    return alerts.filter(alert => alert.statut === 'active');
  };

  const getCriticalAlerts = () => {
    return alerts.filter(alert => 
      alert.niveau_criticite === 'critical' && alert.statut === 'active'
    );
  };

  const getUnreadAlerts = () => {
    return alerts.filter(alert => 
      alert.statut === 'active' && !alert.date_lecture
    );
  };

  useEffect(() => {
    if (user) {
      fetchAlerts();
      // Générer les alertes automatiquement toutes les heures
      const interval = setInterval(generateSmartAlerts, 3600000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    alerts,
    loading,
    fetchAlerts,
    generateSmartAlerts,
    markAsRead,
    markAsResolved,
    dismissAlert,
    getAlertsByType,
    getAlertsByCriticality,
    getActiveAlerts,
    getCriticalAlerts,
    getUnreadAlerts
  };
};