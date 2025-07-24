import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface NotificationPreferences {
  browser: boolean;
  sound: boolean;
  vibration: boolean;
  criticalOnly: boolean;
}

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const audioContextRef = useRef<AudioContext | null>(null);
  const preferencesRef = useRef<NotificationPreferences>({
    browser: true,
    sound: true,
    vibration: true,
    criticalOnly: false
  });

  // Demander la permission pour les notifications
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Ce navigateur ne supporte pas les notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  };

  // Son d'alerte
  const playAlertSound = (severity: string) => {
    if (!preferencesRef.current.sound) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Fréquences selon la sévérité
      const frequencies = {
        critical: [800, 1000, 800], // Son d'urgence
        high: [600, 800],           // Son d'alerte
        medium: [500],              // Son normal
        low: [400]                  // Son léger
      };

      const freq = frequencies[severity as keyof typeof frequencies] || [500];
      
      oscillator.frequency.setValueAtTime(freq[0], context.currentTime);
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.3);

      // Pour les alertes critiques, répéter le son
      if (severity === 'critical' && freq.length > 1) {
        setTimeout(() => {
          const oscillator2 = context.createOscillator();
          const gainNode2 = context.createGain();
          
          oscillator2.connect(gainNode2);
          gainNode2.connect(context.destination);
          
          oscillator2.frequency.setValueAtTime(freq[1], context.currentTime);
          gainNode2.gain.setValueAtTime(0.3, context.currentTime);
          gainNode2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
          
          oscillator2.start(context.currentTime);
          oscillator2.stop(context.currentTime + 0.3);
        }, 400);
      }
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
    }
  };

  // Vibration
  const triggerVibration = (severity: string) => {
    if (!preferencesRef.current.vibration || !navigator.vibrate) return;

    const patterns = {
      critical: [200, 100, 200, 100, 200], // Vibration d'urgence
      high: [150, 100, 150],               // Vibration d'alerte
      medium: [100],                       // Vibration normale
      low: [50]                           // Vibration légère
    };

    navigator.vibrate(patterns[severity as keyof typeof patterns] || [100]);
  };

  // Notification navigateur
  const showBrowserNotification = (alert: any) => {
    if (!preferencesRef.current.browser || Notification.permission !== "granted") return;

    const severityEmojis = {
      critical: '🚨',
      high: '⚠️',
      medium: '📢',
      low: 'ℹ️'
    };

    const notification = new Notification(
      `${severityEmojis[alert.niveau_criticite as keyof typeof severityEmojis]} ${alert.titre}`,
      {
        body: alert.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `alert-${alert.id}`,
        requireInteraction: alert.niveau_criticite === 'critical',
        silent: false
      }
    );

    notification.onclick = () => {
      window.focus();
      // Rediriger vers la page appropriée selon le type d'alerte
      const routes = {
        water_quality: '/water-quality',
        inventory: '/inventory',
        health: '/health',
        feeding: '/feeding',
        default: '/alerts'
      };
      
      const route = routes[alert.type_alerte as keyof typeof routes] || routes.default;
      window.location.href = route;
      notification.close();
    };

    // Fermer automatiquement après 10 secondes sauf pour les critiques
    if (alert.niveau_criticite !== 'critical') {
      setTimeout(() => notification.close(), 10000);
    }
  };

  // Toast notification améliorée
  const showToastNotification = (alert: any) => {
    const severityStyles = {
      critical: { duration: Infinity, className: 'border-l-4 border-l-red-500' },
      high: { duration: 8000, className: 'border-l-4 border-l-orange-500' },
      medium: { duration: 5000, className: 'border-l-4 border-l-yellow-500' },
      low: { duration: 3000, className: 'border-l-4 border-l-blue-500' }
    };

    const style = severityStyles[alert.niveau_criticite as keyof typeof severityStyles];

    toast(alert.titre, {
      description: alert.message,
      duration: style.duration,
      className: style.className,
      action: alert.niveau_criticite === 'critical' ? {
        label: "Voir détails",
        onClick: () => window.location.href = '/alerts'
      } : undefined
    });
  };

  // Traitement d'une nouvelle alerte
  const handleNewAlert = (alert: any) => {
    const shouldNotify = !preferencesRef.current.criticalOnly || 
                        alert.niveau_criticite === 'critical';

    if (!shouldNotify) return;

    // Toujours afficher le toast
    showToastNotification(alert);

    // Son et vibration
    playAlertSound(alert.niveau_criticite);
    triggerVibration(alert.niveau_criticite);

    // Notification navigateur si autorisée
    showBrowserNotification(alert);

    console.log('🔔 Nouvelle alerte:', alert.titre, `(${alert.niveau_criticite})`);
  };

  // Configuration Supabase Realtime
  useEffect(() => {
    if (!user) return;

    // Demander la permission immédiatement
    requestNotificationPermission();

    // Écouter les nouvelles alertes intelligentes
    const smartAlertsChannel = supabase
      .channel('smart-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'smart_alerts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📊 Nouvelle alerte intelligente:', payload);
          handleNewAlert(payload.new);
        }
      )
      .subscribe();

    // Écouter les mesures critiques de qualité d'eau
    const waterQualityChannel = supabase
      .channel('water-quality-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'water_quality',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const measurement = payload.new;
          
          // Vérifier si c'est critique
          const isCritical = 
            measurement.temperature > 30 || measurement.temperature < 15 ||
            measurement.ph < 6.0 || measurement.ph > 8.5 ||
            measurement.oxygene_dissous < 3.0;

          if (isCritical) {
            const alert = {
              id: `water-${measurement.id}`,
              type_alerte: 'water_quality',
              niveau_criticite: 'critical',
              titre: 'Paramètres eau critiques',
              message: `Température: ${measurement.temperature}°C, pH: ${measurement.ph}, O₂: ${measurement.oxygene_dissous}mg/L`
            };
            handleNewAlert(alert);
          }
        }
      )
      .subscribe();

    // Écouter les observations de santé
    const healthChannel = supabase
      .channel('health-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_observations',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const observation = payload.new;
          
          if (observation.mortalite > 5 || observation.statut === 'alerte') {
            const alert = {
              id: `health-${observation.id}`,
              type_alerte: 'health',
              niveau_criticite: observation.mortalite > 10 ? 'critical' : 'high',
              titre: 'Alerte sanitaire',
              message: observation.mortalite > 0 
                ? `${observation.mortalite} décès observés`
                : observation.observations
            };
            handleNewAlert(alert);
          }
        }
      )
      .subscribe();

    // Écouter les stocks faibles
    const inventoryChannel = supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'inventory',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const item = payload.new;
          
          if (item.stock_actuel <= item.stock_min * 0.5) {
            const alert = {
              id: `stock-${item.id}`,
              type_alerte: 'inventory',
              niveau_criticite: 'critical',
              titre: 'Stock critique',
              message: `${item.nom}: ${item.stock_actuel} ${item.unite} restants`
            };
            handleNewAlert(alert);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(smartAlertsChannel);
      supabase.removeChannel(waterQualityChannel);
      supabase.removeChannel(healthChannel);
      supabase.removeChannel(inventoryChannel);
    };
  }, [user]);

  // Méthodes publiques
  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    preferencesRef.current = { ...preferencesRef.current, ...newPreferences };
    localStorage.setItem('notificationPreferences', JSON.stringify(preferencesRef.current));
  };

  const testNotification = () => {
    const testAlert = {
      id: 'test',
      type_alerte: 'test',
      niveau_criticite: 'medium',
      titre: 'Test de notification',
      message: 'Ceci est un test du système de notifications en temps réel'
    };
    handleNewAlert(testAlert);
  };

  // Charger les préférences depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      try {
        preferencesRef.current = JSON.parse(saved);
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error);
      }
    }
  }, []);

  return {
    requestNotificationPermission,
    updatePreferences,
    testNotification,
    preferences: preferencesRef.current
  };
};