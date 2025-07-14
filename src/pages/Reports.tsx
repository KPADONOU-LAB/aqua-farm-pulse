
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, Calendar, TrendingUp, Fish, Euro, Droplets } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { HomeButton } from "@/components/HomeButton";

const performanceData = [
  { cage: 'Cage #001', fcr: 1.8, survie: 96.5, croissance: 2.3, revenus: 12450 },
  { cage: 'Cage #002', fcr: 2.1, survie: 94.2, croissance: 1.9, revenus: 8750 },
  { cage: 'Cage #003', fcr: 1.9, survie: 95.8, croissance: 2.1, revenus: 11200 },
  { cage: 'Cage #004', fcr: 0, survie: 0, croissance: 0, revenus: 0 },
];

const monthlyProfit = [
  { mois: 'Jan', revenus: 28400, couts: 18200, profit: 10200 },
  { mois: 'Fév', revenus: 31200, couts: 19800, profit: 11400 },
  { mois: 'Mar', revenus: 34800, couts: 21500, profit: 13300 },
  { mois: 'Avr', revenus: 29600, couts: 18900, profit: 10700 },
  { mois: 'Mai', revenus: 37200, couts: 23100, profit: 14100 },
  { mois: 'Jun', revenus: 35600, couts: 22400, profit: 13200 },
];

const costBreakdown = [
  { name: 'Alimentation', value: 58, color: '#10b981' },
  { name: 'Main d\'œuvre', value: 25, color: '#0ea5e9' },
  { name: 'Vétérinaire', value: 8, color: '#f59e0b' },
  { name: 'Équipement', value: 6, color: '#8b5cf6' },
  { name: 'Autres', value: 3, color: '#ef4444' },
];

const Reports = () => {
  const totalProfit = monthlyProfit.reduce((acc, month) => acc + month.profit, 0);
  const avgFCR = performanceData.filter(c => c.fcr > 0).reduce((acc, cage) => acc + cage.fcr, 0) / 
                 performanceData.filter(c => c.fcr > 0).length;
  const avgSurvival = performanceData.filter(c => c.survie > 0).reduce((acc, cage) => acc + cage.survie, 0) / 
                     performanceData.filter(c => c.survie > 0).length;
  const totalRevenue = monthlyProfit.reduce((acc, month) => acc + month.revenus, 0);

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Rapports & Performance
          </h1>
          <p className="text-white/80 text-lg">
            Analyses et indicateurs de performance de votre ferme
          </p>
        </div>
        <div className="flex gap-3">
          <HomeButton />
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Calendar className="mr-2 h-4 w-4" />
            Période
          </Button>
          <Button className="bg-aqua-gradient hover:bg-aqua-600 text-white shadow-lg">
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700">Profit total (6 mois)</CardTitle>
            <Euro className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocean-800">€{(totalProfit / 1000).toFixed(1)}k</div>
            <p className="text-xs text-ocean-600">+12% vs période précédente</p>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700">FCR moyen</CardTitle>
            <Fish className="h-5 w-5 text-aqua-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aqua-800">{avgFCR.toFixed(1)}</div>
            <p className="text-xs text-aqua-600">Efficacité alimentaire</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Taux de survie</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{avgSurvival.toFixed(1)}%</div>
            <p className="text-xs text-green-600">Performance sanitaire</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">CA total</CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">€{(totalRevenue / 1000).toFixed(1)}k</div>
            <p className="text-xs text-blue-600">Chiffre d'affaires</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Évolution profit mensuel (€)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyProfit}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="mois" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: 'none', 
                    borderRadius: '8px' 
                  }}
                  formatter={(value, name) => [`€${value.toLocaleString()}`, 
                    name === 'revenus' ? 'Revenus' : 
                    name === 'couts' ? 'Coûts' : 'Profit'
                  ]}
                />
                <Bar dataKey="revenus" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="couts" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="profit" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Répartition des coûts (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: 'none', 
                    borderRadius: '8px' 
                  }}
                  formatter={(value) => [`${value}%`, 'Pourcentage']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance par cage */}
      <Card className="glass-effect mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Fish className="h-5 w-5" />
            Performance par cage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.filter(cage => cage.fcr > 0).map((cage, index) => (
              <div key={cage.cage} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium text-lg">{cage.cage}</h4>
                  <Badge className="bg-green-100/10 text-green-300 border-green-200/20">
                    Performance: {cage.fcr <= 2 ? 'Excellente' : cage.fcr <= 2.5 ? 'Bonne' : 'À améliorer'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-white/70 text-sm mb-1">FCR</div>
                    <div className="text-white font-bold text-xl">{cage.fcr}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-white/70 text-sm mb-1">Survie</div>
                    <div className="text-white font-bold text-xl">{cage.survie}%</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-white/70 text-sm mb-1">Croissance</div>
                    <div className="text-white font-bold text-xl">{cage.croissance}kg</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-white/70 text-sm mb-1">Revenus</div>
                    <div className="text-white font-bold text-xl">€{cage.revenus.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommandations d'optimisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50/10 rounded-lg border border-green-200/20">
            <h4 className="text-white font-medium mb-2">💰 Optimisation financière</h4>
            <p className="text-white/80 text-sm">
              Réduire les coûts d'alimentation de 8% en optimisant les rations selon la température de l'eau
            </p>
          </div>
          
          <div className="p-4 bg-blue-50/10 rounded-lg border border-blue-200/20">
            <h4 className="text-white font-medium mb-2">🐟 Performance technique</h4>
            <p className="text-white/80 text-sm">
              Cage #002 montre un FCR élevé (2.1) - réviser le protocole d'alimentation et surveiller la qualité de l'eau
            </p>
          </div>
          
          <div className="p-4 bg-amber-50/10 rounded-lg border border-amber-200/20">
            <h4 className="text-white font-medium mb-2">📈 Croissance business</h4>
            <p className="text-white/80 text-sm">
              Potentiel d'augmentation de 15% des revenus en diversifiant vers des espèces premium (Bar, Dorade)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
