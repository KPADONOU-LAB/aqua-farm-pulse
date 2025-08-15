import { ProfitabilityDashboard } from '@/components/profitability/ProfitabilityDashboard';
import { FCROptimizerPanel } from '@/components/optimization/FCROptimizerPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Target, DollarSign, BarChart3 } from 'lucide-react';

const ProfitabilityAnalysis = () => {
  return (
    <div className="min-h-screen p-6 animate-fade-in bg-neutral-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-green-400" />
          Analyse de Rentabilité
        </h1>
        <p className="text-muted-foreground text-lg">
          Maximisez vos profits avec des analyses avancées et des optimisations intelligentes
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard Rentabilité
          </TabsTrigger>
          <TabsTrigger value="fcr-optimizer" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Optimiseur FCR
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ProfitabilityDashboard />
        </TabsContent>

        <TabsContent value="fcr-optimizer">
          <FCROptimizerPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfitabilityAnalysis;