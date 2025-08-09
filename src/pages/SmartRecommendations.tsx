import { SmartRecommendationsPanel } from '@/components/SmartRecommendationsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Sparkles, Target, TrendingUp } from 'lucide-react';
const SmartRecommendations = () => {
  return <div className="min-h-screen p-6 animate-fade-in bg-neutral-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-400" />
          Recommandations Intelligentes
        </h1>
        <p className="text-muted-foreground text-lg">
          Conseils personnalisés basés sur l'IA pour optimiser vos performances aquacoles
        </p>
      </div>

      {/* Informations sur le système */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Comment fonctionnent les recommandations intelligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-400 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Analyse IA
              </h4>
              <p className="text-muted-foreground">
                Notre IA analyse en continu vos données de performance, qualité de l'eau, 
                alimentation et finances pour identifier les opportunités d'amélioration.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-green-400 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Recommandations ciblées
              </h4>
              <p className="text-muted-foreground">
                Chaque recommandation est personnalisée selon votre situation spécifique, 
                avec des actions concrètes et un impact estimé sur vos résultats.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-orange-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Optimisation continue
              </h4>
              <p className="text-muted-foreground">
                Le système apprend de vos actions et résultats pour affiner 
                ses recommandations et maximiser votre rentabilité.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panel principal */}
      <SmartRecommendationsPanel />
    </div>;
};
export default SmartRecommendations;