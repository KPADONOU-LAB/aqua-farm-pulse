import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOptimizedCages } from '@/hooks/useOptimizedData';
import { useCageHistory } from '@/hooks/useCageHistory';
import { Calculator, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFarm } from '@/contexts/FarmContext';

export function AutoFCRCalculatorOptimized() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { formatCurrency } = useFarm();
  const { cages, isLoading } = useOptimizedCages();
  const { calculateAutomaticFCR, loading } = useCageHistory();
  const [fcrResults, setFcrResults] = useState<Record<string, number>>({});
  const [calculating, setCalculating] = useState(false);

  const handleCalculateAllFCR = async () => {
    setCalculating(true);
    const newResults: Record<string, number> = {};
    
    const activeCages = cages.filter(c => c.statut === 'actif');
    
    // Calculate FCR for all active cages in parallel
    const fcrPromises = activeCages.map(async (cage) => {
      try {
        const fcr = await calculateAutomaticFCR(cage.id);
        if (fcr !== null) {
          newResults[cage.id] = fcr;
        }
      } catch (error) {
        console.error(`Erreur FCR pour cage ${cage.nom}:`, error);
      }
    });

    await Promise.allSettled(fcrPromises);
    
    setFcrResults(newResults);
    setCalculating(false);
    
    toast({
      title: t('config_saved'),
      description: `FCR calculé automatiquement pour ${Object.keys(newResults).length} cages`
    });
  };

  const getFCRStatus = (fcr: number) => {
    if (fcr < 1.5) return { 
      label: t('excellent_performance'), 
      variant: 'default' as const, 
      color: 'text-success' 
    };
    if (fcr < 2.0) return { 
      label: t('good_performance'), 
      variant: 'secondary' as const, 
      color: 'text-primary' 
    };
    if (fcr < 2.5) return { 
      label: t('average_performance'), 
      variant: 'outline' as const, 
      color: 'text-warning' 
    };
    return { 
      label: t('critical_performance'), 
      variant: 'destructive' as const, 
      color: 'text-destructive' 
    };
  };

  const calculatePotentialSavings = (cage: any, fcr: number) => {
    const currentBiomass = (cage.poids_moyen || 0) * (cage.nombre_poissons || 0);
    const currentFoodCost = currentBiomass * fcr * 1.2; // 1.2€/kg prix aliment estimé
    const optimizedFoodCost = currentBiomass * 1.8 * 1.2; // FCR optimisé à 1.8
    return Math.max(0, currentFoodCost - optimizedFoodCost);
  };

  useEffect(() => {
    if (cages.length > 0) {
      handleCalculateAllFCR();
    }
  }, [cages]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calcul Automatique FCR Optimisé
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleCalculateAllFCR} 
            disabled={calculating || isLoading || cages.length === 0}
            className="w-fit"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${calculating ? 'animate-spin' : ''}`} />
            {calculating ? 'Calcul en cours...' : 'Recalculer FCR'}
          </Button>
          {Object.keys(fcrResults).length > 0 && (
            <span className="text-sm text-muted-foreground">
              Dernière mise à jour: maintenant
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(fcrResults).length > 0 ? (
          <div className="space-y-3">
            {/* Résumé des économies potentielles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {Object.values(fcrResults).length}
                </p>
                <p className="text-sm text-muted-foreground">Cages analysées</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(
                    cages
                      .filter(cage => fcrResults[cage.id] !== undefined)
                      .reduce((total, cage) => total + calculatePotentialSavings(cage, fcrResults[cage.id]), 0)
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Économies potentielles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">
                  {(Object.values(fcrResults).reduce((sum, fcr) => sum + fcr, 0) / Object.values(fcrResults).length).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">FCR moyen</p>
              </div>
            </div>

            {/* Liste des cages avec FCR */}
            {cages
              .filter(cage => fcrResults[cage.id] !== undefined)
              .sort((a, b) => fcrResults[b.id] - fcrResults[a.id]) // Trier par FCR décroissant
              .map((cage) => {
                const fcr = fcrResults[cage.id];
                const status = getFCRStatus(fcr);
                const potentialSavings = calculatePotentialSavings(cage, fcr);
                
                return (
                  <div key={cage.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{cage.nom}</p>
                        <p className="text-sm text-muted-foreground">
                          {cage.espece} • {cage.nombre_poissons} poissons • {cage.poids_moyen}kg moy.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${status.color}`}>
                          FCR: {fcr.toFixed(2)}
                        </p>
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                      </div>
                      
                      {potentialSavings > 0 && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-success">
                            -{formatCurrency(potentialSavings)}
                          </p>
                          <p className="text-xs text-muted-foreground">économisable</p>
                        </div>
                      )}
                      
                      {fcr > 2.2 && (
                        <AlertTriangle className="h-5 w-5 text-warning" />
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Cliquez sur "Recalculer FCR" pour obtenir les résultats automatiques</p>
            <p className="text-sm mt-2">
              Le FCR est calculé automatiquement selon la formule : 
              <span className="font-mono bg-muted px-2 py-1 rounded ml-1">
                Nourriture totale / Gain de poids
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}