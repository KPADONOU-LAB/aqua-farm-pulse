import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Fish, 
  Coffee, 
  Heart, 
  ShoppingCart,
  Zap,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  Brain,
  BarChart3
} from "lucide-react";
import { useOptimizedCages } from "@/hooks/useOptimizedData";
import { useOptimizedSmartAlerts } from "@/hooks/useOptimizedData";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface QuickAction {
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<any>;
  priority: 'high' | 'medium' | 'low';
  category: 'urgent' | 'routine' | 'analytics' | 'advanced';
  badge?: string;
  badgeVariant?: 'destructive' | 'default' | 'secondary' | 'outline';
}

export function IntelligentDashboard() {
  const { user } = useAuth();
  const { cages } = useOptimizedCages();
  const { alerts } = useOptimizedSmartAlerts();
  const [recommendedActions, setRecommendedActions] = useState<QuickAction[]>([]);

  const generateIntelligentRecommendations = useCallback(() => {
    const actions: QuickAction[] = [];
    const now = new Date();
    const today = now.toDateString();

    // Actions urgentes basées sur les alertes
    const criticalAlerts = alerts.filter(alert => 
      alert.niveau_criticite === 'error' && alert.statut === 'active'
    );
    
    if (criticalAlerts.length > 0) {
      actions.push({
        title: "Alertes Critiques",
        description: `${criticalAlerts.length} alertes nécessitent une attention immédiate`,
        url: "/alerts",
        icon: AlertTriangle,
        priority: 'high',
        category: 'urgent',
        badge: criticalAlerts.length.toString(),
        badgeVariant: 'destructive'
      });
    }

    // Vérification des cages en production
    const activeCages = cages.filter(cage => cage.statut === 'actif');
    
    if (activeCages.length > 0) {
      // Recommandations d'alimentation
      actions.push({
        title: "Alimentation Quotidienne",
        description: `Gérer l'alimentation de ${activeCages.length} cages actives`,
        url: "/feeding",
        icon: Coffee,
        priority: 'high',
        category: 'routine',
        badge: activeCages.length.toString(),
        badgeVariant: 'secondary'
      });

      // Suivi de santé
      actions.push({
        title: "Contrôle Santé",
        description: "Enregistrer les observations quotidiennes",
        url: "/health",
        icon: Heart,
        priority: 'high',
        category: 'routine'
      });
    }

    // Cages prêtes pour la récolte
    const harvestReady = cages.filter(cage => 
      cage.poids_moyen && cage.poids_moyen >= 0.8 && cage.statut === 'actif'
    );
    
    if (harvestReady.length > 0) {
      actions.push({
        title: "Récolte Recommandée",
        description: `${harvestReady.length} cages ont atteint le poids optimal`,
        url: "/sales",
        icon: ShoppingCart,
        priority: 'high',
        category: 'urgent',
        badge: harvestReady.length.toString(),
        badgeVariant: 'default'
      });
    }

    // Performance analytics
    const poorPerformingCages = cages.filter(cage => 
      cage.fcr && cage.fcr > 2.2
    );
    
    if (poorPerformingCages.length > 0) {
      actions.push({
        title: "Optimiser Performance",
        description: `${poorPerformingCages.length} cages avec FCR élevé`,
        url: "/performance",
        icon: TrendingUp,
        priority: 'medium',
        category: 'analytics',
        badge: poorPerformingCages.length.toString(),
        badgeVariant: 'secondary'
      });
    }

    // Recommandations IA
    actions.push({
      title: "Recommandations IA",
      description: "Optimisations personnalisées basées sur vos données",
      url: "/smart-recommendations",
      icon: Brain,
      priority: 'medium',
      category: 'advanced'
    });

    // Actions de routine
    actions.push(
      {
        title: "Gestion des Cages",
        description: "Voir et modifier vos cages de production",
        url: "/cages",
        icon: Fish,
        priority: 'medium',
        category: 'routine'
      },
      {
        title: "Rapports Analytics",
        description: "Analyser les performances et tendances",
        url: "/reports",
        icon: BarChart3,
        priority: 'low',
        category: 'analytics'
      }
    );

    // Trier par priorité et catégorie
    actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const categoryOrder = { urgent: 4, routine: 3, analytics: 2, advanced: 1 };
      
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return categoryOrder[b.category] - categoryOrder[a.category];
    });

    setRecommendedActions(actions);
  }, [cages, alerts]);

  useEffect(() => {
    generateIntelligentRecommendations();
  }, [generateIntelligentRecommendations]);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'urgent': return 'Actions Urgentes';
      case 'routine': return 'Tâches Quotidiennes';
      case 'analytics': return 'Analyse & Performance';
      case 'advanced': return 'Outils Avancés';
      default: return 'Autres';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'urgent': return AlertTriangle;
      case 'routine': return Clock;
      case 'analytics': return TrendingUp;
      case 'advanced': return Brain;
      default: return Target;
    }
  };

  const groupedActions = recommendedActions.reduce((groups, action) => {
    if (!groups[action.category]) {
      groups[action.category] = [];
    }
    groups[action.category].push(action);
    return groups;
  }, {} as Record<string, QuickAction[]>);

  return (
    <div className="space-y-6 p-6">
      {/* En-tête personnalisé */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {getTimeBasedGreeting()}, {user?.email?.split('@')[0]}
        </h1>
        <p className="text-muted-foreground">
          Voici vos actions recommandées pour aujourd'hui
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Fish className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Cages Actives</p>
                <p className="text-2xl font-bold">{cages.filter(c => c.statut === 'actif').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Alertes Actives</p>
                <p className="text-2xl font-bold">{alerts.filter(a => a.statut === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Prêt Récolte</p>
                <p className="text-2xl font-bold">
                  {cages.filter(c => c.poids_moyen && c.poids_moyen >= 0.8).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Actions Recommandées</p>
                <p className="text-2xl font-bold">{recommendedActions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions recommandées par catégorie */}
      {Object.entries(groupedActions).map(([category, actions]) => {
        const CategoryIcon = getCategoryIcon(category);
        
        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CategoryIcon className="h-5 w-5" />
                {getCategoryTitle(category)}
                <Badge variant="secondary">{actions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actions.map((action, index) => (
                  <NavLink key={index} to={action.url}>
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            action.priority === 'high' ? 'bg-red-100 text-red-600' :
                            action.priority === 'medium' ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <action.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm">{action.title}</h3>
                              {action.badge && (
                                <Badge variant={action.badgeVariant || 'default'} className="text-xs">
                                  {action.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </NavLink>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Accès rapide à toutes les fonctions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Accès Rapide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { title: "Cages", url: "/cages", icon: Fish },
              { title: "Alimentation", url: "/feeding", icon: Coffee },
              { title: "Santé", url: "/health", icon: Heart },
              { title: "Ventes", url: "/sales", icon: ShoppingCart },
              { title: "Rapports", url: "/reports", icon: BarChart3 },
              { title: "Recommandations", url: "/smart-recommendations", icon: Brain },
            ].map((item) => (
              <NavLink key={item.title} to={item.url}>
                <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.title}</span>
                </Button>
              </NavLink>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}