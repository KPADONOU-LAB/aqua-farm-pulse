import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface SmartRecommendation {
  id: string;
  type: 'feeding' | 'water_quality' | 'health' | 'financial' | 'harvest' | 'performance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action_items: string[];
  reasoning: string;
  impact_score: number;
  cage_id?: string;
  cage_name?: string;
  estimated_improvement: string;
  implementation_difficulty: 'easy' | 'medium' | 'hard';
  cost_estimate?: number;
  roi_estimate?: number;
  deadline?: string;
  created_at: string;
}

interface RecommendationFilters {
  type?: string;
  priority?: string;
  cage_id?: string;
  implementation_difficulty?: string;
}

export const useSmartRecommendations = () => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [filters, setFilters] = useState<RecommendationFilters>({});
  const { user } = useAuth();

  const generateRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-recommendations', {
        body: {
          user_id: user.id,
          analysis_depth: 'comprehensive'
        }
      });

      if (error) {
        console.error('Erreur Edge Function:', error);
        // Fallback vers des recommandations locales
        const fallbackRecommendations = await generateFallbackRecommendations();
        setRecommendations(fallbackRecommendations);
        toast.success('Recommandations de base générées');
        return;
      }

      if (data.success) {
        setRecommendations(data.recommendations);
        toast.success(`${data.recommendations.length} recommandations générées`);
      }
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
      // Fallback en cas d'erreur
      const fallbackRecommendations = await generateFallbackRecommendations();
      setRecommendations(fallbackRecommendations);
      toast.error('Service IA indisponible - Recommandations de base générées');
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackRecommendations = async (): Promise<SmartRecommendation[]> => {
    if (!user) return [];

    try {
      // Récupérer les données des cages
      const { data: cages } = await supabase
        .from('cages')
        .select('*')
        .eq('user_id', user.id);

      if (!cages) return [];

      const recommendations: SmartRecommendation[] = [];

      for (const cage of cages) {
        // Recommandation FCR
        if (cage.fcr > 2.0) {
          recommendations.push({
            id: `fcr-${cage.id}`,
            type: 'feeding',
            priority: cage.fcr > 2.5 ? 'high' : 'medium',
            title: `Optimiser l'efficacité alimentaire - ${cage.nom}`,
            description: `Le FCR de ${cage.fcr} est supérieur à l'objectif de 2.0. Une optimisation de l'alimentation peut améliorer les performances.`,
            action_items: [
              'Réduire la quantité d\'aliment de 10%',
              'Surveiller l\'appétit plus fréquemment',
              'Vérifier la qualité de l\'aliment',
              'Ajuster la fréquence des repas'
            ],
            reasoning: 'Un FCR élevé indique une mauvaise conversion alimentaire, impactant directement la rentabilité.',
            impact_score: 85,
            cage_id: cage.id,
            cage_name: cage.nom,
            estimated_improvement: 'Réduction de 15-20% des coûts alimentaires',
            implementation_difficulty: 'easy',
            cost_estimate: 0,
            roi_estimate: 1500,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
          });
        }

        // Recommandation mortalité
        if (cage.taux_mortalite > 5) {
          recommendations.push({
            id: `mortality-${cage.id}`,
            type: 'health',
            priority: cage.taux_mortalite > 10 ? 'critical' : 'high',
            title: `Réduire la mortalité - ${cage.nom}`,
            description: `Taux de mortalité de ${cage.taux_mortalite}% dépasse l'objectif de 5%. Action urgente requise.`,
            action_items: [
              'Vérifier la qualité de l\'eau immédiatement',
              'Consulter un vétérinaire',
              'Réviser le plan d\'alimentation',
              'Augmenter la fréquence de surveillance'
            ],
            reasoning: 'Une mortalité élevée indique des problèmes sanitaires ou environnementaux graves.',
            impact_score: 95,
            cage_id: cage.id,
            cage_name: cage.nom,
            estimated_improvement: 'Sauvegarde de 20-30% du stock',
            implementation_difficulty: 'medium',
            cost_estimate: 200,
            roi_estimate: 3000,
            deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
          });
        }

        // Recommandation poids de récolte
        if (cage.poids_moyen >= 0.7 && cage.statut === 'en_production') {
          recommendations.push({
            id: `harvest-${cage.id}`,
            type: 'harvest',
            priority: 'medium',
            title: `Planifier la récolte - ${cage.nom}`,
            description: `Poids moyen de ${cage.poids_moyen}kg approche l'objectif de récolte. Planifier la commercialisation.`,
            action_items: [
              'Contacter les acheteurs potentiels',
              'Préparer les équipements de récolte',
              'Planifier la logistique de transport',
              'Finaliser les analyses sanitaires'
            ],
            reasoning: 'Récolter au bon moment maximise la valeur commerciale et évite la surcharge des cages.',
            impact_score: 75,
            cage_id: cage.id,
            cage_name: cage.nom,
            estimated_improvement: 'Optimisation du prix de vente de 10-15%',
            implementation_difficulty: 'medium',
            cost_estimate: 500,
            roi_estimate: 2000,
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
          });
        }
      }

      // Recommandations générales
      if (cages.length > 3) {
        recommendations.push({
          id: 'performance-analysis',
          type: 'performance',
          priority: 'low',
          title: 'Analyse comparative des performances',
          description: 'Comparer les performances entre vos cages pour identifier les meilleures pratiques.',
          action_items: [
            'Identifier la cage la plus performante',
            'Analyser les facteurs de succès',
            'Appliquer les bonnes pratiques aux autres cages',
            'Standardiser les protocoles efficaces'
          ],
          reasoning: 'L\'analyse comparative permet d\'identifier et de reproduire les meilleures pratiques.',
          impact_score: 60,
          estimated_improvement: 'Amélioration globale de 15% des performances',
          implementation_difficulty: 'easy',
          cost_estimate: 0,
          roi_estimate: 1000,
          created_at: new Date().toISOString()
        });
      }

      return recommendations.sort((a, b) => b.impact_score - a.impact_score);
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations fallback:', error);
      return [];
    }
  };

  const getFilteredRecommendations = () => {
    return recommendations.filter(rec => {
      if (filters.type && rec.type !== filters.type) return false;
      if (filters.priority && rec.priority !== filters.priority) return false;
      if (filters.cage_id && rec.cage_id !== filters.cage_id) return false;
      if (filters.implementation_difficulty && rec.implementation_difficulty !== filters.implementation_difficulty) return false;
      return true;
    });
  };

  const getRecommendationsByPriority = (priority: string) => {
    return recommendations.filter(rec => rec.priority === priority);
  };

  const getRecommendationsByType = (type: string) => {
    return recommendations.filter(rec => rec.type === type);
  };

  const markAsImplemented = async (recommendationId: string) => {
    setRecommendations(prev => 
      prev.filter(rec => rec.id !== recommendationId)
    );
    toast.success('Recommandation marquée comme implémentée');
  };

  const postponeRecommendation = async (recommendationId: string, days: number) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, deadline: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() }
          : rec
      )
    );
    toast.success(`Recommandation reportée de ${days} jours`);
  };

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user]);

  return {
    loading,
    recommendations: getFilteredRecommendations(),
    allRecommendations: recommendations,
    filters,
    setFilters,
    generateRecommendations,
    getRecommendationsByPriority,
    getRecommendationsByType,
    markAsImplemented,
    postponeRecommendation
  };
};