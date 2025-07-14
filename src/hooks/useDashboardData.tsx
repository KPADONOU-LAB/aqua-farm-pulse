import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  cagesActives: number;
  cagesVides: number;
  totalPoissons: number;
  alimentConsommeJour: number;
  alertes: number;
  croissanceMoyenne: number;
  ventesJour: number;
  revenusJour: number;
}

interface CroissanceData {
  mois: string;
  poids: number;
}

interface VentesData {
  jour: string;
  ventes: number;
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    cagesActives: 0,
    cagesVides: 0,
    totalPoissons: 0,
    alimentConsommeJour: 0,
    alertes: 0,
    croissanceMoyenne: 0,
    ventesJour: 0,
    revenusJour: 0,
  });
  
  const [croissanceData, setCroissanceData] = useState<CroissanceData[]>([]);
  const [ventesData, setVentesData] = useState<VentesData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Charger les statistiques des cages
      const { data: cages } = await supabase
        .from('cages')
        .select('*')
        .eq('user_id', user.id);

      const cagesActives = cages?.filter(cage => cage.statut === 'actif').length || 0;
      const cagesVides = cages?.filter(cage => cage.statut === 'vide').length || 0;
      const totalPoissons = cages?.reduce((sum, cage) => sum + (cage.nombre_poissons || 0), 0) || 0;
      const poidsMoyenGlobal = cages && cages.length > 0 
        ? cages.reduce((sum, cage) => sum + (cage.poids_moyen || 0), 0) / cages.length 
        : 0;

      // Charger les données d'alimentation du jour
      const today = new Date().toISOString().split('T')[0];
      const { data: feedingSessions } = await supabase
        .from('feeding_sessions')
        .select('quantite')
        .eq('user_id', user.id)
        .eq('date_alimentation', today);

      const alimentConsommeJour = feedingSessions?.reduce((sum, session) => sum + session.quantite, 0) || 0;

      // Charger les ventes du jour
      const { data: salesJour } = await supabase
        .from('sales')
        .select('quantite_kg, prix_total')
        .eq('user_id', user.id)
        .eq('date_vente', today);

      const ventesJour = salesJour?.reduce((sum, sale) => sum + sale.quantite_kg, 0) || 0;
      const revenusJour = salesJour?.reduce((sum, sale) => sum + sale.prix_total, 0) || 0;

      // Calculer les alertes (stocks bas + santé critique)
      const { data: inventoryLow } = await supabase
        .from('inventory')
        .select('id')
        .eq('user_id', user.id)
        .eq('statut', 'critique');

      const { data: healthAlerts } = await supabase
        .from('health_observations')
        .select('id')
        .eq('user_id', user.id)
        .eq('statut', 'alerte')
        .gte('date_observation', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const alertes = (inventoryLow?.length || 0) + (healthAlerts?.length || 0);

      // Charger les données de croissance des 6 derniers mois
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: cageHistory } = await supabase
        .from('cage_history')
        .select('new_value, created_at')
        .eq('user_id', user.id)
        .eq('field_name', 'poids_moyen')
        .gte('created_at', sixMonthsAgo.toISOString());

      // Grouper par mois pour la croissance
      const croissanceByMonth = new Map();
      cageHistory?.forEach(record => {
        const date = new Date(record.created_at);
        const monthKey = date.toLocaleString('fr-FR', { month: 'short' });
        const poids = parseFloat(record.new_value || '0');
        
        if (!croissanceByMonth.has(monthKey)) {
          croissanceByMonth.set(monthKey, []);
        }
        croissanceByMonth.get(monthKey).push(poids);
      });

      const croissanceData = Array.from(croissanceByMonth.entries()).map(([mois, poids]) => ({
        mois,
        poids: poids.reduce((sum: number, p: number) => sum + p, 0) / poids.length
      }));

      // Charger les ventes de la semaine
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: salesWeek } = await supabase
        .from('sales')
        .select('quantite_kg, date_vente')
        .eq('user_id', user.id)
        .gte('date_vente', weekAgo.toISOString().split('T')[0]);

      const ventesParJour = new Map();
      salesWeek?.forEach(sale => {
        const date = new Date(sale.date_vente);
        const dayKey = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        
        if (!ventesParJour.has(dayKey)) {
          ventesParJour.set(dayKey, 0);
        }
        ventesParJour.set(dayKey, ventesParJour.get(dayKey) + sale.quantite_kg);
      });

      const ventesData = Array.from(ventesParJour.entries()).map(([jour, ventes]) => ({
        jour,
        ventes
      }));

      setStats({
        cagesActives,
        cagesVides,
        totalPoissons,
        alimentConsommeJour,
        alertes,
        croissanceMoyenne: poidsMoyenGlobal,
        ventesJour,
        revenusJour,
      });

      setCroissanceData(croissanceData);
      setVentesData(ventesData);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    croissanceData,
    ventesData,
    loading,
    refreshData: loadDashboardData
  };
};