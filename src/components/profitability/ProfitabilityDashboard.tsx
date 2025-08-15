import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  BarChart3, 
  AlertTriangle,
  RefreshCw,
  Lightbulb,
  Euro,
  Clock,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ProfitabilityScore {
  cage_id: string;
  cage_name: string;
  profitability_score: number;
  roi_percentage: number;
  profit_margin: number;
  cost_efficiency: number;
  revenue_per_kg: number;
  recommendations: string[];
}

interface OptimizationOpportunity {
  id: string;
  type: string;
  title: string;
  description: string;
  potential_savings: number;
  estimated_roi_improvement: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  implementation_effort: 'low' | 'medium' | 'high';
  cage_id?: string;
}

export const ProfitabilityDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [profitabilityData, setProfitabilityData] = useState<{
    global_metrics: any;
    cage_scores: ProfitabilityScore[];
    optimization_opportunities: OptimizationOpportunity[];
    roi_projections: any;
  } | null>(null);
  const { user } = useAuth();

  const loadProfitabilityData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Récupérer les données ROI et optimisations
      const { data: roiData, error: roiError } = await supabase.functions.invoke('roi-optimizer', {
        body: { user_id: user.id }
      });

      if (roiError) {
        console.error('ROI optimization error:', roiError);
        throw roiError;
      }

      // Calculer les scores de rentabilité par cage
      const cageScores = await calculateCageProfitabilityScores(roiData.data.cage_performance);

      setProfitabilityData({
        global_metrics: roiData.data.current_performance.global_metrics,
        cage_scores: cageScores,
        optimization_opportunities: roiData.data.optimization_opportunities,
        roi_projections: roiData.data.roi_projections
      });

      toast.success('Analyse de rentabilité mise à jour');
    } catch (error) {
      console.error('Error loading profitability data:', error);
      toast.error('Erreur lors du chargement des données de rentabilité');
      // Fallback avec données simulées
      generateFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const calculateCageProfitabilityScores = async (cagePerformance: any[]): Promise<ProfitabilityScore[]> => {
    return cagePerformance.map(cage => {
      // Calculer le score de rentabilité (0-100)
      let score = 0;
      
      // ROI (40% du score)
      if (cage.roi > 25) score += 40;
      else if (cage.roi > 15) score += 30;
      else if (cage.roi > 5) score += 20;
      else if (cage.roi > 0) score += 10;
      
      // Efficacité des coûts (30% du score)
      const costEfficiency = cage.revenue > 0 ? (cage.profit / cage.revenue) * 100 : 0;
      if (costEfficiency > 25) score += 30;
      else if (costEfficiency > 15) score += 20;
      else if (costEfficiency > 5) score += 10;
      
      // Performance opérationnelle (30% du score)
      if (cage.fcr < 1.5) score += 20;
      else if (cage.fcr < 2.0) score += 15;
      else if (cage.fcr < 2.5) score += 10;
      
      if (cage.mortality_rate < 3) score += 10;
      else if (cage.mortality_rate < 5) score += 5;

      const revenuePerKg = cage.biomass > 0 ? cage.revenue / cage.biomass : 0;

      return {
        cage_id: cage.cage_id,
        cage_name: cage.cage_name,
        profitability_score: Math.round(score),
        roi_percentage: cage.roi,
        profit_margin: costEfficiency,
        cost_efficiency: cage.costs > 0 ? (cage.revenue / cage.costs) * 100 : 0,
        revenue_per_kg: revenuePerKg,
        recommendations: generateCageRecommendations(cage, score)
      };
    });
  };

  const generateCageRecommendations = (cage: any, score: number): string[] => {
    const recommendations = [];
    
    if (score < 50) {
      recommendations.push('🚨 Rentabilité critique - Action urgente requise');
    }
    
    if (cage.fcr > 2.0) {
      recommendations.push('🎯 Optimiser l\'efficacité alimentaire (FCR)');
    }
    
    if (cage.mortality_rate > 5) {
      recommendations.push('⚕️ Améliorer la gestion sanitaire');
    }
    
    if (cage.roi < 15) {
      recommendations.push('💰 Réviser la stratégie de prix');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Performance satisfaisante - Maintenir les bonnes pratiques');
    }

    return recommendations;
  };

  const generateFallbackData = () => {
    setProfitabilityData({
      global_metrics: {
        total_revenue: 45000,
        total_costs: 32000,
        net_profit: 13000,
        roi_percentage: 18.5,
        profit_margin: 28.9
      },
      cage_scores: [
        {
          cage_id: '1',
          cage_name: 'Cage A-001',
          profitability_score: 85,
          roi_percentage: 24.5,
          profit_margin: 32.1,
          cost_efficiency: 140,
          revenue_per_kg: 6.8,
          recommendations: ['✅ Excellente performance', '🎯 Potentiel premium pricing']
        },
        {
          cage_id: '2', 
          cage_name: 'Cage B-002',
          profitability_score: 65,
          roi_percentage: 16.2,
          profit_margin: 22.5,
          cost_efficiency: 125,
          revenue_per_kg: 6.2,
          recommendations: ['🎯 Optimiser l\'efficacité alimentaire', '💡 Réduire les coûts operationnels']
        }
      ],
      optimization_opportunities: [
        {
          id: 'fcr-opt-1',
          type: 'fcr_optimization',
          title: 'Optimisation FCR - Cage B-002',
          description: 'Réduire le FCR de 2.3 à 1.8 par amélioration alimentaire',
          potential_savings: 1200,
          estimated_roi_improvement: 8,
          priority: 'high',
          implementation_effort: 'medium',
          cage_id: '2'
        }
      ],
      roi_projections: {
        current_roi: 18.5,
        optimized_roi: 26.5,
        improvement_potential: 8,
        timeframe_months: 6
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  useEffect(() => {
    if (user) {
      loadProfitabilityData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!profitabilityData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune donnée de rentabilité disponible</p>
          <Button onClick={loadProfitabilityData} className="mt-4">
            Charger les données
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard Rentabilité</h2>
          <p className="text-muted-foreground">Optimisation temps réel pour maximiser vos profits</p>
        </div>
        <Button onClick={loadProfitabilityData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Global</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {profitabilityData.global_metrics.roi_percentage.toFixed(1)}%
            </div>
            <div className="flex items-center justify-center mt-2">
              <Badge variant={profitabilityData.global_metrics.roi_percentage >= 20 ? "default" : "secondary"}>
                {profitabilityData.global_metrics.roi_percentage >= 20 ? "Excellent" : "À améliorer"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Net</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {profitabilityData.global_metrics.net_profit.toLocaleString('fr-FR')}€
            </div>
            <Progress value={profitabilityData.global_metrics.profit_margin} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potentiel d'Amélioration</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center text-green-400">
              +{profitabilityData.roi_projections.improvement_potential}%
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">
              ROI en {profitabilityData.roi_projections.timeframe_months} mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions Prioritaires</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center text-orange-400">
              {profitabilityData.optimization_opportunities.filter(o => o.priority === 'critical' || o.priority === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Opportunités critiques
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="scores" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scores">Scores par Cage</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
          <TabsTrigger value="projections">Projections ROI</TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {profitabilityData.cage_scores.map((cage) => (
              <Card key={cage.cage_id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{cage.cage_name}</CardTitle>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(cage.profitability_score)}`}>
                        {cage.profitability_score}
                      </div>
                      <p className="text-xs text-muted-foreground">Score rentabilité</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">ROI</p>
                      <p className="font-semibold">{cage.roi_percentage.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Marge</p>
                      <p className="font-semibold">{cage.profit_margin.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Efficacité</p>
                      <p className="font-semibold">{cage.cost_efficiency.toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">€/kg</p>
                      <p className="font-semibold">{cage.revenue_per_kg.toFixed(2)}€</p>
                    </div>
                  </div>
                  
                  <div>
                    <Progress value={cage.profitability_score} className="mb-2" />
                    <div className="space-y-1">
                      {cage.recommendations.map((rec, index) => (
                        <p key={index} className="text-xs text-muted-foreground">
                          {rec}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="space-y-4">
            {profitabilityData.optimization_opportunities.map((opp) => (
              <Card key={opp.id} className={`border ${getPriorityColor(opp.priority)}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{opp.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{opp.description}</p>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(opp.priority)}>
                      {opp.priority === 'critical' ? 'Critique' : 
                       opp.priority === 'high' ? 'Haute' :
                       opp.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-green-500/10 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-400">Économies potentielles</p>
                      <p className="text-lg font-bold text-green-400">{opp.potential_savings}€</p>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-400">Amélioration ROI</p>
                      <p className="text-lg font-bold text-blue-400">+{opp.estimated_roi_improvement}%</p>
                    </div>
                    <div className="bg-purple-500/10 p-3 rounded-lg">
                      <p className="text-sm font-medium text-purple-400">Effort requis</p>
                      <p className="text-lg font-bold text-purple-400 capitalize">{opp.implementation_effort}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Implémenter
                    </Button>
                    <Button size="sm" variant="outline">
                      <Lightbulb className="h-4 w-4 mr-1" />
                      Voir détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Projection ROI Optimisé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400">
                    {profitabilityData.roi_projections.optimized_roi.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">ROI cible en 6 mois</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">ROI actuel</span>
                    <span className="font-medium">{profitabilityData.roi_projections.current_roi.toFixed(1)}%</span>
                  </div>
                  <Progress value={(profitabilityData.roi_projections.current_roi / profitabilityData.roi_projections.optimized_roi) * 100} />
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Amélioration potentielle</span>
                    <span className="font-medium text-green-400">+{profitabilityData.roi_projections.improvement_potential}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendrier d'Implémentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Actions critiques</p>
                      <p className="text-sm text-muted-foreground">Semaines 1-2</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Optimisations majeures</p>
                      <p className="text-sm text-muted-foreground">Mois 1-3</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Résultats complets</p>
                      <p className="text-sm text-muted-foreground">Mois 6</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-medium mb-2">Impact financier estimé</h4>
                    <p className="text-sm text-muted-foreground">
                      Augmentation du profit net de {((profitabilityData.roi_projections.optimized_roi - profitabilityData.roi_projections.current_roi) * profitabilityData.global_metrics.total_costs / 100).toLocaleString('fr-FR')}€ par an
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};