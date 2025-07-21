import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Weighing {
  id: string;
  cage_id: string;
  date_pesee: string;
  nombre_echantillons: number;
  poids_moyen_echantillon: number;
  poids_estime_total: number;
  biomasse_totale: number;
  taux_croissance_semaine: number;
  observations?: string;
  photos?: string[];
  cage?: {
    nom: string;
    espece: string;
    nombre_poissons: number;
  } | null;
}

interface WeighingStats {
  croissanceRateMoyenne: number;
  biomasseTotal: number;
  poidsRecentMoyen: number;
  tendanceCroissance: 'positive' | 'negative' | 'stable';
}

export const useWeighings = () => {
  const [weighings, setWeighings] = useState<Weighing[]>([]);
  const [stats, setStats] = useState<WeighingStats>({
    croissanceRateMoyenne: 0,
    biomasseTotal: 0,
    poidsRecentMoyen: 0,
    tendanceCroissance: 'stable'
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchWeighings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('weekly_weighings')
        .select(`
          *,
          cage:cages(nom, espece, nombre_poissons)
        `)
        .eq('user_id', user.id)
        .order('date_pesee', { ascending: false });

      if (error) throw error;
      setWeighings((data as unknown as Weighing[]) || []);
      
      // Calculer les statistiques
      calculateStats((data as unknown as Weighing[]) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des pesées:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (weighingsData: Weighing[]) => {
    if (weighingsData.length === 0) return;

    const totalBiomass = weighingsData.reduce((sum, w) => sum + w.biomasse_totale, 0);
    const averageGrowthRate = weighingsData.reduce((sum, w) => sum + w.taux_croissance_semaine, 0) / weighingsData.length;
    const recentWeights = weighingsData.slice(0, 5);
    const averageRecentWeight = recentWeights.reduce((sum, w) => sum + w.poids_moyen_echantillon, 0) / recentWeights.length;

    // Calculer la tendance
    let trend: 'positive' | 'negative' | 'stable' = 'stable';
    if (weighingsData.length > 1) {
      const recent = weighingsData[0].taux_croissance_semaine;
      const previous = weighingsData[1].taux_croissance_semaine;
      if (recent > previous * 1.05) trend = 'positive';
      else if (recent < previous * 0.95) trend = 'negative';
    }

    setStats({
      croissanceRateMoyenne: averageGrowthRate,
      biomasseTotal: totalBiomass,
      poidsRecentMoyen: averageRecentWeight,
      tendanceCroissance: trend
    });
  };

  const createWeighing = async (weighing: Omit<Weighing, 'id' | 'cage'>) => {
    if (!user) return;

    try {
      // Calculer la biomasse totale et le taux de croissance
      const cage = await supabase
        .from('cages')
        .select('nombre_poissons')
        .eq('id', weighing.cage_id)
        .single();

      if (cage.error) throw cage.error;

      const biomasse = weighing.poids_moyen_echantillon * cage.data.nombre_poissons;
      
      // Calculer le taux de croissance par rapport à la pesée précédente
      const previousWeighing = await supabase
        .from('weekly_weighings')
        .select('poids_moyen_echantillon')
        .eq('cage_id', weighing.cage_id)
        .order('date_pesee', { ascending: false })
        .limit(1)
        .single();

      let growthRate = 0;
      if (previousWeighing.data) {
        growthRate = ((weighing.poids_moyen_echantillon - previousWeighing.data.poids_moyen_echantillon) / previousWeighing.data.poids_moyen_echantillon) * 100;
      }

      const finalWeighing = {
        ...weighing,
        user_id: user.id,
        biomasse_totale: biomasse,
        taux_croissance_semaine: growthRate,
        poids_estime_total: biomasse
      };

      const { data, error } = await supabase
        .from('weekly_weighings')
        .insert([finalWeighing])
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour le poids moyen de la cage
      await supabase
        .from('cages')
        .update({ poids_moyen: weighing.poids_moyen_echantillon })
        .eq('id', weighing.cage_id);

      await fetchWeighings();
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la pesée:', error);
      throw error;
    }
  };

  const uploadWeighingPhoto = async (file: File, weighingId: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${weighingId}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('weighing-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('weighing-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erreur lors de l\'upload de la photo:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchWeighings();
  }, [user]);

  return {
    weighings,
    stats,
    loading,
    createWeighing,
    uploadWeighingPhoto,
    refetch: fetchWeighings
  };
};