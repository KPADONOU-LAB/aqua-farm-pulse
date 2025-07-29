import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface CageMetrics {
  id: string;
  nom: string;
  espece: string;
  nombre_poissons: number;
  poids_moyen: number;
  fcr: number;
  taux_mortalite: number;
  croissance: string;
  date_introduction: string;
  statut: string;
  // Métriques calculées
  jours_elevage: number;
  croissance_journaliere: number;
  biomasse_totale: number;
  efficacite_alimentaire: number;
  cout_par_kg: number;
  performance_score: number;
}

interface ComparisonResult {
  cage: CageMetrics;
  rank: number;
  percentile: number;
  better_than: number;
  areas_improvement: string[];
  strengths: string[];
}

export const useComparativeAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [cages, setCages] = useState<CageMetrics[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);
  const [benchmarks, setBenchmarks] = useState<any>({});
  const { user } = useAuth();

  const loadCageMetrics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Récupérer toutes les cages avec leurs métriques
      const { data: cageData, error } = await supabase
        .from('cages')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Calculer les métriques pour chaque cage
      const enrichedCages: CageMetrics[] = await Promise.all(
        cageData.map(async (cage) => {
          const jours_elevage = Math.floor(
            (Date.now() - new Date(cage.date_introduction).getTime()) / (1000 * 60 * 60 * 24)
          );

          const croissance_journaliere = jours_elevage > 0 
            ? ((cage.poids_moyen - 0.05) / jours_elevage) * 1000 // g/jour depuis 50g
            : 0;

          const biomasse_totale = cage.nombre_poissons * cage.poids_moyen;
          
          // Calculer l'efficacité alimentaire (inverse du FCR, plus c'est haut, mieux c'est)
          const efficacite_alimentaire = cage.fcr > 0 ? (1 / cage.fcr) * 100 : 0;

          // Calculer le coût par kg estimé
          const cout_par_kg = await calculateCostPerKg(cage.id);

          // Score de performance global (0-100)
          const performance_score = calculatePerformanceScore({
            fcr: cage.fcr,
            taux_mortalite: cage.taux_mortalite,
            croissance_journaliere,
            efficacite_alimentaire
          });

          return {
            ...cage,
            jours_elevage,
            croissance_journaliere,
            biomasse_totale,
            efficacite_alimentaire,
            cout_par_kg,
            performance_score
          };
        })
      );

      setCages(enrichedCages);
      
      // Générer les comparaisons
      const comparisons = generateComparisons(enrichedCages);
      setComparisons(comparisons);
      
      // Calculer les benchmarks
      const benchmarks = calculateBenchmarks(enrichedCages);
      setBenchmarks(benchmarks);

    } catch (error) {
      console.error('Erreur lors du chargement des métriques:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCostPerKg = async (cageId: string): Promise<number> => {
    try {
      // Récupérer les coûts de la cage
      const { data: costs } = await supabase
        .from('cost_tracking')
        .select('montant')
        .eq('cage_id', cageId);

      // Récupérer les sessions d'alimentation pour estimer les coûts d'aliment
      const { data: feeding } = await supabase
        .from('feeding_sessions')
        .select('quantite')
        .eq('cage_id', cageId);

      const totalCosts = (costs?.reduce((sum, c) => sum + c.montant, 0) || 0) +
                        (feeding?.reduce((sum, f) => sum + (f.quantite * 1.2), 0) || 0); // 1.2€/kg estimation

      // Biomasse estimée
      const cage = cages.find(c => c.id === cageId);
      const biomasse = cage ? cage.nombre_poissons * cage.poids_moyen : 1;

      return biomasse > 0 ? totalCosts / biomasse : 0;
    } catch {
      return 0;
    }
  };

  const calculatePerformanceScore = (metrics: {
    fcr: number;
    taux_mortalite: number;
    croissance_journaliere: number;
    efficacite_alimentaire: number;
  }): number => {
    let score = 100;

    // Pénalités FCR (objectif: 1.8-2.0)
    if (metrics.fcr > 2.0) {
      score -= (metrics.fcr - 2.0) * 15; // -15 points par 0.1 au-dessus de 2.0
    } else if (metrics.fcr < 1.8) {
      score += (1.8 - metrics.fcr) * 5; // Bonus si très efficace
    }

    // Pénalités mortalité (objectif: <5%)
    if (metrics.taux_mortalite > 5) {
      score -= (metrics.taux_mortalite - 5) * 3; // -3 points par % au-dessus de 5%
    }

    // Bonus croissance (objectif: >15g/jour)
    if (metrics.croissance_journaliere > 15) {
      score += (metrics.croissance_journaliere - 15) * 0.5;
    } else if (metrics.croissance_journaliere < 10) {
      score -= (10 - metrics.croissance_journaliere) * 2;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const generateComparisons = (cages: CageMetrics[]): ComparisonResult[] => {
    return cages.map((cage) => {
      // Calculer le rang pour chaque métrique
      const sortedByPerformance = [...cages].sort((a, b) => b.performance_score - a.performance_score);
      const rank = sortedByPerformance.findIndex(c => c.id === cage.id) + 1;
      const percentile = Math.round(((cages.length - rank) / (cages.length - 1)) * 100);
      const better_than = Math.round(((cages.length - rank) / cages.length) * 100);

      // Identifier les points forts
      const strengths = [];
      if (cage.fcr <= 1.9) strengths.push('Excellent FCR');
      if (cage.taux_mortalite <= 3) strengths.push('Très faible mortalité');
      if (cage.croissance_journaliere >= 15) strengths.push('Croissance rapide');
      if (cage.performance_score >= 85) strengths.push('Performance globale excellente');

      // Identifier les axes d'amélioration
      const areas_improvement = [];
      if (cage.fcr > 2.2) areas_improvement.push('Optimiser l\'efficacité alimentaire');
      if (cage.taux_mortalite > 7) areas_improvement.push('Réduire la mortalité');
      if (cage.croissance_journaliere < 10) areas_improvement.push('Accélérer la croissance');
      if (cage.cout_par_kg > 4.5) areas_improvement.push('Contrôler les coûts de production');

      return {
        cage,
        rank,
        percentile,
        better_than,
        areas_improvement,
        strengths
      };
    });
  };

  const calculateBenchmarks = (cages: CageMetrics[]) => {
    if (!cages.length) return {};

    const activeCages = cages.filter(c => c.statut === 'en_production' || c.statut === 'actif');
    
    if (!activeCages.length) {
      return {
        average_fcr: 0,
        average_mortality: 0,
        average_growth: 0,
        average_performance: 0,
        best_performer: null,
        total_biomass: 0,
        total_fish: 0
      };
    }
    
    return {
      average_fcr: activeCages.reduce((sum, c) => sum + c.fcr, 0) / activeCages.length,
      average_mortality: activeCages.reduce((sum, c) => sum + c.taux_mortalite, 0) / activeCages.length,
      average_growth: activeCages.reduce((sum, c) => sum + c.croissance_journaliere, 0) / activeCages.length,
      average_performance: activeCages.reduce((sum, c) => sum + c.performance_score, 0) / activeCages.length,
      best_performer: activeCages.reduce((best, cage) => 
        cage.performance_score > best.performance_score ? cage : best
      ),
      total_biomass: activeCages.reduce((sum, c) => sum + c.biomasse_totale, 0),
      total_fish: activeCages.reduce((sum, c) => sum + c.nombre_poissons, 0)
    };
  };

  const getCageComparison = (cageId: string) => {
    return comparisons.find(c => c.cage.id === cageId);
  };

  const getTopPerformers = (limit: number = 3) => {
    return comparisons
      .sort((a, b) => b.cage.performance_score - a.cage.performance_score)
      .slice(0, limit);
  };

  const getCagesNeedingAttention = () => {
    return comparisons.filter(c => 
      c.cage.performance_score < 60 || 
      c.cage.taux_mortalite > 10 || 
      c.cage.fcr > 2.5
    );
  };

  useEffect(() => {
    if (user) {
      loadCageMetrics();
    }
  }, [user]);

  return {
    loading,
    cages,
    comparisons,
    benchmarks,
    getCageComparison,
    getTopPerformers,
    getCagesNeedingAttention,
    refreshData: loadCageMetrics
  };
};