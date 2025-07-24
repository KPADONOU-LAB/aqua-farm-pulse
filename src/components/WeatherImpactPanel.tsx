import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Cloud, 
  Thermometer, 
  Droplets, 
  Wind,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { useWeatherIntegration } from '@/hooks/useWeatherIntegration';

export const WeatherImpactPanel = () => {
  const { 
    loading, 
    weatherData, 
    recommendations, 
    lastUpdate,
    getWeatherRecommendations,
    applyWeatherAdjustments,
    getWeatherImpactSummary 
  } = useWeatherIntegration();
  
  const [applyingAdjustments, setApplyingAdjustments] = useState<string | null>(null);

  const handleRefresh = async () => {
    try {
      await getWeatherRecommendations();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleApplyAdjustment = async (cageId: string, adjustmentFactor: number) => {
    setApplyingAdjustments(cageId);
    try {
      await applyWeatherAdjustments(cageId, adjustmentFactor);
    } catch (error) {
      console.error('Erreur lors de l\'ajustement:', error);
    } finally {
      setApplyingAdjustments(null);
    }
  };

  const getWeatherIcon = (description: string) => {
    if (description.includes('Pluie')) return Droplets;
    if (description.includes('Nuageux') || description.includes('Couvert')) return Cloud;
    return Cloud;
  };

  const getAdjustmentColor = (factor: number) => {
    if (factor > 1.05) return 'text-green-400';
    if (factor < 0.95) return 'text-orange-400';
    return 'text-muted-foreground';
  };

  const getAdjustmentIcon = (factor: number) => {
    if (factor > 1.0) return TrendingUp;
    if (factor < 1.0) return TrendingDown;
    return null;
  };

  const impact = getWeatherImpactSummary();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-sky-400" />
            Impact météorologique
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {lastUpdate && (
          <p className="text-xs text-muted-foreground">
            Dernière mise à jour: {new Date(lastUpdate).toLocaleString('fr-FR')}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Conditions météo actuelles */}
        {weatherData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg">
              <Thermometer className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">Température</p>
                <p className="font-semibold">{weatherData.temperature}°C</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-sky-500/10 to-sky-600/10 rounded-lg">
              <Droplets className="h-5 w-5 text-sky-400" />
              <div>
                <p className="text-xs text-muted-foreground">Humidité</p>
                <p className="font-semibold">{weatherData.humidity}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-lg">
              <Wind className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-muted-foreground">Vent</p>
                <p className="font-semibold">{weatherData.windSpeed} km/h</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg">
              {React.createElement(getWeatherIcon(weatherData.description), { 
                className: "h-5 w-5 text-purple-400" 
              })}
              <div>
                <p className="text-xs text-muted-foreground">Conditions</p>
                <p className="font-semibold text-xs">{weatherData.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Résumé de l'impact */}
        {impact && (
          <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-orange-600/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                <h3 className="font-medium">Résumé de l'impact</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Cages impactées</p>
                  <p className="font-semibold">{impact.impactedCages}/{impact.totalCages}</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">Ajustement moyen</p>
                  <div className="flex items-center gap-1">
                    <span className={`font-semibold ${getAdjustmentColor(impact.avgAdjustmentFactor)}`}>
                      {((impact.avgAdjustmentFactor - 1) * 100).toFixed(0)}%
                    </span>
                    {React.createElement(getAdjustmentIcon(impact.avgAdjustmentFactor) || TrendingUp, {
                      className: `h-4 w-4 ${getAdjustmentColor(impact.avgAdjustmentFactor)}`
                    })}
                  </div>
                </div>
                
                <div>
                  <p className="text-muted-foreground">Plus fort impact</p>
                  <p className="font-semibold text-xs">{impact.strongestImpact.cage_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommandations par cage */}
        <div className="space-y-3">
          <h3 className="font-medium">Recommandations par cage</h3>
          
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <Card key={rec.cage_id} className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{rec.cage_name}</h4>
                      <Badge variant={rec.adjustment_factor === 1.0 ? 'secondary' : 'default'}>
                        {rec.adjustment_factor === 1.0 ? 'Aucun ajustement' : 
                         `${((rec.adjustment_factor - 1) * 100).toFixed(0)}%`}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Plan actuel</p>
                        <p className="font-semibold">{rec.current_plan.toFixed(1)} kg/jour</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground">Quantité recommandée</p>
                        <p className={`font-semibold ${getAdjustmentColor(rec.adjustment_factor)}`}>
                          {rec.recommended_quantity.toFixed(1)} kg/jour
                        </p>
                      </div>
                    </div>
                    
                    {rec.weather_impact && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-1">Impact météo</p>
                        <p className="text-xs bg-background/50 p-2 rounded">{rec.weather_impact}</p>
                      </div>
                    )}
                    
                    {rec.reasoning && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-1">Justification</p>
                        <p className="text-xs bg-background/50 p-2 rounded">{rec.reasoning}</p>
                      </div>
                    )}
                    
                    {rec.adjustment_factor !== 1.0 && (
                      <Button
                        size="sm"
                        onClick={() => handleApplyAdjustment(rec.cage_id, rec.adjustment_factor)}
                        disabled={applyingAdjustments === rec.cage_id}
                        className="w-full"
                      >
                        {applyingAdjustments === rec.cage_id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        Appliquer l'ajustement
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Cloud className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucune recommandation météo disponible</p>
              <p className="text-xs">Cliquez sur rafraîchir pour obtenir les dernières données</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};