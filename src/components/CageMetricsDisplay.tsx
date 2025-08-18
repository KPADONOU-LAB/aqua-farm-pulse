import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { useOptimizedCageCalculations } from '@/hooks/useOptimizedCageCalculations';
import { useLanguage } from '@/contexts/LanguageContext';

interface CageMetricsDisplayProps {
  cage: any;
  onMetricsUpdate?: (cageId: string, metrics: any) => void;
}

export const CageMetricsDisplay: React.FC<CageMetricsDisplayProps> = ({ 
  cage, 
  onMetricsUpdate 
}) => {
  const { t } = useLanguage();
  const {
    loading,
    calculateSingleCage,
    formatCalculationResults,
    getPerformanceStatus
  } = useOptimizedCageCalculations();

  const formattedResults = formatCalculationResults(cage.id);
  const performance = getPerformanceStatus(cage.id);

  useEffect(() => {
    // Calculer les métriques pour cette cage au montage
    const calculateMetrics = async () => {
      const result = await calculateSingleCage(cage.id);
      if (result && onMetricsUpdate) {
        onMetricsUpdate(cage.id, result);
      }
    };

    calculateMetrics();
  }, [cage.id]);

  if (!formattedResults) {
    return (
      <div className="flex items-center justify-center py-4">
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
        <span className="text-sm text-muted-foreground">
          {loading ? 'Calcul en cours...' : 'Calcul des métriques'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Badge de performance */}
      <div className="flex justify-between items-center">
        <Badge 
          variant={performance.color === 'success' ? 'default' : 
                  performance.color === 'warning' ? 'secondary' :
                  performance.color === 'destructive' ? 'destructive' : 'outline'}
          className={`
            ${performance.color === 'success' ? 'bg-success text-success-foreground' : ''}
            ${performance.color === 'primary' ? 'bg-primary text-primary-foreground' : ''}
            ${performance.color === 'warning' ? 'bg-warning text-warning-foreground' : ''}
          `}
        >
          {performance.label}
        </Badge>
        {loading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">FCR</p>
          <p className="text-lg font-semibold">{formattedResults.fcr_formatted}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t('survival')}</p>
          <p className="text-lg font-semibold">{formattedResults.survival_rate_formatted}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t('average_weight')}</p>
          <p className="text-lg font-semibold">{(cage.poids_moyen || 0).toFixed(1)}kg</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t('estimated_revenue')}</p>
          <p className="text-lg font-semibold">{formattedResults.cost_per_kg_formatted}</p>
        </div>
      </div>

      {/* Détails supplémentaires */}
      <div className="rounded-lg bg-card/50 backdrop-blur-sm border border-border/20 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('remaining_fish')}</span>
          <span className="font-semibold">{formattedResults.remaining_fish_formatted}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('growth')}</span>
          <span className="font-semibold text-success">{formattedResults.growth_rate_formatted}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('introduction_date')}</span>
          <span className="font-semibold">
            {cage.date_introduction ? 
              new Date(cage.date_introduction).toLocaleDateString(t('language') === 'fr' ? 'fr-FR' : 'en-US') : 
              'N/A'
            }
          </span>
        </div>
      </div>
    </div>
  );
};