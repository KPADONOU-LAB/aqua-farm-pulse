import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCageHistory } from '@/hooks/useCageHistory';
import { useOptimizedCages } from '@/hooks/useOptimizedData';
import { Calculator, TrendingUp, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AutoFCRCalculator() {
  const { toast } = useToast();
  const { cages } = useOptimizedCages();
  const { calculateAutomaticFCR, loading } = useCageHistory();
  const [fcrResults, setFcrResults] = useState<Record<string, number>>({});

  const handleCalculateAllFCR = async () => {
    const newResults: Record<string, number> = {};
    
    for (const cage of cages.filter(c => c.statut === 'actif')) {
      try {
        const fcr = await calculateAutomaticFCR(cage.id);
        if (fcr !== null) {
          newResults[cage.id] = fcr;
        }
      } catch (error) {
        console.error(`Erreur FCR pour cage ${cage.nom}:`, error);
      }
    }
    
    setFcrResults(newResults);
    toast({
      title: 'Calculs terminés',
      description: `FCR calculé automatiquement pour ${Object.keys(newResults).length} cages`
    });
  };

  const getFCRStatus = (fcr: number) => {
    if (fcr < 1.5) return { label: 'Excellent', variant: 'default' as const, color: 'text-green-600' };
    if (fcr < 2.0) return { label: 'Bon', variant: 'secondary' as const, color: 'text-blue-600' };
    if (fcr < 2.5) return { label: 'Moyen', variant: 'outline' as const, color: 'text-orange-600' };
    return { label: 'À améliorer', variant: 'destructive' as const, color: 'text-red-600' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calcul Automatique FCR
        </CardTitle>
        <Button 
          onClick={handleCalculateAllFCR} 
          disabled={loading || cages.length === 0}
          className="w-fit"
        >
          {loading ? 'Calcul en cours...' : 'Calculer FCR pour toutes les cages'}
        </Button>
      </CardHeader>
      <CardContent>
        {Object.keys(fcrResults).length > 0 ? (
          <div className="space-y-3">
            {cages
              .filter(cage => fcrResults[cage.id] !== undefined)
              .map((cage) => {
                const fcr = fcrResults[cage.id];
                const status = getFCRStatus(fcr);
                
                return (
                  <div key={cage.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{cage.nom}</p>
                        <p className="text-sm text-muted-foreground">{cage.espece}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${status.color}`}>
                          {fcr.toFixed(2)}
                        </p>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </div>
                      
                      {fcr > 2.2 && (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Cliquez sur "Calculer FCR" pour obtenir les résultats automatiques</p>
            <p className="text-sm">Le FCR est calculé automatiquement selon la formule : Nourriture totale / Gain de poids</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}