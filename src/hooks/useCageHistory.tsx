import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useFarm } from '@/contexts/FarmContext';

interface FeedingHistory {
  periode: string;
  date_debut: string;
  date_fin: string;
  quantite_totale: number;
  nombre_sessions: number;
  quantite_moyenne: number;
  fcr_calcule: number;
  poids_debut: number;
  poids_fin: number;
  gain_poids: number;
}

interface SalesHistory {
  periode: string;
  date_debut: string;
  date_fin: string;
  nombre_ventes: number;
  quantite_totale_kg: number;
  chiffre_affaires: number;
  prix_moyen_kg: number;
  clients_distincts: number;
  cage_nom: string;
}

export const useCageHistory = () => {
  const { user } = useAuth();
  const { formatCurrency } = useFarm();
  const [loading, setLoading] = useState(false);
  const [feedingHistory, setFeedingHistory] = useState<FeedingHistory[]>([]);
  const [salesHistory, setSalesHistory] = useState<SalesHistory[]>([]);

  // Récupérer l'historique d'alimentation par période
  const getFeedingHistory = async (
    cageId: string, 
    periodType: 'day' | 'week' | 'month' = 'week'
  ) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_cage_feeding_history', {
        cage_id_param: cageId,
        period_type: periodType
      });

      if (error) throw error;

      setFeedingHistory(data || []);
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique d\'alimentation:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Récupérer l'historique des ventes par période
  const getSalesHistory = async (
    periodType: 'day' | 'week' | 'month' = 'month',
    cageId?: string
  ) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_sales_history_by_period', {
        user_id_param: user.id,
        period_type: periodType,
        cage_id_param: cageId || null
      });

      if (error) throw error;

      setSalesHistory(data || []);
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique des ventes:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Calculer automatiquement le FCR pour une période donnée
  const calculateAutomaticFCR = async (cageId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('calculate_cage_fcr', {
        cage_id_param: cageId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du calcul automatique du FCR:', error);
      return null;
    }
  };

  // Obtenir les statistiques résumées pour une cage
  const getCageSummaryStats = async (cageId: string) => {
    if (!user) return null;

    try {
      // Calculer les métriques automatiquement
      const { data: metrics, error: metricsError } = await supabase.rpc('update_all_cage_metrics', {
        cage_id_param: cageId
      });

      if (metricsError) throw metricsError;

      // Récupérer les données de la cage mise à jour
      const { data: cage, error: cageError } = await supabase
        .from('cages')
        .select('*')
        .eq('id', cageId)
        .eq('user_id', user.id)
        .single();

      if (cageError) throw cageError;

      if (!cage) return null;
      
      const metricsObj = metrics && typeof metrics === 'object' ? metrics as Record<string, any> : {};
      
      return {
        ...cage,
        ...metricsObj
      };
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques de la cage:', error);
      return null;
    }
  };

  // Formater les données pour l'affichage avec la monnaie
  const formatFeedingHistoryForDisplay = (history: FeedingHistory[]) => {
    return history.map(item => ({
      ...item,
      quantite_totale_formatted: `${item.quantite_totale.toFixed(2)} kg`,
      quantite_moyenne_formatted: `${item.quantite_moyenne.toFixed(2)} kg`,
      fcr_formatted: item.fcr_calcule ? item.fcr_calcule.toFixed(2) : 'N/A',
      gain_poids_formatted: `${item.gain_poids.toFixed(2)} kg`
    }));
  };

  const formatSalesHistoryForDisplay = (history: SalesHistory[]) => {
    return history.map(item => ({
      ...item,
      quantite_totale_formatted: `${item.quantite_totale_kg.toFixed(2)} kg`,
      chiffre_affaires_formatted: formatCurrency(item.chiffre_affaires),
      prix_moyen_formatted: formatCurrency(item.prix_moyen_kg)
    }));
  };

  return {
    loading,
    feedingHistory,
    salesHistory,
    getFeedingHistory,
    getSalesHistory,
    calculateAutomaticFCR,
    getCageSummaryStats,
    formatFeedingHistoryForDisplay,
    formatSalesHistoryForDisplay
  };
};