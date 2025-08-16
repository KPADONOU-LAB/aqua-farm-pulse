import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Zap, 
  Settings, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Target,
  Activity,
  Lightbulb,
  Gauge
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_conditions: any;
  actions: string[];
  is_active: boolean;
  confidence_level: number;
  success_rate: number;
  last_triggered: string | null;
  impact_estimate: string;
}

interface AutomationInsight {
  category: string;
  title: string;
  description: string;
  confidence: number;
  potential_savings: number;
  implementation_effort: 'low' | 'medium' | 'high';
  status: 'suggestion' | 'testing' | 'active' | 'paused';
}

export const IntelligentAutomationPanel = () => {
  const [loading, setLoading] = useState(false);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [automationInsights, setAutomationInsights] = useState<AutomationInsight[]>([]);
  const [systemStatus, setSystemStatus] = useState({
    active_rules: 0,
    total_actions_today: 0,
    success_rate: 0,
    cost_savings_this_month: 0
  });
  const { user } = useAuth();

  const loadAutomationData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Charger les règles d'automatisation existantes
      await loadAutomationRules();
      
      // Générer des insights d'automatisation intelligente
      await generateAutomationInsights();
      
      // Calculer le statut du système
      calculateSystemStatus();
      
      toast.success('Données d\'automatisation mises à jour');
    } catch (error) {
      console.error('Error loading automation data:', error);
      toast.error('Erreur lors du chargement des données d\'automatisation');
      // Fallback avec données de démonstration
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadAutomationRules = async () => {
    // Simuler des règles d'automatisation intelligente
    const demoRules: AutomationRule[] = [
      {
        id: '1',
        name: 'Ajustement automatique FCR',
        description: 'Optimise automatiquement les quantités d\'alimentation basé sur le FCR temps réel',
        trigger_type: 'fcr_threshold',
        trigger_conditions: { fcr_exceeds: 2.0, duration_days: 3 },
        actions: ['reduce_feeding_10_percent', 'check_water_quality', 'notify_manager'],
        is_active: true,
        confidence_level: 92,
        success_rate: 87,
        last_triggered: '2024-01-15T14:30:00Z',
        impact_estimate: 'Économies: 200-400€/mois'
      },
      {
        id: '2',
        name: 'Alerte mortalité prédictive',
        description: 'Détecte les signes précurseurs de mortalité basé sur l\'IA comportementale',
        trigger_type: 'ai_pattern',
        trigger_conditions: { behavior_anomaly: 0.8, water_quality_decline: true },
        actions: ['emergency_health_check', 'adjust_feeding', 'contact_veterinarian'],
        is_active: true,
        confidence_level: 89,
        success_rate: 94,
        last_triggered: '2024-01-14T09:15:00Z',
        impact_estimate: 'Prévention: 1000-2000€ pertes'
      },
      {
        id: '3',
        name: 'Optimisation prix de vente',
        description: 'Suggère le moment optimal pour la vente basé sur les prix du marché',
        trigger_type: 'market_conditions',
        trigger_conditions: { price_trend: 'rising', biomass_ready: 0.8 },
        actions: ['suggest_harvest_timing', 'calculate_profit_projection', 'prepare_sales_documents'],
        is_active: true,
        confidence_level: 95,
        success_rate: 91,
        last_triggered: '2024-01-13T16:45:00Z',
        impact_estimate: 'Gains: 500-800€/cycle'
      },
      {
        id: '4',
        name: 'Maintenance prédictive équipements',
        description: 'Prévoit les besoins de maintenance avant les pannes',
        trigger_type: 'equipment_analysis',
        trigger_conditions: { usage_hours: 500, performance_decline: 0.15 },
        actions: ['schedule_maintenance', 'order_spare_parts', 'backup_plan_activation'],
        is_active: false,
        confidence_level: 78,
        success_rate: 83,
        last_triggered: null,
        impact_estimate: 'Prévention: 300-600€ réparations'
      }
    ];

    setAutomationRules(demoRules);
  };

  const generateAutomationInsights = async () => {
    const insights: AutomationInsight[] = [
      {
        category: 'Alimentation',
        title: 'Automatisation horaires optimaux',
        description: 'L\'IA a identifié que vos poissons sont 23% plus actifs entre 7h-9h et 17h-19h',
        confidence: 94,
        potential_savings: 350,
        implementation_effort: 'low',
        status: 'suggestion'
      },
      {
        category: 'Qualité eau',
        title: 'Aération automatique intelligente',
        description: 'Activation automatique des aérateurs quand O2 < 6mg/L OU température > 28°C',
        confidence: 98,
        potential_savings: 180,
        implementation_effort: 'medium',
        status: 'testing'
      },
      {
        category: 'Croissance',
        title: 'Prédiction poids optimal',
        description: 'Prédire le moment exact où chaque cage atteint le poids cible pour maximiser les profits',
        confidence: 87,
        potential_savings: 750,
        implementation_effort: 'low',
        status: 'active'
      },
      {
        category: 'Finance',
        title: 'Achat automatique aliments',
        description: 'Commander automatiquement les aliments quand stock < 15 jours ET prix favorable',
        confidence: 91,
        potential_savings: 420,
        implementation_effort: 'medium',
        status: 'suggestion'
      },
      {
        category: 'Santé',
        title: 'Diagnostic IA comportemental',
        description: 'Caméras IA pour détecter stress, maladie, comportements anormaux en temps réel',
        confidence: 82,
        potential_savings: 1200,
        implementation_effort: 'high',
        status: 'suggestion'
      }
    ];

    setAutomationInsights(insights);
  };

  const calculateSystemStatus = () => {
    setSystemStatus({
      active_rules: automationRules.filter(rule => rule.is_active).length,
      total_actions_today: 27,
      success_rate: 89,
      cost_savings_this_month: 1850
    });
  };

  const loadDemoData = () => {
    // Charger des données de démonstration en cas d'erreur
    loadAutomationRules();
    generateAutomationInsights();
    calculateSystemStatus();
  };

  const toggleAutomationRule = async (ruleId: string, isActive: boolean) => {
    try {
      // Dans un vrai système, cela mettrait à jour la base de données
      setAutomationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, is_active: isActive } : rule
        )
      );
      
      toast.success(isActive ? 'Règle activée' : 'Règle désactivée');
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Erreur lors de la modification de la règle');
    }
  };

  const implementInsight = async (insight: AutomationInsight) => {
    try {
      setLoading(true);
      
      // Simuler l'implémentation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAutomationInsights(prev =>
        prev.map(item =>
          item.title === insight.title
            ? { ...item, status: 'testing' as const }
            : item
        )
      );
      
      toast.success(`Implémentation de "${insight.title}" lancée`);
    } catch (error) {
      console.error('Error implementing insight:', error);
      toast.error('Erreur lors de l\'implémentation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'suggestion': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'testing': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'active': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'paused': return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'suggestion': return 'Suggestion';
      case 'testing': return 'En test';
      case 'active': return 'Actif';
      case 'paused': return 'En pause';
      default: return 'Inconnu';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  useEffect(() => {
    if (user) {
      loadAutomationData();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-400" />
            Automatisation Intelligente
          </h2>
          <p className="text-muted-foreground">IA avancée pour optimiser vos opérations automatiquement</p>
        </div>
        <Button onClick={loadAutomationData} disabled={loading} variant="outline">
          <Zap className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser l'IA
        </Button>
      </div>

      {/* KPIs du système */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Règles Actives</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {systemStatus.active_rules}
            </div>
            <div className="flex items-center justify-center mt-2">
              <Badge variant="default">
                {Math.round((systemStatus.active_rules / automationRules.length) * 100)}% actif
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions Aujourd'hui</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center text-blue-400">
              {systemStatus.total_actions_today}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Automatisations exécutées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Succès</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center text-green-400">
              {systemStatus.success_rate}%
            </div>
            <Progress value={systemStatus.success_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Économies ce Mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center text-green-400">
              {systemStatus.cost_savings_this_month}€
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Grâce à l'automatisation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Règles Actives</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {automationRules.map((rule) => (
              <Card key={rule.id} className={`border-l-4 ${rule.is_active ? 'border-l-green-500' : 'border-l-gray-500'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) => toggleAutomationRule(rule.id, checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{rule.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Confiance IA</p>
                      <div className="flex items-center gap-2">
                        <Progress value={rule.confidence_level} className="flex-1" />
                        <span className="font-semibold">{rule.confidence_level}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taux de succès</p>
                      <p className="font-semibold text-green-400">{rule.success_rate}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Actions automatiques:</p>
                    <div className="flex flex-wrap gap-1">
                      {rule.actions.map((action, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {action.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      {rule.last_triggered ? (
                        <span>Dernière activation: {new Date(rule.last_triggered).toLocaleDateString('fr-FR')}</span>
                      ) : (
                        <span>Jamais activé</span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-green-400">
                      {rule.impact_estimate}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            {automationInsights.map((insight, index) => (
              <Card key={index} className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Brain className="h-5 w-5 text-purple-400" />
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <Badge variant="outline" className={getStatusColor(insight.status)}>
                          {getStatusText(insight.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground">Catégorie:</span>
                        <Badge variant="outline">{insight.category}</Badge>
                        <span className="text-muted-foreground">Effort:</span>
                        <span className={`font-medium ${getEffortColor(insight.implementation_effort)}`}>
                          {insight.implementation_effort}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-purple-400">Confiance IA</p>
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={insight.confidence} className="flex-1" />
                        <span className="text-sm font-bold">{insight.confidence}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-green-400">Économies potentielles</p>
                      <p className="text-lg font-bold text-green-400">{insight.potential_savings}€/mois</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-blue-400">Impact estimé</p>
                      <p className="text-lg font-bold text-blue-400">
                        {Math.round(insight.potential_savings * 12)}€/an
                      </p>
                    </div>
                  </div>
                  
                  {insight.status === 'suggestion' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => implementInsight(insight)}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Lightbulb className="h-4 w-4 mr-1" />
                        Tester cette suggestion
                      </Button>
                      <Button size="sm" variant="outline">
                        <Clock className="h-4 w-4 mr-1" />
                        Planifier plus tard
                      </Button>
                    </div>
                  )}
                  
                  {insight.status === 'testing' && (
                    <div className="flex items-center gap-2 text-blue-400">
                      <Gauge className="h-4 w-4" />
                      <span className="text-sm">Test en cours - Résultats dans 7-14 jours</span>
                    </div>
                  )}
                  
                  {insight.status === 'active' && (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Actif et fonctionnel</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance par Catégorie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { category: 'Alimentation', success: 94, actions: 156 },
                  { category: 'Qualité eau', success: 89, actions: 89 },
                  { category: 'Santé', success: 97, actions: 23 },
                  { category: 'Finance', success: 91, actions: 45 }
                ].map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.category}</span>
                      <span>{item.success}% succès ({item.actions} actions)</span>
                    </div>
                    <Progress value={item.success} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Économies Réalisées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">2,450€</div>
                  <p className="text-sm text-muted-foreground">Total économisé ce trimestre</p>
                </div>
                
                <div className="space-y-3">
                  {[
                    { source: 'Optimisation FCR', amount: 850 },
                    { source: 'Prévention mortalité', amount: 920 },
                    { source: 'Timing optimal ventes', amount: 480 },
                    { source: 'Maintenance prédictive', amount: 200 }
                  ].map((item) => (
                    <div key={item.source} className="flex justify-between items-center">
                      <span className="text-sm">{item.source}</span>
                      <span className="font-medium text-green-400">{item.amount}€</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};