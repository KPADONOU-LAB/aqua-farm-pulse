import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Calendar,
  Sparkles,
  RefreshCw,
  BarChart,
  AlertCircle
} from 'lucide-react';
import { useAIPredictions } from '@/hooks/useAIPredictions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AIPredictionsPanelProps {
  cageId: string;
  cageName: string;
}

export const AIPredictionsPanel = ({ cageId, cageName }: AIPredictionsPanelProps) => {
  const { loading, lastPredictions, generatePredictions, generateRecommendations } = useAIPredictions();
  const [selectedPredictionTypes, setSelectedPredictionTypes] = useState([
    'poids_final', 'biomasse_totale', 'profit_estime', 'jours_recolte'
  ]);

  const handleGeneratePredictions = async () => {
    try {
      await generatePredictions(cageId, selectedPredictionTypes);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleGenerateRecommendations = async () => {
    try {
      await generateRecommendations(cageId);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'poids_final': return Target;
      case 'biomasse_totale': return BarChart;
      case 'profit_estime': return DollarSign;
      case 'jours_recolte': return Calendar;
      case 'fcr_final': return TrendingUp;
      default: return Brain;
    }
  };

  const getPredictionLabel = (type: string) => {
    const labels = {
      'poids_final': 'Poids final prédit',
      'biomasse_totale': 'Biomasse totale',
      'profit_estime': 'Profit estimé',
      'jours_recolte': 'Jours avant récolte',
      'fcr_final': 'FCR final estimé',
      'recommandations_alimentation': 'Recommandations alimentation',
      'optimisation_fcr': 'Optimisation FCR',
      'plan_recolte': 'Plan de récolte'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatPredictionValue = (type: string, value: number) => {
    switch (type) {
      case 'poids_final': return `${value.toFixed(2)} kg`;
      case 'biomasse_totale': return `${value.toFixed(1)} kg`;
      case 'profit_estime': return `${value.toFixed(0)} €`;
      case 'jours_recolte': return `${Math.round(value)} jours`;
      case 'fcr_final': return value.toFixed(2);
      default: return value.toString();
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          Prédictions IA - {cageName}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Prédictions avancées générées par intelligence artificielle
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contrôles */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleGeneratePredictions}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Générer prédictions IA
          </Button>
          
          <Button 
            onClick={handleGenerateRecommendations}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            <Brain className="h-4 w-4 mr-2" />
            Recommandations IA
          </Button>
        </div>

        <Separator />

        {/* Résultats des prédictions */}
        {lastPredictions.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Résultats des prédictions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lastPredictions.map((prediction, index) => {
                const IconComponent = getPredictionIcon(prediction.type);
                
                return (
                  <Card key={index} className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">
                            {getPredictionLabel(prediction.type)}
                          </span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getConfidenceColor(prediction.confidence)}`}
                        >
                          {prediction.confidence}% fiable
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-2xl font-bold text-primary">
                          {formatPredictionValue(prediction.type, prediction.value)}
                        </div>
                        
                        {prediction.horizon_days && (
                          <div className="text-sm text-muted-foreground">
                            Horizon: {prediction.horizon_days} jours
                          </div>
                        )}
                        
                        <Progress value={prediction.confidence} className="h-2" />
                        
                        {prediction.reasoning && (
                          <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                            {prediction.reasoning}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <Brain className="h-12 w-12 text-muted-foreground/50 mx-auto" />
            <p className="text-muted-foreground">
              Aucune prédiction générée pour le moment
            </p>
            <p className="text-sm text-muted-foreground/80">
              Cliquez sur "Générer prédictions IA" pour commencer l'analyse
            </p>
          </div>
        )}

        {/* Informations sur l'IA */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-400">À propos des prédictions IA</h4>
              <p className="text-sm text-blue-300/80">
                Ces prédictions sont générées par une IA avancée qui analyse vos données historiques, 
                les tendances de croissance, les paramètres de qualité de l'eau et les performances 
                passées pour estimer les résultats futurs.
              </p>
              <p className="text-xs text-blue-300/60">
                Utilisez ces prédictions comme guide pour vos décisions, 
                en complément de votre expertise professionnelle.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};