import { IntelligentAutomationPanel } from '@/components/automation/IntelligentAutomationPanel';
import { AdvancedAnalyticsPanel } from '@/components/analytics/AdvancedAnalyticsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Brain, Zap, BarChart3 } from 'lucide-react';

const IntelligentAutomation = () => {
  return (
    <div className="min-h-screen p-6 animate-fade-in bg-neutral-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Bot className="h-8 w-8 text-blue-400" />
          Automatisation Intelligente
        </h1>
        <p className="text-muted-foreground text-lg">
          IA avancée pour optimiser automatiquement vos opérations et maximiser vos profits
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="automation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automatisation IA
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analytics Avancés
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automation">
          <IntelligentAutomationPanel />
        </TabsContent>

        <TabsContent value="analytics">
          <AdvancedAnalyticsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentAutomation;