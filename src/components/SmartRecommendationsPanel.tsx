import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  DollarSign,
  Calendar,
  RefreshCw,
  Filter,
  ArrowRight,
  Lightbulb,
  Euro,
  Timer,
  X
} from 'lucide-react';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import { useState } from 'react';

export const SmartRecommendationsPanel = () => {
  const {
    loading,
    recommendations,
    allRecommendations,
    filters,
    setFilters,
    generateRecommendations,
    getRecommendationsByPriority,
    markAsImplemented,
    postponeRecommendation
  } = useSmartRecommendations();

  const [expandedRec, setExpandedRec] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feeding': return <Target className="h-4 w-4" />;
      case 'water_quality': return <TrendingUp className="h-4 w-4" />;
      case 'health': return <AlertTriangle className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'harvest': return <Calendar className="h-4 w-4" />;
      case 'performance': return <Brain className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      feeding: 'Alimentation',
      water_quality: 'Qualité eau',
      health: 'Santé',
      financial: 'Financier',
      harvest: 'Récolte',
      performance: 'Performance'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const criticalRecs = getRecommendationsByPriority('critical');
  const highRecs = getRecommendationsByPriority('high');
  const implementationScore = allRecommendations.length > 0 
    ? Math.round((allRecommendations.reduce((sum, rec) => sum + rec.impact_score, 0) / allRecommendations.length))
    : 0;

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              Recommandations Intelligentes
            </CardTitle>
            <Button 
              onClick={generateRecommendations}
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-lg border border-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-400">{criticalRecs.length}</p>
              <p className="text-xs text-red-300">Critiques</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/20">
              <TrendingUp className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-400">{highRecs.length}</p>
              <p className="text-xs text-orange-300">Prioritaires</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
              <Target className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-400">{allRecommendations.length}</p>
              <p className="text-xs text-blue-300">Total</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
              <Brain className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-400">{implementationScore}</p>
              <p className="text-xs text-purple-300">Score impact</p>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Select value={filters.priority || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value || undefined }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.type || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value || undefined }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="feeding">Alimentation</SelectItem>
                <SelectItem value="health">Santé</SelectItem>
                <SelectItem value="financial">Financier</SelectItem>
                <SelectItem value="harvest">Récolte</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.implementation_difficulty || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, implementation_difficulty: value || undefined }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Difficulté" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes</SelectItem>
                <SelectItem value="easy">Facile</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="hard">Difficile</SelectItem>
              </SelectContent>
            </Select>

            {(filters.priority || filters.type || filters.implementation_difficulty) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFilters({})}
              >
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des recommandations */}
      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {loading ? 'Génération des recommandations...' : 'Aucune recommandation trouvée avec les filtres actuels'}
              </p>
            </CardContent>
          </Card>
        ) : (
          recommendations.map((rec) => (
            <Card key={rec.id} className={`border ${getPriorityColor(rec.priority)} transition-all duration-200 hover:shadow-lg`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(rec.type)}
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(rec.type)}
                      </Badge>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{rec.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{rec.description}</p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          Impact: {rec.impact_score}%
                        </div>
                        
                        <div className={`flex items-center gap-1 ${getDifficultyColor(rec.implementation_difficulty)}`}>
                          <Timer className="h-3 w-3" />
                          {rec.implementation_difficulty === 'easy' ? 'Facile' : rec.implementation_difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                        </div>
                        
                        {rec.roi_estimate && (
                          <div className="flex items-center gap-1 text-green-400">
                            <Euro className="h-3 w-3" />
                            ROI: +{rec.roi_estimate}€
                          </div>
                        )}
                        
                        {rec.deadline && (
                          <div className="flex items-center gap-1 text-orange-400">
                            <Clock className="h-3 w-3" />
                            {new Date(rec.deadline).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className={`${getPriorityColor(rec.priority)} uppercase text-xs font-bold`}
                  >
                    {rec.priority === 'critical' ? 'Critique' : 
                     rec.priority === 'high' ? 'Haute' :
                     rec.priority === 'medium' ? 'Moyenne' : 'Basse'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="mb-4">
                  <Progress value={rec.impact_score} className="h-2" />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-muted-foreground">Impact potentiel</span>
                    <span className="text-xs font-medium">{rec.impact_score}%</span>
                  </div>
                </div>

                <div className="bg-muted/30 p-3 rounded-lg mb-4">
                  <p className="text-sm font-medium text-primary mb-1">Amélioration estimée:</p>
                  <p className="text-sm">{rec.estimated_improvement}</p>
                </div>

                {expandedRec === rec.id && (
                  <div className="space-y-4">
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <ArrowRight className="h-4 w-4" />
                        Actions à entreprendre:
                      </h4>
                      <ul className="space-y-1">
                        {rec.action_items.map((action, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        Justification:
                      </h4>
                      <p className="text-sm text-muted-foreground bg-background/50 p-3 rounded">
                        {rec.reasoning}
                      </p>
                    </div>

                    {(rec.cost_estimate || rec.roi_estimate) && (
                      <div className="grid grid-cols-2 gap-4">
                        {rec.cost_estimate !== undefined && (
                          <div className="bg-red-500/10 p-3 rounded-lg">
                            <p className="text-sm font-medium text-red-400">Coût estimé</p>
                            <p className="text-lg font-bold text-red-400">{rec.cost_estimate}€</p>
                          </div>
                        )}
                        
                        {rec.roi_estimate && (
                          <div className="bg-green-500/10 p-3 rounded-lg">
                            <p className="text-sm font-medium text-green-400">ROI estimé</p>
                            <p className="text-lg font-bold text-green-400">+{rec.roi_estimate}€</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                    variant="outline"
                  >
                    {expandedRec === rec.id ? 'Réduire' : 'Voir détails'}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    onClick={() => markAsImplemented(rec.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Implémenté
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => postponeRecommendation(rec.id, 7)}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Reporter 7j
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