import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Cloud, 
  BarChart3, 
  Sparkles,
  TrendingUp,
  Settings,
  Info
} from 'lucide-react';
import { AIPredictionsPanel } from '@/components/AIPredictionsPanel';
import { WeatherImpactPanel } from '@/components/WeatherImpactPanel';
import { ComparativeAnalysisPanel } from '@/components/ComparativeAnalysisPanel';
import { useCageMetrics } from '@/hooks/useCageMetrics';

const AdvancedAnalytics = () => {
  const [selectedCage, setSelectedCage] = useState<string>('');
  const { cages } = useCageMetrics();

  const activeCages = cages.filter(cage => cage.statut === 'en_production');

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-400" />
          Analytics Avancées
        </h1>
        <p className="text-white/80 text-lg">
          IA, météo, comparaisons et prédictions avancées pour optimiser vos performances
        </p>
      </div>

      {/* Sélecteur de cage pour l'IA */}
      {activeCages.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <label className="text-sm font-medium">Sélectionner une cage pour l'analyse IA:</label>
                <Select value={selectedCage} onValueChange={setSelectedCage}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Choisir une cage active..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCages.map((cage) => (
                      <SelectItem key={cage.id} value={cage.id}>
                        {cage.nom} ({cage.espece}) - {cage.nombre_poissons} poissons
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onglets principaux */}
      <Tabs defaultValue="ai-predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai-predictions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Prédictions IA
          </TabsTrigger>
          <TabsTrigger value="weather-impact" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Impact Météo
          </TabsTrigger>
          <TabsTrigger value="comparative-analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analyse Comparative
          </TabsTrigger>
        </TabsList>

        {/* Prédictions IA */}
        <TabsContent value="ai-predictions" className="space-y-6">
          {selectedCage ? (
            <AIPredictionsPanel 
              cageId={selectedCage} 
              cageName={activeCages.find(c => c.id === selectedCage)?.nom || 'Cage sélectionnée'}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sélectionnez une cage</h3>
                <p className="text-muted-foreground">
                  Choisissez une cage active dans le menu déroulant ci-dessus pour commencer l'analyse IA.
                </p>
                {activeCages.length === 0 && (
                  <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <p className="text-orange-400 text-sm">
                      Aucune cage active trouvée. Créez et activez des cages dans la section "Cages" pour utiliser cette fonctionnalité.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Impact météo */}
        <TabsContent value="weather-impact" className="space-y-6">
          <WeatherImpactPanel />
        </TabsContent>

        {/* Analyse comparative */}
        <TabsContent value="comparative-analysis" className="space-y-6">
          <ComparativeAnalysisPanel />
        </TabsContent>
      </Tabs>

      {/* Information sur les fonctionnalités */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-400" />
            À propos des Analytics Avancées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-purple-400 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Prédictions IA
              </h4>
              <p className="text-muted-foreground">
                Intelligence artificielle avancée qui analyse vos données historiques pour prédire 
                les performances futures, optimiser les récoltes et estimer les profits.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sky-400 flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Impact Météo
              </h4>
              <p className="text-muted-foreground">
                Ajustements automatiques des plans d'alimentation basés sur les conditions 
                météorologiques actuelles et prévisionnelles pour optimiser la croissance.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-blue-400 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analyse Comparative
              </h4>
              <p className="text-muted-foreground">
                Benchmarking automatique entre vos cages pour identifier les meilleures 
                pratiques et les axes d'amélioration prioritaires.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;