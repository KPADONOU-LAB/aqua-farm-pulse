import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Alert {
  id: string;
  type: 'stock' | 'water' | 'health' | 'feeding';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  cage_id?: string;
  cage_name?: string;
  created_at: string;
  acknowledged: boolean;
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const generatedAlerts: Alert[] = [];

      // Alertes stock critique
      const { data: inventoryLow } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id);

      inventoryLow?.filter(item => item.stock_actuel <= item.stock_min).forEach(item => {
        if (item.stock_actuel <= item.stock_min * 0.5) {
          generatedAlerts.push({
            id: `stock-${item.id}`,
            type: 'stock',
            severity: 'critical',
            title: `Stock critique - ${item.nom}`,
            description: `Stock actuel: ${item.stock_actuel} ${item.unite} (Min: ${item.stock_min})`,
            created_at: new Date().toISOString(),
            acknowledged: false
          });
        } else if (item.stock_actuel <= item.stock_min) {
          generatedAlerts.push({
            id: `stock-${item.id}`,
            type: 'stock',
            severity: 'high',
            title: `Stock faible - ${item.nom}`,
            description: `Réapprovisionnement recommandé: ${item.stock_actuel} ${item.unite} restants`,
            created_at: new Date().toISOString(),
            acknowledged: false
          });
        }
      });

      // Alertes qualité de l'eau
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: waterQuality } = await supabase
        .from('water_quality')
        .select(`
          *,
          cages!inner(nom)
        `)
        .eq('user_id', user.id)
        .gte('date_mesure', yesterday.toISOString().split('T')[0]);

      waterQuality?.forEach(measurement => {
        // Température critique
        if (measurement.temperature > 28 || measurement.temperature < 18) {
          generatedAlerts.push({
            id: `water-temp-${measurement.id}`,
            type: 'water',
            severity: measurement.temperature > 30 || measurement.temperature < 15 ? 'critical' : 'high',
            title: `Température eau ${measurement.temperature > 28 ? 'élevée' : 'basse'}`,
            description: `${measurement.temperature}°C mesuré dans ${measurement.cages.nom}`,
            cage_id: measurement.cage_id,
            cage_name: measurement.cages.nom,
            created_at: measurement.created_at,
            acknowledged: false
          });
        }

        // pH critique
        if (measurement.ph < 6.5 || measurement.ph > 8.0) {
          generatedAlerts.push({
            id: `water-ph-${measurement.id}`,
            type: 'water',
            severity: measurement.ph < 6.0 || measurement.ph > 8.5 ? 'critical' : 'high',
            title: `pH ${measurement.ph < 6.5 ? 'acide' : 'basique'}`,
            description: `pH ${measurement.ph} mesuré dans ${measurement.cages.nom}`,
            cage_id: measurement.cage_id,
            cage_name: measurement.cages.nom,
            created_at: measurement.created_at,
            acknowledged: false
          });
        }

        // Oxygène faible
        if (measurement.oxygene_dissous < 5.0) {
          generatedAlerts.push({
            id: `water-oxygen-${measurement.id}`,
            type: 'water',
            severity: measurement.oxygene_dissous < 3.0 ? 'critical' : 'high',
            title: 'Oxygène dissous faible',
            description: `${measurement.oxygene_dissous}mg/L dans ${measurement.cages.nom}`,
            cage_id: measurement.cage_id,
            cage_name: measurement.cages.nom,
            created_at: measurement.created_at,
            acknowledged: false
          });
        }
      });

      // Alertes santé
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: healthObservations } = await supabase
        .from('health_observations')
        .select(`
          *,
          cages!inner(nom)
        `)
        .eq('user_id', user.id)
        .gte('date_observation', weekAgo.toISOString().split('T')[0]);

      healthObservations?.forEach(observation => {
        if (observation.mortalite > 0) {
          const severity = observation.mortalite > 10 ? 'critical' : 
                          observation.mortalite > 5 ? 'high' : 'medium';
          
          generatedAlerts.push({
            id: `health-${observation.id}`,
            type: 'health',
            severity,
            title: `Mortalité détectée - ${observation.cages.nom}`,
            description: `${observation.mortalite} décès observés${observation.cause_presumee ? ` - ${observation.cause_presumee}` : ''}`,
            cage_id: observation.cage_id,
            cage_name: observation.cages.nom,
            created_at: observation.created_at,
            acknowledged: false
          });
        }

        if (observation.statut === 'alerte') {
          generatedAlerts.push({
            id: `health-status-${observation.id}`,
            type: 'health',
            severity: 'high',
            title: `Alerte sanitaire - ${observation.cages.nom}`,
            description: observation.observations,
            cage_id: observation.cage_id,
            cage_name: observation.cages.nom,
            created_at: observation.created_at,
            acknowledged: false
          });
        }
      });

      // Alertes alimentation
      const { data: feedingSessions } = await supabase
        .from('feeding_sessions')
        .select(`
          *,
          cages!inner(nom)
        `)
        .eq('user_id', user.id)
        .gte('date_alimentation', yesterday.toISOString().split('T')[0]);

      feedingSessions?.forEach(session => {
        if (session.appetit === 'faible') {
          generatedAlerts.push({
            id: `feeding-${session.id}`,
            type: 'feeding',
            severity: 'medium',
            title: `Appétit faible - ${session.cages.nom}`,
            description: `Appétit faible observé lors de la session de ${session.heure}`,
            cage_id: session.cage_id,
            cage_name: session.cages.nom,
            created_at: session.created_at,
            acknowledged: false
          });
        }
      });

      // Trier par criticité et date
      generatedAlerts.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        if (severityDiff !== 0) return severityDiff;
        
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setAlerts(generatedAlerts);

    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getAlertsByType = (type: Alert['type']) => {
    return alerts.filter(alert => alert.type === type);
  };

  const getUnacknowledgedCount = () => {
    return alerts.filter(alert => !alert.acknowledged).length;
  };

  const getCriticalCount = () => {
    return alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged).length;
  };

  return {
    alerts,
    loading,
    acknowledgeAlert,
    getAlertsByType,
    getUnacknowledgedCount,
    getCriticalCount,
    refreshAlerts: loadAlerts
  };
};