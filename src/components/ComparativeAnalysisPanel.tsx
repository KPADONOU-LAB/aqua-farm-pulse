import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Trophy, 
  AlertTriangle,
  Target,
  Activity,
  DollarSign,
  Fish,
  RefreshCw
} from 'lucide-react';
import { useComparativeAnalysis } from '@/hooks/useComparativeAnalysis';

export const ComparativeAnalysisPanel = () => {
  const { 
    loading, 
    cages, 
    comparisons, 
    benchmarks, 
    getTopPerformers,
    getCagesNeedingAttention,
    refreshData 
  } = useComparativeAnalysis();

  const topPerformers = getTopPerformers();
  const cagesNeedingAttention = getCagesNeedingAttention();

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPerformanceBadgeVariant = (score: number) => {
    if (score >= 85) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Analyse comparative en cours...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Analyse comparative des performances
            </CardTitle>
            <Button variant="outline" size="sm" onClick={refreshData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {benchmarks.total_fish ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg">
                <Fish className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{benchmarks.total_fish.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Poissons totaux</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg">
                <Target className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{benchmarks.average_fcr?.toFixed(2) || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">FCR moyen</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg">
                <Activity className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{benchmarks.average_performance?.toFixed(0) || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Score moyen</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{benchmarks.total_biomass?.toFixed(0) || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Biomasse totale (kg)</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucune donnée disponible pour l'analyse comparative</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top performers */}
      {topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Meilleures performances
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((comparison, index) => (
                <div key={comparison.cage.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-400/20 rounded-full">
                    <span className="text-sm font-bold text-yellow-400">#{index + 1}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{comparison.cage.nom}</h4>
                      <Badge variant={getPerformanceBadgeVariant(comparison.cage.performance_score)}>
                        {comparison.cage.performance_score}/100
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <span>FCR: {comparison.cage.fcr?.toFixed(2) || 'N/A'}</span>
                      <span>Mortalité: {comparison.cage.taux_mortalite?.toFixed(1) || 'N/A'}%</span>
                      <span>Croissance: {comparison.cage.croissance_journaliere?.toFixed(1) || 'N/A'}g/j</span>
                      <span>Biomasse: {comparison.cage.biomasse_totale?.toFixed(0) || 'N/A'}kg</span>
                    </div>
                    
                    {comparison.strengths.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {comparison.strengths.slice(0, 2).map((strength, i) => (
                          <Badge key={i} variant="outline" className="text-xs text-green-400 border-green-400/30">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium">Top {comparison.percentile}%</p>
                    <p className="text-xs text-muted-foreground">
                      Meilleur que {comparison.better_than}% des cages
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cages nécessitant une attention */}
      {cagesNeedingAttention.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Cages nécessitant une attention
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {cagesNeedingAttention.map((comparison) => (
                <div key={comparison.cage.id} className="p-3 border border-orange-500/20 rounded-lg bg-gradient-to-r from-orange-500/5 to-red-500/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{comparison.cage.nom}</h4>
                    <Badge variant="destructive">
                      Score: {comparison.cage.performance_score}/100
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-muted-foreground">FCR: </span>
                      <span className={comparison.cage.fcr > 2.2 ? 'text-red-400' : ''}>
                        {comparison.cage.fcr?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mortalité: </span>
                      <span className={comparison.cage.taux_mortalite > 7 ? 'text-red-400' : ''}>
                        {comparison.cage.taux_mortalite?.toFixed(1) || 'N/A'}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Croissance: </span>
                      <span className={comparison.cage.croissance_journaliere < 10 ? 'text-red-400' : ''}>
                        {comparison.cage.croissance_journaliere?.toFixed(1) || 'N/A'}g/j
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rang: </span>
                      <span>{comparison.rank}/{comparisons.length}</span>
                    </div>
                  </div>
                  
                  {comparison.areas_improvement.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Axes d'amélioration:</p>
                      <div className="flex flex-wrap gap-1">
                        {comparison.areas_improvement.map((area, i) => (
                          <Badge key={i} variant="outline" className="text-xs text-orange-400 border-orange-400/30">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Classement complet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Classement général
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            {comparisons.sort((a, b) => a.rank - b.rank).map((comparison) => (
              <div key={comparison.cage.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full text-xs font-bold">
                  {comparison.rank}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comparison.cage.nom}</span>
                    <Badge variant="outline" className="text-xs">
                      {comparison.cage.espece}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Progress 
                    value={comparison.cage.performance_score} 
                    className="w-16 h-2"
                  />
                  <span className={`text-sm font-medium ${getPerformanceColor(comparison.cage.performance_score)}`}>
                    {comparison.cage.performance_score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};