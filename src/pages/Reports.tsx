import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BarChart3, Download, Calendar as CalendarIcon, TrendingUp, Fish, Euro, Droplets, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useFarm } from "@/contexts/FarmContext";
import { useReportsData } from "@/hooks/useReportsData";
import type { DateRange } from "react-day-picker";
const Reports = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1),
    to: new Date()
  });
  const {
    toast
  } = useToast();
  const {
    formatCurrency,
    translate
  } = useFarm();

  // Utiliser le hook pour récupérer les vraies données
  const {
    cagePerformanceData,
    monthlyFinancialData,
    costBreakdownData,
    loading,
    error,
    kpis
  } = useReportsData();
  // Fonction d'export PDF mise à jour avec les vraies données
  const handleExportPDF = () => {
    if (loading || cagePerformanceData.length === 0) {
      toast({
        title: "Erreur",
        description: "Les données ne sont pas encore chargées ou aucune cage trouvée.",
        variant: "destructive"
      });
      return;
    }
    // Créer le contenu HTML pour le PDF
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <html>
        <head>
          <title>Rapport de Performance - ${format(new Date(), 'dd/MM/yyyy', {
      locale: fr
    })}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
            .kpi-card { border: 1px solid #ccc; padding: 15px; text-align: center; }
            .performance-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .performance-table th, .performance-table td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            .performance-table th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rapport de Performance</h1>
            <p>Période: ${dateRange?.from ? format(dateRange.from, 'dd/MM/yyyy', {
      locale: fr
    }) : 'N/A'} - ${dateRange?.to ? format(dateRange.to, 'dd/MM/yyyy', {
      locale: fr
    }) : 'N/A'}</p>
            <p>Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm', {
      locale: fr
    })}</p>
          </div>
          
          <h2>Indicateurs Clés</h2>
           <div class="kpi-grid">
             <div class="kpi-card">
               <h3>Profit Total</h3>
               <p>${formatCurrency(kpis.totalProfit)}</p>
             </div>
             <div class="kpi-card">
               <h3>FCR Moyen</h3>
               <p>${kpis.avgFCR.toFixed(1)}</p>
             </div>
             <div class="kpi-card">
               <h3>Taux de Survie</h3>
               <p>${kpis.avgSurvival.toFixed(1)}%</p>
             </div>
             <div class="kpi-card">
               <h3>CA Total</h3>
               <p>${formatCurrency(kpis.totalRevenue)}</p>
             </div>
           </div>
          
          <h2>Performance par Cage</h2>
          <table class="performance-table">
            <thead>
              <tr>
                <th>Cage</th>
                <th>FCR</th>
                <th>Taux de Survie (%)</th>
                <th>Croissance (kg)</th>
                <th>Revenus (€)</th>
              </tr>
            </thead>
             <tbody>
               ${cagePerformanceData.filter(cage => cage.fcr > 0).map(cage => `
                 <tr>
                   <td>${cage.cage}</td>
                   <td>${cage.fcr}</td>
                   <td>${cage.survie.toFixed(1)}%</td>
                   <td>${cage.croissance}</td>
                   <td>${formatCurrency(cage.revenus)}</td>
                 </tr>
               `).join('')}
             </tbody>
          </table>
        </body>
      </html>
    `;

    // Ouvrir une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      toast({
        title: "Export PDF",
        description: "Le rapport a été ouvert dans une nouvelle fenêtre pour impression/sauvegarde PDF."
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir la fenêtre d'impression. Vérifiez les paramètres de votre navigateur.",
        variant: "destructive"
      });
    }
  };

  // Afficher un état de chargement
  if (loading) {
    return <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-lg">Chargement des données des rapports...</p>
        </div>
      </div>;
  }

  // Afficher une erreur si nécessaire
  if (error) {
    return <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erreur</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen p-4 sm:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-black">
            {translate('reports')}
          </h1>
          <p className="text-base sm:text-lg text-black">
            {translate('reports_description') || 'Analyses et indicateurs de performance de votre ferme'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto bg-white/10 border-white/20 hover:bg-white/20 text-black">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from && dateRange?.to ? <>
                    {format(dateRange.from, "dd/MM/yy", {
                  locale: fr
                })} - {format(dateRange.to, "dd/MM/yy", {
                  locale: fr
                })}
                  </> : "Période"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar initialFocus mode="range" defaultMonth={dateRange.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} className="pointer-events-auto" locale={fr} />
            </PopoverContent>
          </Popover>
          <Button className="w-full sm:w-auto bg-aqua-gradient hover:bg-aqua-600 text-white shadow-lg" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700">Profit total (6 mois)</CardTitle>
            <Euro className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocean-800 bg-sky-100">
              {formatCurrency(kpis.totalProfit)}
            </div>
            <p className="text-xs text-ocean-600">
              {kpis.activeCagesCount} cages actives sur {kpis.totalCagesCount}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700">FCR moyen</CardTitle>
            <Fish className="h-5 w-5 text-aqua-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aqua-800">{kpis.avgFCR.toFixed(1)}</div>
            <p className="text-xs text-aqua-600">Efficacité alimentaire moyenne</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Taux de survie</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{kpis.avgSurvival.toFixed(1)}%</div>
            <p className="text-xs text-green-600">Performance sanitaire moyenne</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">CA total</CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{formatCurrency(kpis.totalRevenue)}</div>
            <p className="text-xs text-blue-600">Chiffre d'affaires total</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-ocean-500 to-aqua-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Évolution profit mensuel
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-slate-300">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyFinancialData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="mois" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: 'none',
                borderRadius: '8px'
              }} formatter={(value, name) => [formatCurrency(Number(value)), name === 'revenus' ? 'Revenus' : name === 'couts' ? 'Coûts' : 'Profit']} />
                <Bar dataKey="revenus" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="couts" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="profit" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-ocean-500 to-aqua-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Répartition des coûts (%)
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-slate-300">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={costBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({
                name,
                percent
              }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {costBreakdownData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: 'none',
                borderRadius: '8px'
              }} formatter={value => [`${value}%`, 'Pourcentage']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance par cage */}
      <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl mb-8">
        <CardHeader className="bg-gradient-to-r from-ocean-500 to-aqua-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <Fish className="h-5 w-5" />
            Performance par cage
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {cagePerformanceData.length === 0 ? <div className="text-center py-8">
                <p className="text-muted-foreground">Aucune cage active trouvée</p>
              </div> : cagePerformanceData.filter(cage => cage.fcr > 0).map((cage, index) => <div key={cage.cage} className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-gray-800 font-bold text-lg">{cage.cage}</h4>
                    <Badge className={`${cage.fcr <= 2 ? 'bg-green-100 text-green-800 border-green-200' : cage.fcr <= 2.5 ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-amber-100 text-amber-800 border-amber-200'} font-medium`}>
                      Performance: {cage.fcr <= 2 ? 'Excellente' : cage.fcr <= 2.5 ? 'Bonne' : 'À améliorer'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="text-gray-600 text-sm font-medium mb-1">FCR</div>
                      <div className="text-gray-900 font-bold text-2xl">{cage.fcr}</div>
                    </div>
                    
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="text-gray-600 text-sm font-medium mb-1">Survie</div>
                      <div className="text-gray-900 font-bold text-2xl">{cage.survie.toFixed(1)}%</div>
                    </div>
                    
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="text-gray-600 text-sm font-medium mb-1">Poids moy.</div>
                      <div className="text-gray-900 font-bold text-2xl">{cage.croissance.toFixed(1)}kg</div>
                    </div>
                    
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="text-gray-600 text-sm font-medium mb-1">Revenus</div>
                      <div className="text-gray-900 font-bold text-2xl">{formatCurrency(cage.revenus)}</div>
                    </div>
                  </div>
                </div>)}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-ocean-500 to-aqua-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommandations d'optimisation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-green-800 font-medium mb-2">💰 Optimisation financière</h4>
            <p className="text-green-700 text-sm">
              Réduire les coûts d'alimentation de 8% en optimisant les rations selon la température de l'eau
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-blue-800 font-medium mb-2">🐟 Performance technique</h4>
            <p className="text-blue-700 text-sm">
              Cage #002 montre un FCR élevé (2.1) - réviser le protocole d'alimentation et surveiller la qualité de l'eau
            </p>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="text-amber-800 font-medium mb-2">📈 Croissance business</h4>
            <p className="text-amber-700 text-sm">
              Potentiel d'augmentation de 15% des revenus en diversifiant vers des espèces premium (Bar, Dorade)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Reports;