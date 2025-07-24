import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, TrendingDown, Plus, Award, AlertCircle } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { usePerformanceTargets } from "@/hooks/usePerformanceTargets";
import { useCageMetrics } from "@/hooks/useCageMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { NewPerformanceTargetModal } from "@/components/modals/NewPerformanceTargetModal";
import { useState, useEffect } from "react";

const PerformanceAnalysis = () => {
  const { targets, loading, getTargetByCage, calculatePerformanceComparison, getPerformanceStatus } = usePerformanceTargets();
  const { cages } = useCageMetrics();
  const [comparisons, setComparisons] = useState<any[]>([]);

  useEffect(() => {
    const loadComparisons = async () => {
      const results = [];
      for (const cage of cages.filter(c => c.statut === 'actif')) {
        const comparison = await calculatePerformanceComparison(cage.id);
        if (comparison) {
          results.push({ ...comparison, cageName: cage.nom });
        }
      }
      setComparisons(results);
    };

    if (cages.length > 0) {
      loadComparisons();
    }
  }, [cages, targets]);

  const averageScore = comparisons.length > 0 
    ? comparisons.reduce((sum, comp) => sum + comp.overall_score, 0) / comparisons.length 
    : 0;

  const excellentPerformers = comparisons.filter(comp => comp.overall_score >= 85).length;
  const needsAttention = comparisons.filter(comp => comp.overall_score < 70).length;

  const performanceData = comparisons.map(comp => ({
    cage: comp.cageName,
    score: Math.round(comp.overall_score),
    fcr_deviation: Math.round(comp.deviations.fcr_deviation),
    survival_deviation: Math.round(comp.deviations.survival_deviation),
    weight_deviation: Math.round(comp.deviations.weight_deviation),
    cost_deviation: Math.round(comp.deviations.cost_deviation)
  }));

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 85) return { label: 'Excellent', variant: 'default' as const };
    if (score >= 70) return { label: 'Bon', variant: 'secondary' as const };
    if (score >= 50) return { label: 'Moyen', variant: 'outline' as const };
    return { label: 'Critique', variant: 'destructive' as const };
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 animate-fade-in">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Analyse de Performance
        </h1>
        <p className="text-white/80 text-lg">
          Objectifs vs Réalisations
        </p>
        <div className="flex items-center gap-2 mt-2 text-white/60">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm">Suivi en temps réel des KPIs</span>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex gap-4 mb-6">
        <NewPerformanceTargetModal />
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: getScoreColor(averageScore) }}>
              {Math.round(averageScore)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Performance globale
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excellents</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{excellentPerformers}</div>
            <p className="text-xs text-muted-foreground">
              Cages &gt; 85% objectifs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À surveiller</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{needsAttention}</div>
            <p className="text-xs text-muted-foreground">
              Cages &lt; 70% objectifs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objectifs définis</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{targets.length}</div>
            <p className="text-xs text-muted-foreground">
              Cages avec objectifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparaisons détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {comparisons.map((comparison) => {
          const scoreStatus = getScoreStatus(comparison.overall_score);
          const radialData = [
            {
              name: 'Performance',
              value: comparison.overall_score,
              fill: getScoreColor(comparison.overall_score)
            }
          ];

          return (
            <Card key={comparison.target.cage_id} className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {comparison.cageName}
                  </CardTitle>
                  <Badge variant={scoreStatus.variant}>
                    {scoreStatus.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width={120} height={120}>
                    <RadialBarChart data={radialData} innerRadius="60%" outerRadius="90%">
                      <RadialBar dataKey="value" fill={getScoreColor(comparison.overall_score)} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute">
                    <div className="text-2xl font-bold" style={{ color: getScoreColor(comparison.overall_score) }}>
                      {Math.round(comparison.overall_score)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>FCR:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{comparison.actual.fcr.toFixed(2)}</span>
                      <span className="text-muted-foreground">/ {comparison.target.fcr_cible}</span>
                      {comparison.deviations.fcr_deviation > 0 ? (
                        <TrendingUp className="h-3 w-3 text-destructive" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Survie:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{comparison.actual.survival_rate.toFixed(1)}%</span>
                      <span className="text-muted-foreground">/ {comparison.target.taux_survie_cible}%</span>
                      {comparison.deviations.survival_deviation >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Poids:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{comparison.actual.average_weight.toFixed(2)}kg</span>
                      <span className="text-muted-foreground">/ {comparison.target.poids_moyen_cible}kg</span>
                      {comparison.deviations.weight_deviation >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Coût:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">€{comparison.actual.cost_per_kg.toFixed(2)}</span>
                      <span className="text-muted-foreground">/ €{comparison.target.cout_revient_kg_cible}</span>
                      {comparison.deviations.cost_deviation <= 0 ? (
                        <TrendingDown className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-destructive" />
                      )}
                    </div>
                  </div>
                </div>

                {comparison.overall_score < 70 && (
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <p className="text-xs text-destructive font-medium">
                      Performance en dessous des objectifs - Action recommandée
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Graphique de performance */}
      {performanceData.length > 0 && (
        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Scores de performance par cage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="cage" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }} 
                />
                <Bar 
                  dataKey="score" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {comparisons.length === 0 && (
        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardContent className="text-center py-12">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun objectif défini</h3>
            <p className="text-muted-foreground mb-4">
              Définissez des objectifs de performance pour vos cages afin de suivre leur progression.
            </p>
            <NewPerformanceTargetModal />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceAnalysis;