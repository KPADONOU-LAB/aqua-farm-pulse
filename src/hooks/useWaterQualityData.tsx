import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface WaterMeasurement {
  id: string;
  cage_id: string;
  temperature: number;
  ph: number;
  oxygene_dissous: number;
  turbidite: number | null;
  date_mesure: string;
  heure: string;
  statut: string;
  observations: string | null;
  cage?: {
    nom: string;
  };
}

interface TemperatureData {
  heure: string;
  temperature: number;
}

interface PhData {
  heure: string;
  ph: number;
}

export const useWaterQualityData = () => {
  const [measurements, setMeasurements] = useState<WaterMeasurement[]>([]);
  const [temperatureData, setTemperatureData] = useState<TemperatureData[]>([]);
  const [phData, setPhData] = useState<PhData[]>([]);
  const [stats, setStats] = useState({
    moyenneTemp: 0,
    moyennePh: 0,
    moyenneOxygene: 0,
    mesuresToday: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadWaterQualityData();
    }
  }, [user]);

  const loadWaterQualityData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Charger les mesures d'aujourd'hui avec les noms des cages
      const today = new Date().toISOString().split('T')[0];
      const { data: todayMeasurements } = await supabase
        .from('water_quality')
        .select(`
          *,
          cages!inner(nom)
        `)
        .eq('user_id', user.id)
        .eq('date_mesure', today)
        .order('heure', { ascending: false });

      const measurements = todayMeasurements?.map(measurement => ({
        ...measurement,
        cage: measurement.cages
      })) || [];

      // Calculer les moyennes
      if (measurements.length > 0) {
        const moyenneTemp = measurements.reduce((sum, m) => sum + m.temperature, 0) / measurements.length;
        const moyennePh = measurements.reduce((sum, m) => sum + m.ph, 0) / measurements.length;
        const moyenneOxygene = measurements.reduce((sum, m) => sum + m.oxygene_dissous, 0) / measurements.length;

        setStats({
          moyenneTemp,
          moyennePh,
          moyenneOxygene,
          mesuresToday: measurements.length
        });
      }

      // Charger les données de température de la journée
      const { data: temperatureHistory } = await supabase
        .from('water_quality')
        .select('heure, temperature')
        .eq('user_id', user.id)
        .eq('date_mesure', today)
        .order('heure', { ascending: true });

      // Charger les données de pH de la journée
      const { data: phHistory } = await supabase
        .from('water_quality')
        .select('heure, ph')
        .eq('user_id', user.id)
        .eq('date_mesure', today)
        .order('heure', { ascending: true });

      setMeasurements(measurements);
      setTemperatureData(temperatureHistory || []);
      setPhData(phHistory || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données de qualité de l\'eau:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    measurements,
    temperatureData,
    phData,
    stats,
    loading,
    refreshData: loadWaterQualityData
  };
};