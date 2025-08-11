import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useFinanceData } from "@/hooks/useFinanceData";
import { NewFinancialEntryModal } from "@/components/modals/NewFinancialEntryModal";
import { BudgetManagementModal } from "@/components/modals/BudgetManagementModal";
import { PermissionWrapper } from "@/components/PermissionWrapper";
import { TrendingUp, TrendingDown, DollarSign, Target, Calculator, PieChart, BarChart3, AlertTriangle } from "lucide-react";
const Finance = () => {
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const {
    financialData,
    budgets,
    kpis,
    loading,
    refreshData
  } = useFinanceData();
  const handleNewEntry = () => {
    setShowNewEntryModal(false);
    refreshData();
  };
  const handleBudgetUpdate = () => {
    setShowBudgetModal(false);
    refreshData();
  };
  if (loading) {
    return <div className="container mx-auto p-6 space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>)}
        </div>
      </div>;
  }
  return (
    <PermissionWrapper requiredPermission="viewFinancials">
      <div className="container mx-auto p-6 space-y-8 animate-fade-in bg-neutral-50">
        {/* Header Section */}
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Gestion Financière</h1>
            <p className="text-muted-foreground">
              Optimisez la rentabilité de votre ferme aquacole
            </p>
          </div>
          <div className="flex gap-3">
            <PermissionWrapper requiredPermission="edit" showMessage={false}>
              <Button onClick={() => setShowBudgetModal(true)} variant="outline" size="sm">
                <Target className="w-4 h-4 mr-2" />
                Gérer Budget
              </Button>
              <Button onClick={() => setShowNewEntryModal(true)}>
                <DollarSign className="w-4 h-4 mr-2" />
                Nouvelle Transaction
              </Button>
            </PermissionWrapper>
          </div>
        </div>
      </div>

      {/* Statistiques Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'Affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {kpis.totalRevenue.toLocaleString('fr-FR')} €
            </div>
            <div className="flex items-center justify-center mt-2">
              {kpis.revenueGrowth >= 0 ? <TrendingUp className="w-4 h-4 text-green-600 mr-1" /> : <TrendingDown className="w-4 h-4 text-red-600 mr-1" />}
              <span className={`text-sm ${kpis.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {kpis.revenueGrowth.toFixed(1)}% vs mois dernier
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coûts Totaux</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {kpis.totalCosts.toLocaleString('fr-FR')} €
            </div>
            <div className="flex items-center justify-center mt-2">
              {kpis.costGrowth <= 0 ? <TrendingDown className="w-4 h-4 text-green-600 mr-1" /> : <TrendingUp className="w-4 h-4 text-red-600 mr-1" />}
              <span className={`text-sm ${kpis.costGrowth <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(kpis.costGrowth).toFixed(1)}% vs mois dernier
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marge Bénéficiaire</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {kpis.profitMargin.toFixed(1)}%
            </div>
            <Progress value={kpis.profitMargin} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Objectif: 25%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Mensuel</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {kpis.roi.toFixed(1)}%
            </div>
            <div className="flex items-center justify-center mt-2">
              <Badge variant={kpis.roi >= 15 ? "default" : kpis.roi >= 10 ? "secondary" : "destructive"}>
                {kpis.roi >= 15 ? "Excellent" : kpis.roi >= 10 ? "Correct" : "À améliorer"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alertes">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dernières Transactions</CardTitle>
              <CardDescription>
                Historique des revenus et dépenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.slice(0, 10).map(transaction => <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${transaction.type_transaction === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.categorie} • {new Date(transaction.date_transaction).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold ${transaction.type_transaction === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type_transaction === 'income' ? '+' : '-'}
                      {transaction.montant.toLocaleString('fr-FR')} €
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map(budget => <Card key={budget.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {budget.nom_budget}
                    <Badge variant={budget.statut === 'actif' ? 'default' : 'secondary'}>
                      {budget.statut}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {new Date(budget.periode_debut).toLocaleDateString('fr-FR')} - {' '}
                    {new Date(budget.periode_fin).toLocaleDateString('fr-FR')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Aliments</span>
                      <span>{budget.reel_aliments}/{budget.budget_aliments}€</span>
                    </div>
                    <Progress value={budget.reel_aliments / budget.budget_aliments * 100} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Médicaments</span>
                      <span>{budget.reel_medicaments}/{budget.budget_medicaments}€</span>
                    </div>
                    <Progress value={budget.reel_medicaments / budget.budget_medicaments * 100} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Équipements</span>
                      <span>{budget.reel_equipements}/{budget.budget_equipements}€</span>
                    </div>
                    <Progress value={budget.reel_equipements / budget.budget_equipements * 100} />
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Coûts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alimentation</span>
                    <span className="font-medium">{kpis.costBreakdown.food}%</span>
                  </div>
                  <Progress value={kpis.costBreakdown.food} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Médicaments</span>
                    <span className="font-medium">{kpis.costBreakdown.medicine}%</span>
                  </div>
                  <Progress value={kpis.costBreakdown.medicine} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Équipements</span>
                    <span className="font-medium">{kpis.costBreakdown.equipment}%</span>
                  </div>
                  <Progress value={kpis.costBreakdown.equipment} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Personnel</span>
                    <span className="font-medium">{kpis.costBreakdown.labor}%</span>
                  </div>
                  <Progress value={kpis.costBreakdown.labor} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendances de Rentabilité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      +{kpis.profitabilityTrend.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Amélioration sur 3 mois
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">
                        {kpis.averageMarginPerCage.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">Marge par cage</p>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {kpis.bestPerformingCage || 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground">Meilleure cage</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alertes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Alertes Financières
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium">Budget alimentation dépassé</span>
                  </div>
                  <Badge variant="destructive">Critique</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium">Marge faible cage C-003</span>
                  </div>
                  <Badge variant="secondary">Attention</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">Opportunité d'optimisation FCR</span>
                  </div>
                  <Badge variant="outline">Info</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <NewFinancialEntryModal open={showNewEntryModal} onOpenChange={setShowNewEntryModal} onSuccess={handleNewEntry} />
      
      <BudgetManagementModal open={showBudgetModal} onOpenChange={setShowBudgetModal} onSuccess={handleBudgetUpdate} />
      </div>
    </PermissionWrapper>
  );
};
export default Finance;