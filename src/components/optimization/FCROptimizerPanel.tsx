import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target, 
  TrendingDown, 
  Calculator, 
  Lightbulb,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCageMetrics } from '@/hooks/useCageMetrics';
import { toast } from 'sonner';

interface FCROptimization {
  cage_id: string;
  cage_name: string;
  current_fcr: number;
  target_fcr: number;
  optimization_potential: number;
  recommendations: FCRRecommendation[];
  projected_savings: number;
  implementation_timeline: string;
}

interface FCRRecommendation {
  action: string;
  impact_percentage: number;
  effort_level: 'low' | 'medium' | 'high';
  cost_estimate: number;
  description: string;
}

export const FCROptimizerPanel = () => {
  const [selectedCage, setSelectedCage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [optimizations, setOptimizations] = useState<FCROptimization[]>([]);
  const { user } = useAuth();
  const { cages } = useCageMetrics();

  const activeCages = cages.filter(cage => cage.statut === 'en_production' || cage.statut === 'actif');

  const generateFCROptimizations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: feedingData } = await supabase
        .from('feeding_sessions')
        .select('*')
        .eq('user_id', user.id);

      const { data: salesData } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id);

      const optimizations: FCROptimization[] = [];

      for (const cage of activeCages) {
        const cageFeeding = feedingData?.filter(f => f.cage_id === cage.id) || [];
        const cageSales = salesData?.filter(s => s.cage_id === cage.id) || [];
        
        const optimization = await calculateFCROptimization(cage, cageFeeding, cageSales);
        if (optimization) {
          optimizations.push(optimization);
        }
      }

      setOptimizations(optimizations.sort((a, b) => b.optimization_potential - a.optimization_potential));
      toast.success(`${optimizations.length} optimisations FCR générées`);
    } catch (error) {
      console.error('Error generating FCR optimizations:', error);
      toast.error('Erreur lors de la génération des optimisations');
      generateFallbackOptimizations();
    } finally {
      setLoading(false);
    }
  };

  const calculateFCROptimization = async (cage: any, feeding: any[], sales: any[]): Promise<FCROptimization | null> => {
    const currentFCR = cage.fcr || 0;
    if (currentFCR === 0 || currentFCR < 1.2) return null; // FCR déjà optimal

    // Calculer le FCR cible basé sur l'espèce et les meilleures pratiques
    const targetFCR = calculateTargetFCR(cage.espece, cage.poids_moyen);
    
    if (currentFCR <= targetFCR) return null; // Déjà optimal

    const optimizationPotential = ((currentFCR - targetFCR) / currentFCR) * 100;
    
    // Générer les recommandations spécifiques
    const recommendations = generateFCRRecommendations(cage, feeding);
    
    // Calculer les économies projetées
    const projectedSavings = calculateProjectedSavings(cage, currentFCR, targetFCR);

    return {
      cage_id: cage.id,
      cage_name: cage.nom,
      current_fcr: currentFCR,
      target_fcr: targetFCR,
      optimization_potential: optimizationPotential,
      recommendations,
      projected_savings: projectedSavings,
      implementation_timeline: determineImplementationTimeline(recommendations)
    };
  };

  const calculateTargetFCR = (species: string, averageWeight: number): number => {
    // FCR cibles par espèce et poids
    const targets = {
      tilapia: averageWeight < 0.3 ? 1.2 : averageWeight < 0.6 ? 1.5 : 1.8,
      trout: averageWeight < 0.2 ? 1.0 : averageWeight < 0.5 ? 1.3 : 1.6,
      salmon: averageWeight < 0.5 ? 1.1 : averageWeight < 1.0 ? 1.4 : 1.7,
      catfish: averageWeight < 0.4 ? 1.3 : averageWeight < 0.8 ? 1.6 : 1.9,
      carp: averageWeight < 0.5 ? 1.4 : averageWeight < 1.0 ? 1.7 : 2.0
    };

    return targets[species?.toLowerCase() as keyof typeof targets] || 1.8;
  };

  const generateFCRRecommendations = (cage: any, feeding: any[]): FCRRecommendation[] => {
    const recommendations: FCRRecommendation[] = [];
    const currentFCR = cage.fcr;
    
    // Analyse de la fréquence d'alimentation
    const avgDailyFeeding = feeding.length > 0 ? feeding.length / 30 : 0; // Approximation
    if (avgDailyFeeding < 2) {
      recommendations.push({
        action: 'Augmenter la fréquence d\'alimentation',
        impact_percentage: 15,
        effort_level: 'low',
        cost_estimate: 0,
        description: 'Passer à 3-4 repas par jour pour améliorer la digestion et réduire les pertes'
      });
    }

    // Analyse de la quantité d'aliment
    if (currentFCR > 2.2) {
      recommendations.push({
        action: 'Réduire la quantité d\'aliment de 10%',
        impact_percentage: 12,
        effort_level: 'low',
        cost_estimate: 0,
        description: 'Surveiller l\'appétit et ajuster progressivement les quantités'
      });
    }

    // Qualité de l'aliment
    recommendations.push({
      action: 'Optimiser la qualité de l\'aliment',
      impact_percentage: 20,
      effort_level: 'medium',
      cost_estimate: 300,
      description: 'Utiliser un aliment avec un taux de protéines adapté à la phase de croissance'
    });

    // Conditions environnementales
    if (cage.taux_mortalite > 5) {
      recommendations.push({
        action: 'Améliorer la qualité de l\'eau',
        impact_percentage: 18,
        effort_level: 'high',
        cost_estimate: 800,
        description: 'Optimiser l\'oxygénation et maintenir des paramètres d\'eau stables'
      });
    }

    // Gestion du stress
    recommendations.push({
      action: 'Réduire le stress des poissons',
      impact_percentage: 10,
      effort_level: 'medium',
      cost_estimate: 200,
      description: 'Minimiser les manipulations et maintenir des densités appropriées'
    });

    // Suivi et ajustements
    recommendations.push({
      action: 'Mettre en place un suivi hebdomadaire',
      impact_percentage: 8,
      effort_level: 'low',
      cost_estimate: 0,
      description: 'Calculer le FCR chaque semaine et ajuster rapidement si nécessaire'
    });

    return recommendations.sort((a, b) => b.impact_percentage - a.impact_percentage);
  };

  const calculateProjectedSavings = (cage: any, currentFCR: number, targetFCR: number): number => {
    const biomass = (cage.nombre_poissons || 0) * (cage.poids_moyen || 0);
    const feedReduction = biomass * (currentFCR - targetFCR);
    const feedCostPerKg = 1.2; // €/kg
    
    return feedReduction * feedCostPerKg;
  };

  const determineImplementationTimeline = (recommendations: FCRRecommendation[]): string => {
    const hasHighEffort = recommendations.some(r => r.effort_level === 'high');
    const hasMediumEffort = recommendations.some(r => r.effort_level === 'medium');
    
    if (hasHighEffort) return '2-4 mois';
    if (hasMediumEffort) return '3-6 semaines';
    return '1-2 semaines';
  };

  const generateFallbackOptimizations = () => {
    const fallbackData: FCROptimization[] = activeCages
      .filter(cage => cage.fcr > 1.8)
      .map(cage => ({
        cage_id: cage.id,
        cage_name: cage.nom,
        current_fcr: cage.fcr,
        target_fcr: 1.8,
        optimization_potential: ((cage.fcr - 1.8) / cage.fcr) * 100,
        recommendations: [
          {
            action: 'Optimiser la fréquence d\'alimentation',
            impact_percentage: 15,
            effort_level: 'low' as const,
            cost_estimate: 0,
            description: 'Passer à 3-4 repas quotidiens pour améliorer la conversion'
          },
          {
            action: 'Améliorer la qualité de l\'aliment',
            impact_percentage: 20,
            effort_level: 'medium' as const,
            cost_estimate: 300,
            description: 'Utiliser un aliment premium avec taux de protéines optimal'
          }
        ],
        projected_savings: 800,
        implementation_timeline: '3-6 semaines'
      }));

    setOptimizations(fallbackData);
  };

  const implementOptimization = async (cageId: string) => {
    toast.success('Plan d\'optimisation FCR activé pour cette cage');
    // Ici vous pourriez créer des plans d'alimentation optimisés, des alertes, etc.
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-400 bg-green-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'high': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const filteredOptimizations = selectedCage 
    ? optimizations.filter(opt => opt.cage_id === selectedCage)
    : optimizations;

  useEffect(() => {
    if (user && activeCages.length > 0) {
      generateFCROptimizations();
    }
  }, [user, activeCages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Target className="h-8 w-8 text-blue-400" />
            Optimiseur FCR Intelligent
          </h2>
          <p className="text-muted-foreground">
            Réduisez vos coûts d'alimentation et maximisez l'efficacité de conversion
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedCage} onValueChange={setSelectedCage}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Toutes les cages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les cages</SelectItem>
              {activeCages.map(cage => (
                <SelectItem key={cage.id} value={cage.id}>
                  {cage.nom} (FCR: {cage.fcr?.toFixed(2) || 'N/A'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={generateFCROptimizations} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Analyser
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cages à optimiser</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center text-orange-400">
              {optimizations.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Économies potentielles</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center text-green-400">
              {optimizations.reduce((sum, opt) => sum + opt.projected_savings, 0).toLocaleString('fr-FR')}€
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amélioration moyenne</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center text-blue-400">
              {optimizations.length > 0 
                ? (optimizations.reduce((sum, opt) => sum + opt.optimization_potential, 0) / optimizations.length).toFixed(1)
                : '0'}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions disponibles</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center text-purple-400">
              {optimizations.reduce((sum, opt) => sum + opt.recommendations.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optimizations List */}
      <div className="space-y-6">
        {filteredOptimizations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {loading ? 'Analyse en cours...' : 'Aucune optimisation FCR nécessaire'}
              </p>
              {!loading && activeCages.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Vous devez avoir des cages en production pour générer des optimisations
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredOptimizations.map((optimization) => (
            <Card key={optimization.cage_id} className="border-l-4 border-l-blue-400">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{optimization.cage_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      FCR actuel: {optimization.current_fcr.toFixed(2)} → Cible: {optimization.target_fcr.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-400">
                      -{optimization.optimization_potential.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Potentiel d'amélioration</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progression vers l'objectif</span>
                    <span>{((optimization.target_fcr / optimization.current_fcr) * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={(optimization.target_fcr / optimization.current_fcr) * 100} />
                </div>

                {/* Économies projetées */}
                <div className="bg-green-500/10 p-4 rounded-lg">
                  <h4 className="font-medium text-green-400 mb-2">Économies projetées</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Économies annuelles</p>
                      <p className="font-bold text-green-400">{optimization.projected_savings.toLocaleString('fr-FR')}€</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Délai d'implémentation</p>
                      <p className="font-bold">{optimization.implementation_timeline}</p>
                    </div>
                  </div>
                </div>

                {/* Recommandations */}
                <div>
                  <h4 className="font-medium mb-3">Actions recommandées</h4>
                  <div className="space-y-3">
                    {optimization.recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-background/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium">{rec.action}</h5>
                            <Badge variant="outline" className={getEffortColor(rec.effort_level)}>
                              {rec.effort_level === 'low' ? 'Facile' : 
                               rec.effort_level === 'medium' ? 'Moyen' : 'Difficile'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{rec.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="text-blue-400">Impact: +{rec.impact_percentage}%</span>
                            {rec.cost_estimate > 0 && (
                              <span className="text-orange-400">Coût: {rec.cost_estimate}€</span>
                            )}
                          </div>
                        </div>
                        <Activity className="h-5 w-5 text-blue-400 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={() => implementOptimization(optimization.cage_id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activer l'optimisation
                  </Button>
                  <Button variant="outline">
                    <Calculator className="h-4 w-4 mr-2" />
                    Simuler l'impact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};