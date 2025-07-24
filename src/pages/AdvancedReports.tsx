import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAdvancedReports } from "@/hooks/useAdvancedReports";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Download, 
  Calendar, 
  Euro, 
  BarChart3, 
  Clock,
  Play,
  Settings,
  FileText,
  Target,
  AlertCircle,
  CheckCircle,
  Users
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  AreaChart
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const AdvancedReports = () => {
  const {
    financialReports,
    cycleAnalyses,
    automatedConfigs,
    loading,
    generateAutomatedReport,
    scheduleAutomatedReport,
    exportToExcel
  } = useAdvancedReports();
  
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("financial");

  const handleGenerateReport = async (configId: string) => {
    try {
      const report = await generateAutomatedReport(configId);
      const config = automatedConfigs.find(c => c.id === configId);
      
      if (report && config) {
        await scheduleAutomatedReport(config);
        toast({
          title: "Rapport généré",
          description: `${config.name} a été généré avec succès.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération du rapport.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async (type: 'financial' | 'cycles') => {
    try {
      await exportToExcel(type);
      toast({
        title: "Export réussi",
        description: `Les données ${type === 'financial' ? 'financières' : 'de cycles'} ont été exportées.`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données.",
        variant: "destructive",
      });
    }
  };

  const totalRevenue = financialReports.reduce((sum, report) => sum + report.revenue, 0);
  const totalProfit = financialReports.reduce((sum, report) => sum + report.profit, 0);
  const avgProfitMargin = financialReports.length > 0 
    ? financialReports.reduce((sum, report) => sum + report.profitMargin, 0) / financialReports.length 
    : 0;

  const activeCycles = cycleAnalyses.filter(c => c.status === 'active').length;
  const avgROI = cycleAnalyses.length > 0 
    ? cycleAnalyses.reduce((sum, cycle) => sum + cycle.roi, 0) / cycleAnalyses.length 
    : 0;

  const colors = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Rapports Automatisés Avancés
          </h1>
          <p className="text-white/80 text-lg">
            Analyses financières, cycles de production et automatisation
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => setSelectedTab('automation')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Configuration
          </Button>
        </div>
      </div>

      {/* KPIs Rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700">CA Total (12 mois)</CardTitle>
            <Euro className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocean-800">€{(totalRevenue / 1000).toFixed(1)}k</div>
            <p className="text-xs text-ocean-600">+{avgProfitMargin.toFixed(1)}% marge moyenne</p>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700">Profit Total</CardTitle>
            <TrendingUp className="h-5 w-5 text-aqua-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aqua-800">€{(totalProfit / 1000).toFixed(1)}k</div>
            <p className="text-xs text-aqua-600">Bénéfice net</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Cycles Actifs</CardTitle>
            <Target className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{activeCycles}</div>
            <p className="text-xs text-blue-600">En production</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">ROI Moyen</CardTitle>
            <BarChart3 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{avgROI.toFixed(1)}%</div>
            <p className="text-xs text-green-600">Retour sur investissement</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
          <TabsTrigger value="financial" className="text-white data-[state=active]:bg-white/20">
            <Euro className="mr-2 h-4 w-4" />
            Financier
          </TabsTrigger>
          <TabsTrigger value="cycles" className="text-white data-[state=active]:bg-white/20">
            <Target className="mr-2 h-4 w-4" />
            Cycles
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-white data-[state=active]:bg-white/20">
            <TrendingUp className="mr-2 h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="automation" className="text-white data-[state=active]:bg-white/20">
            <Settings className="mr-2 h-4 w-4" />
            Automatisation
          </TabsTrigger>
        </TabsList>

        {/* Onglet Financier */}
        <TabsContent value="financial" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Analyses Financières</h2>
            <Button 
              onClick={() => handleExport('financial')}
              className="bg-aqua-gradient hover:bg-aqua-600 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Évolution revenus/coûts/profit */}
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Évolution Financière (12 mois)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={financialReports}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="period" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px' 
                      }}
                      formatter={(value, name) => [
                        `€${Number(value).toLocaleString()}`, 
                        name === 'revenue' ? 'Revenus' : 
                        name === 'costs' ? 'Coûts' : 'Profit'
                      ]}
                    />
                    <Area type="monotone" dataKey="revenue" fill="#10b981" fillOpacity={0.3} />
                    <Bar dataKey="costs" fill="#ef4444" />
                    <Line type="monotone" dataKey="profit" stroke="#0ea5e9" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition des coûts moyenne */}
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Répartition Moyenne des Coûts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { 
                          name: 'Alimentation', 
                          value: financialReports.reduce((sum, r) => sum + r.costBreakdown.feeding, 0) / financialReports.length || 0,
                          color: colors[0]
                        },
                        { 
                          name: 'Personnel', 
                          value: financialReports.reduce((sum, r) => sum + r.costBreakdown.labor, 0) / financialReports.length || 0,
                          color: colors[1]
                        },
                        { 
                          name: 'Vétérinaire', 
                          value: financialReports.reduce((sum, r) => sum + r.costBreakdown.veterinary, 0) / financialReports.length || 0,
                          color: colors[2]
                        },
                        { 
                          name: 'Équipement', 
                          value: financialReports.reduce((sum, r) => sum + r.costBreakdown.equipment, 0) / financialReports.length || 0,
                          color: colors[3]
                        },
                        { 
                          name: 'Autres', 
                          value: financialReports.reduce((sum, r) => sum + r.costBreakdown.other, 0) / financialReports.length || 0,
                          color: colors[4]
                        }
                      ].filter(item => item.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {financialReports.length > 0 && [0,1,2,3,4].map((index) => (
                        <Cell key={`cell-${index}`} fill={colors[index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`€${Number(value).toLocaleString()}`, 'Coût moyen']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tableau détaillé */}
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>Détail Mensuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-2">Période</th>
                      <th className="text-right p-2">Revenus</th>
                      <th className="text-right p-2">Coûts</th>
                      <th className="text-right p-2">Profit</th>
                      <th className="text-right p-2">Marge %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financialReports.slice(-6).map((report, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-2 font-medium">{report.period}</td>
                        <td className="p-2 text-right">€{report.revenue.toLocaleString()}</td>
                        <td className="p-2 text-right text-red-600">€{report.costs.toLocaleString()}</td>
                        <td className="p-2 text-right font-bold text-green-600">€{report.profit.toLocaleString()}</td>
                        <td className="p-2 text-right">
                          <Badge variant={report.profitMargin > 20 ? "default" : report.profitMargin > 10 ? "secondary" : "destructive"}>
                            {report.profitMargin.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Cycles */}
        <TabsContent value="cycles" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Analyses par Cycle de Production</h2>
            <Button 
              onClick={() => handleExport('cycles')}
              className="bg-aqua-gradient hover:bg-aqua-600 text-white"
            >
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ROI par cycle */}
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  ROI par Cycle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cycleAnalyses.slice(-10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cageName" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, 'ROI']}
                      labelFormatter={(label) => `Cage: ${label}`}
                    />
                    <Bar 
                      dataKey="roi" 
                      fill="#0ea5e9"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance FCR vs Survie */}
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  FCR vs Taux de Survie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={cycleAnalyses.filter(c => c.fcr > 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cageName" stroke="#666" />
                    <YAxis yAxisId="fcr" orientation="left" stroke="#ef4444" />
                    <YAxis yAxisId="survival" orientation="right" stroke="#10b981" />
                    <Tooltip />
                    <Line 
                      yAxisId="fcr"
                      type="monotone" 
                      dataKey="fcr" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="FCR"
                    />
                    <Line 
                      yAxisId="survival"
                      type="monotone" 
                      dataKey="survivalRate" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Survie %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tableau des cycles */}
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle>Détail des Cycles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cycleAnalyses.slice(-5).map((cycle, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{cycle.cageName}</h4>
                        <p className="text-sm text-gray-600">
                          {cycle.startDate} - {cycle.endDate || 'En cours'}
                        </p>
                      </div>
                      <Badge 
                        variant={cycle.status === 'active' ? 'default' : 'secondary'}
                        className="flex items-center gap-1"
                      >
                        {cycle.status === 'active' ? (
                          <Play className="h-3 w-3" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {cycle.status === 'active' ? 'Actif' : 'Terminé'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-gray-600 text-xs mb-1">ROI</div>
                        <div className="font-bold text-lg">{cycle.roi.toFixed(1)}%</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-gray-600 text-xs mb-1">FCR</div>
                        <div className="font-bold text-lg">{cycle.fcr.toFixed(1)}</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-gray-600 text-xs mb-1">Survie</div>
                        <div className="font-bold text-lg">{cycle.survivalRate.toFixed(1)}%</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border">
                        <div className="text-gray-600 text-xs mb-1">Profit</div>
                        <div className="font-bold text-lg">€{cycle.profit.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Automatisation */}
        <TabsContent value="automation" className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Configuration des Rapports Automatisés</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {automatedConfigs.map((config, index) => (
              <Card key={config.id} className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {config.type}
                      </Badge>
                    </div>
                    <Switch 
                      checked={config.enabled}
                      disabled // Pour la démo
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Sections incluses:</div>
                    <div className="flex flex-wrap gap-1">
                      {config.sections.map((section, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {section}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Destinataires:</div>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-3 w-3" />
                      {config.recipients.length} personne(s)
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Prochaine génération:</div>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      {format(new Date(config.nextGeneration), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleGenerateReport(config.id)}
                      className="flex-1"
                    >
                      <Play className="mr-1 h-3 w-3" />
                      Générer
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="mr-1 h-3 w-3" />
                      Config
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedReports;