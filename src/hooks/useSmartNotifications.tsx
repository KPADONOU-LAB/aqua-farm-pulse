import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface SmartAlert {
  id: string;
  type: 'health' | 'performance' | 'financial' | 'predictive' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  recommendations: string[];
  cageId?: string;
  cageName?: string;
  confidence?: number;
  estimatedImpact?: number;
  createdAt: string;
  resolvedAt?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  prediction?: {
    timeframe: string;
    probability: number;
    preventionActions: string[];
  };
}

export interface AlertConfig {
  id: string;
  type: string;
  enabled: boolean;
  thresholds: {
    [key: string]: number;
  };
  escalationTime: number; // minutes
  recipients: string[];
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  criticalOnly: boolean;
  categories: {
    [key: string]: boolean;
  };
}

const defaultConfigs: AlertConfig[] = [
  {
    id: 'fcr_high',
    type: 'performance',
    enabled: true,
    thresholds: { warning: 2.2, critical: 2.5 },
    escalationTime: 30,
    recipients: ['technique@ferme.com'],
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false
  },
  {
    id: 'mortality_spike',
    type: 'health',
    enabled: true,
    thresholds: { warning: 5, critical: 10 },
    escalationTime: 15,
    recipients: ['urgence@ferme.com'],
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: true
  },
  {
    id: 'water_quality',
    type: 'health',
    enabled: true,
    thresholds: { warning: 1, critical: 3 },
    escalationTime: 20,
    recipients: ['technique@ferme.com'],
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false
  },
  {
    id: 'cost_overrun',
    type: 'financial',
    enabled: true,
    thresholds: { warning: 15, critical: 25 },
    escalationTime: 60,
    recipients: ['finance@ferme.com'],
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false
  }
];

