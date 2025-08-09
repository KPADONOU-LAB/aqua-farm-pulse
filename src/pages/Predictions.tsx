import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Euro, RefreshCw, Target, AlertCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useProductionPredictions } from "@/hooks/useProductionPredictions";
import { useCageMetrics } from "@/hooks/useCageMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
const Predictions = () => {
  const {
    predictions,
    loading,
    generatePredictions,
    getPredictionsByCage
  } = useProductionPredictions();
  const {
    cages
  } = useCageMetrics();
  const [selectedCage, setSelectedCage] = useState<string>('all');
  const handleGeneratePredictions = async () => {
    const productiveCages = cages.filter(cage => cage.statut === 'en_production');
    for (const cage of productiveCages) {
      await generatePredictions(cage.id);
    }
  };
  const filteredPredictions = selectedCage === 'all' ? predictions : getPredictionsByCage(selectedCage);
  const harvestPredictions = filteredPredictions.filter(p => p.type_prediction === 'jours_recolte');
  const biomassPredictions = filteredPredictions.filter(p => p.type_prediction === 'biomasse_finale');
  const profitPredictions = filteredPredictions.filter(p => p.type_prediction === 'profit_estime');
  const chartData = harvestPredictions.map(pred => ({
    cage: pred.cage?.nom || 'Cage',
    jours_restants: pred.valeur_predite,
    biomasse_prevue: biomassPredictions.find(b => b.cage_id === pred.cage_id)?.valeur_predite || 0,
    profit_estime: profitPredictions.find(p => p.cage_id === pred.cage_id)?.valeur_predite || 0
  }));
  const getPredictionStatus = (days: number) => {
    if (days <= 7) return {
      label: 'Récolte imminente',
      color: 'destructive'
    };
    if (days <= 30) return {
      label: 'Bientôt prêt',
      color: 'default'
    };
    if (days <= 60) return {
      label: 'En cours',
      color: 'secondary'
    };
    return {
      label: 'Début de cycle',
      color: 'outline'
    };
  };
  if (loading) {
    return <div className="min-h-screen p-6 animate-fade-in">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({
          length: 6
        }).map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>;
  }
  return <div className="min-h-screen p-6 animate-fade-in bg-neutral-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-black">
          Prédictions de Production
        </h1>
        <p className="text-lg text-black">
          Analyse prédictive et optimisation des cycles
        </p>
        <div className="flex items-center gap-2 mt-2 text-white/60">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm text-black">Prédictions basées sur l'IA</span>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex gap-4 mb-6">
        <Select value={selectedCage} onValueChange={setSelectedCage}>
          <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Toutes les cages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les cages</SelectItem>
            {cages.map(cage => <SelectItem key={cage.id} value={cage.id}>
                {cage.nom} - {cage.espece}
              </SelectItem>)}
          </SelectContent>
        </Select>
        
        <Button onClick={handleGeneratePredictions} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualiser les prédictions
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Récoltes imminentes</CardTitle>
            <Calendar className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {harvestPredictions.filter(p => p.valeur_predite <= 7).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Cages à récolter dans 7 jours
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production totale prévue</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {biomassPredictions.reduce((sum, p) => sum + p.valeur_predite, 0).toFixed(0)}kg
            </div>
            <p className="text-xs text-muted-foreground">
              Biomasse totale estimée
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit estimé</CardTitle>
            <Euro className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{profitPredictions.reduce((sum, p) => sum + p.valeur_predite, 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Bénéfice total prévu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prédictions par cage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {harvestPredictions.map(prediction => {
        const biomass = biomassPredictions.find(b => b.cage_id === prediction.cage_id);
        const profit = profitPredictions.find(p => p.cage_id === prediction.cage_id);
        const status = getPredictionStatus(prediction.valeur_predite);
        return <Card key={prediction.id} className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg hover:shadow-xl transition-all duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    {prediction.cage?.nom}
                  </CardTitle>
                  <Badge variant={status.color as any}>
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(prediction.valeur_predite)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Jours restants
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-background/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {biomass ? Math.round(biomass.valeur_predite) : 0}kg
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Biomasse prévue
                    </div>
                  </div>
                </div>

                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    €{profit ? Math.round(profit.valeur_predite) : 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Profit estimé
                  </div>
                </div>

                {prediction.valeur_predite <= 7 && <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">
                      Planifier la récolte immédiatement
                    </span>
                  </div>}
              </CardContent>
            </Card>;
      })}
      </div>

      {/* Graphiques de prédictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendrier de récolte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="cage" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }} />
                <Bar dataKey="jours_restants" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Prévisions de rentabilité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="cage" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }} />
                <Bar dataKey="profit_estime" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Predictions;