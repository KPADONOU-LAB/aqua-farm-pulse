import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FeedingSession {
  id: string;
  cage_id: string;
  heure: string;
  quantite: number;
  type_aliment: string;
  appetit: string;
  observations: string | null;
  date_alimentation: string;
  cage?: {
    nom: string;
  };
}

interface WeeklyData {
  jour: string;
  quantite: number;
}

export const useFeedingData = () => {
  const [feedingSessions, setFeedingSessions] = useState<FeedingSession[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [stats, setStats] = useState({
    sessionsToday: 0,
    quantiteTotal: 0,
    prochainSession: "14:30",
    alertes: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFeedingData();
    }
  }, [user]);

  const loadFeedingData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Charger les sessions d'aujourd'hui avec les noms des cages
      const today = new Date().toISOString().split('T')[0];
      const { data: sessions } = await supabase
        .from('feeding_sessions')
        .select(`
          *,
          cages!inner(nom)
        `)
        .eq('user_id', user.id)
        .eq('date_alimentation', today)
        .order('heure', { ascending: false });

      const feedingSessions = sessions?.map(session => ({
        ...session,
        cage: session.cages
      })) || [];

      // Calculer les statistiques du jour
      const quantiteTotal = feedingSessions.reduce((sum, session) => sum + session.quantite, 0);
      const alertes = feedingSessions.filter(session => session.appetit === 'faible').length;

      // Charger les données hebdomadaires
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: weeklyFeedings } = await supabase
        .from('feeding_sessions')
        .select('quantite, date_alimentation')
        .eq('user_id', user.id)
        .gte('date_alimentation', weekAgo.toISOString().split('T')[0]);

      // Grouper par jour
      const quantiteParJour = new Map();
      const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      
      weeklyFeedings?.forEach(feeding => {
        const date = new Date(feeding.date_alimentation);
        const dayIndex = (date.getDay() + 6) % 7; // Convertir dimanche=0 vers lundi=0
        const dayKey = jours[dayIndex];
        
        if (!quantiteParJour.has(dayKey)) {
          quantiteParJour.set(dayKey, 0);
        }
        quantiteParJour.set(dayKey, quantiteParJour.get(dayKey) + feeding.quantite);
      });

      const weeklyData = jours.map(jour => ({
        jour,
        quantite: quantiteParJour.get(jour) || 0
      }));

      setFeedingSessions(feedingSessions);
      setWeeklyData(weeklyData);
      setStats({
        sessionsToday: feedingSessions.length,
        quantiteTotal,
        prochainSession: "14:30", // Peut être calculé dynamiquement
        alertes
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données d\'alimentation:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    feedingSessions,
    weeklyData,
    stats,
    loading,
    refreshData: loadFeedingData
  };
};