export const useSmartNotifications = () => {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>(defaultConfigs);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    },
    criticalOnly: false,
    categories: {
      health: true,
      performance: true,
      financial: true,
      predictive: true,
      system: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAlerts();
      loadPreferences();
      checkNotificationPermission();
      setupRealtimeSubscription();
    }
  }, [user]);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      return permission === 'granted';
    }
    return false;
  };

  const loadAlerts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('smart_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedAlerts: SmartAlert[] = data?.map(alert => {
        // Get cage name separately if needed
        const getCageName = async (cageId: string) => {
          if (!cageId) return undefined;
          const { data: cage } = await supabase
            .from('cages')
            .select('nom')
            .eq('id', cageId)
            .single();
          return cage?.nom;
        };
        return {
          id: alert.id,
          type: alert.type_alerte as SmartAlert['type'],
          severity: alert.niveau_criticite as SmartAlert['severity'],
          title: alert.titre,
          message: alert.message,
          recommendations: alert.recommandations || [],
          cageId: alert.cage_id,
          cageName: undefined, // Will be loaded separately if needed
          confidence: typeof alert.donnees_contexte === 'object' && alert.donnees_contexte ? (alert.donnees_contexte as any).confidence : undefined,
          estimatedImpact: alert.impact_estime,
          createdAt: alert.created_at,
          resolvedAt: alert.date_resolution,
          status: alert.statut as SmartAlert['status'],
          prediction: typeof alert.donnees_contexte === 'object' && alert.donnees_contexte ? (alert.donnees_contexte as any).prediction : undefined
        };
      }) || [];

      setAlerts(formattedAlerts);
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = () => {
    const saved = localStorage.getItem('notification_preferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  };

  const savePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    localStorage.setItem('notification_preferences', JSON.stringify(updated));
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('smart_alerts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'smart_alerts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newAlert = payload.new as any;
          handleNewAlert({
            id: newAlert.id,
            type: newAlert.type_alerte as SmartAlert['type'],
            severity: newAlert.niveau_criticite as SmartAlert['severity'],
            title: newAlert.titre,
            message: newAlert.message,
            recommendations: newAlert.recommandations || [],
            cageId: newAlert.cage_id,
            confidence: typeof newAlert.donnees_contexte === 'object' && newAlert.donnees_contexte ? (newAlert.donnees_contexte as any).confidence : undefined,
            estimatedImpact: newAlert.impact_estime,
            createdAt: newAlert.created_at,
            status: newAlert.statut as SmartAlert['status'],
            prediction: typeof newAlert.donnees_contexte === 'object' && newAlert.donnees_contexte ? (newAlert.donnees_contexte as any).prediction : undefined
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleNewAlert = (alert: SmartAlert) => {
    // Vérifier si on doit afficher l'alerte selon les préférences
    if (!shouldShowAlert(alert)) return;

    // Ajouter à la liste
    setAlerts(prev => [alert, ...prev]);

    // Afficher les notifications selon les préférences
    if (preferences.pushEnabled && permissionStatus === 'granted') {
      showBrowserNotification(alert);
    }

    if (preferences.soundEnabled) {
      playAlertSound(alert.severity);
    }

    if (preferences.vibrationEnabled && 'vibrate' in navigator) {
      triggerVibration(alert.severity);
    }

    // Toast notification
    showToastNotification(alert);
  };

  const shouldShowAlert = (alert: SmartAlert): boolean => {
    // Vérifier les heures de silence
    if (preferences.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime >= preferences.quietHours.start || currentTime <= preferences.quietHours.end) {
        // Pendant les heures de silence, ne montrer que les alertes critiques
        if (alert.severity !== 'critical') return false;
      }
    }

    // Vérifier si on ne veut que les alertes critiques
    if (preferences.criticalOnly && alert.severity !== 'critical') {
      return false;
    }

    // Vérifier les catégories activées
    return preferences.categories[alert.type] !== false;
  };

  const showBrowserNotification = (alert: SmartAlert) => {
    const options: NotificationOptions = {
      body: alert.message,
      icon: getSeverityIcon(alert.severity),
      badge: '/favicon.ico',
      tag: alert.id,
      requireInteraction: alert.severity === 'critical'
    };

    const notification = new Notification(alert.title, options);
    
    notification.onclick = () => {
      window.focus();
      // Naviguer vers les détails de l'alerte
      notification.close();
    };

    // Auto-fermer après 10 secondes pour les alertes non-critiques
    if (alert.severity !== 'critical') {
      setTimeout(() => notification.close(), 10000);
    }
  };

  const showToastNotification = (alert: SmartAlert) => {
    const duration = alert.severity === 'critical' ? 0 : 5000; // Critiques restent ouvertes

    toast({
      title: alert.title,
      description: alert.message,
      variant: alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' : 'default',
      duration
    });
  };

  const playAlertSound = (severity: string) => {
    try {
      const audio = new Audio();
      switch (severity) {
        case 'critical':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmsbAD2X3/LRegz9MoLa9duRAg8Sib+62mM8Ah9JmOD6v3AsEw8K0/3v6DU=';
          break;
        case 'high':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmsbAD2X3/LRegz9MoLa9duRAg8Sib+62mM8Ah9JmOD6v3AsEw8K0/3v6DU=';
          break;
        default:
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmsbAD2X3/LRegz9MoLa9duRAg8Sib+62mM8Ah9JmOD6v3AsEw8K0/3v6DU=';
      }
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Son bloqué par le navigateur, ignorer silencieusement
      });
    } catch (error) {
      // Erreur de lecture audio, ignorer
    }
  };

  const triggerVibration = (severity: string) => {
    if ('vibrate' in navigator) {
      switch (severity) {
        case 'critical':
          navigator.vibrate([200, 100, 200, 100, 200]);
          break;
        case 'high':
          navigator.vibrate([200, 100, 200]);
          break;
        default:
          navigator.vibrate([100]);
      }
    }
  };

  const getSeverityIcon = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '🔔';
      default:
        return 'ℹ️';
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('smart_alerts')
        .update({ 
          statut: 'acknowledged',
          date_lecture: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'acknowledged' }
          : alert
      ));

      toast({
        title: "Alerte accusée",
        description: "L'alerte a été marquée comme vue.",
      });
    } catch (error) {
      console.error('Erreur lors de l\'accusé de réception:', error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('smart_alerts')
        .update({ 
          statut: 'resolved',
          date_resolution: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'resolved', resolvedAt: new Date().toISOString() }
          : alert
      ));

      toast({
        title: "Alerte résolue",
        description: "L'alerte a été marquée comme résolue.",
      });
    } catch (error) {
      console.error('Erreur lors de la résolution:', error);
    }
  };

  const generatePredictiveAlerts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('predictive-alerts', {
        body: { user_id: user.id }
      });

      if (error) throw error;

      toast({
        title: "Analyse prédictive",
        description: `${data?.predictions_generated || 0} nouvelles prédictions générées.`,
      });
    } catch (error) {
      console.error('Erreur lors de la génération des alertes prédictives:', error);
    }
  };

  const updateAlertConfig = (configId: string, updates: Partial<AlertConfig>) => {
    setAlertConfigs(prev => prev.map(config =>
      config.id === configId ? { ...config, ...updates } : config
    ));
  };

  const testNotification = () => {
    const testAlert: SmartAlert = {
      id: 'test',
      type: 'system',
      severity: 'medium',
      title: 'Test de notification',
      message: 'Ceci est un test du système de notifications.',
      recommendations: ['Vérifier les paramètres de notification'],
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    handleNewAlert(testAlert);
  };

  return {
    alerts,
    alertConfigs,
    preferences,
    loading,
    permissionStatus,
    requestNotificationPermission,
    savePreferences,
    acknowledgeAlert,
    resolveAlert,
    generatePredictiveAlerts,
    updateAlertConfig,
    testNotification,
    refreshAlerts: loadAlerts
  };
};