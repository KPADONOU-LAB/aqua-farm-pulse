import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface PerformanceTarget {
  id: string;
  cage_id: string;
  cycle_id?: string;
  fcr_cible: number;
  taux_survie_cible: number;
  poids_moyen_cible: number;
  duree_cycle_jours: number;
  cout_revient_kg_cible: number;
  marge_beneficiaire_cible: number;
  date_creation: string;
  statut: string;
  notes?: string;
  created_at: string;
  cage?: {
    nom: string;
    fcr?: number;
    poids_moyen?: number;
    taux_mortalite?: number;
  };
}

interface PerformanceComparison {
  target: PerformanceTarget;
  actual: {
    fcr: number;
    survival_rate: number;
    average_weight: number;
    cost_per_kg: number;
  };
  deviations: {
    fcr_deviation: number;
    survival_deviation: number;
    weight_deviation: number;
    cost_deviation: number;
  };
  overall_score: number;
}

export const usePerformanceTargets = () => {
  const [targets, setTargets] = useState<PerformanceTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTargets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('performance_targets')
        .select(`
          *,
          cage:cages(nom, fcr, poids_moyen, taux_mortalite)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTargets(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des objectifs:', error);
      toast.error('Erreur lors du chargement des objectifs');
    } finally {
      setLoading(false);
    }
  };

  const createTarget = async (targetData: Omit<PerformanceTarget, 'id' | 'created_at' | 'cage'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('performance_targets')
        .insert([{ ...targetData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Objectif de performance créé avec succès');
      fetchTargets();
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'objectif:', error);
      toast.error('Erreur lors de la création de l\'objectif');
      throw error;
    }
  };

  const updateTarget = async (id: string, updates: Partial<PerformanceTarget>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('performance_targets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Objectif mis à jour avec succès');
      fetchTargets();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'objectif:', error);
      toast.error('Erreur lors de la mise à jour de l\'objectif');
      throw error;
    }
  };

  const deleteTarget = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('performance_targets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Objectif supprimé avec succès');
      fetchTargets();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'objectif:', error);
      toast.error('Erreur lors de la suppression de l\'objectif');
      throw error;
    }
  };

  const getTargetByCage = (cageId: string) => {
    return targets.find(target => target.cage_id === cageId && target.statut === 'actif');
  };

  const calculatePerformanceComparison = async (cageId: string): Promise<PerformanceComparison | null> => {
    const target = getTargetByCage(cageId);
    if (!target || !target.cage) return null;

    try {
      // Récupérer le coût par kg réel
      const { data: costPerKg } = await supabase.rpc('calculate_cost_per_kg', {
        cage_id_param: cageId
      });

      const actual = {
        fcr: target.cage.fcr || 0,
        survival_rate: 100 - (target.cage.taux_mortalite || 0),
        average_weight: target.cage.poids_moyen || 0,
        cost_per_kg: costPerKg || 0
      };

      const deviations = {
        fcr_deviation: ((actual.fcr - target.fcr_cible) / target.fcr_cible) * 100,
        survival_deviation: ((actual.survival_rate - target.taux_survie_cible) / target.taux_survie_cible) * 100,
        weight_deviation: ((actual.average_weight - target.poids_moyen_cible) / target.poids_moyen_cible) * 100,
        cost_deviation: ((actual.cost_per_kg - target.cout_revient_kg_cible) / target.cout_revient_kg_cible) * 100
      };

      // Calculer un score global (100 = parfait, 0 = très mauvais)
      const fcrScore = Math.max(0, 100 - Math.abs(deviations.fcr_deviation));
      const survivalScore = Math.max(0, 100 - Math.abs(deviations.survival_deviation));
      const weightScore = Math.max(0, 100 - Math.abs(deviations.weight_deviation));
      const costScore = Math.max(0, 100 - Math.abs(deviations.cost_deviation));

      const overall_score = (fcrScore + survivalScore + weightScore + costScore) / 4;

      return {
        target,
        actual,
        deviations,
        overall_score
      };
    } catch (error) {
      console.error('Erreur lors du calcul de la comparaison:', error);
      return null;
    }
  };

  const getPerformanceStatus = (deviation: number) => {
    if (Math.abs(deviation) <= 5) return { status: 'excellent', color: 'green' };
    if (Math.abs(deviation) <= 15) return { status: 'bon', color: 'blue' };
    if (Math.abs(deviation) <= 25) return { status: 'moyen', color: 'yellow' };
    return { status: 'préoccupant', color: 'red' };
  };

  useEffect(() => {
    if (user) {
      fetchTargets();
    }
  }, [user]);

  return {
    targets,
    loading,
    fetchTargets,
    createTarget,
    updateTarget,
    deleteTarget,
    getTargetByCage,
    calculatePerformanceComparison,
    getPerformanceStatus
  };
};