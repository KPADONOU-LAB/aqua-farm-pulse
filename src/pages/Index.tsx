
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fish, Droplets, TrendingUp, AlertTriangle, Package, ShoppingCart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const mockData = {
  cagesActives: 12,
  totalPoissons: 15420,
  alimentRestant: 2.5, // tonnes
  alertes: 3,
  croissanceMoyenne: 2.3, // kg
  ventesJour: 8.5 // tonnes
};

const croissanceData = [
  { mois: 'Jan', poids: 0.5 },
  { mois: 'Fév', poids: 0.8 },
  { mois: 'Mar', poids: 1.2 },
  { mois: 'Avr', poids: 1.7 },
  { mois: 'Mai', poids: 2.1 },
  { mois: 'Jun', poids: 2.3 },
];

const ventesData = [
  { jour: 'Lun', ventes: 12 },
  { jour: 'Mar', ventes: 8 },
  { jour: 'Mer', ventes: 15 },
  { jour: 'Jeu', ventes: 11 },
  { jour: 'Ven', ventes: 18 },
  { jour: 'Sam', ventes: 9 },
  { jour: 'Dim', ventes: 7 },
];

const Index = () => {
  return (
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Tableau de bord
        </h1>
        <p className="text-white/80 text-lg">
          Vue d'ensemble de votre ferme piscicole
        </p>
        <div className="flex items-center gap-2 mt-2 text-white/60">
          <div className="w-2 h-2 bg-aqua-400 rounded-full animate-pulse"></div>
          <span className="text-sm">Dernière mise à jour: il y a 2 minutes</span>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700">Cages actives</CardTitle>
            <Fish className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocean-800">{mockData.cagesActives}</div>
            <p className="text-xs text-ocean-600 mt-1">+2 ce mois</p>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700">Total poissons</CardTitle>
            <Fish className="h-5 w-5 text-aqua-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aqua-800">{mockData.totalPoissons.toLocaleString()}</div>
            <p className="text-xs text-aqua-600 mt-1">+5% ce mois</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Aliment restant</CardTitle>
            <Package className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{mockData.alimentRestant}T</div>
            <p className="text-xs text-amber-600 mt-1">7 jours restants</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Alertes</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{mockData.alertes}</div>
            <p className="text-xs text-red-600 mt-1">Attention requise</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Croissance moy.</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{mockData.croissanceMoyenne}kg</div>
            <p className="text-xs text-green-600 mt-1">+12% vs mois dernier</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Ventes aujourd'hui</CardTitle>
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{mockData.ventesJour}T</div>
            <p className="text-xs text-blue-600 mt-1">€12,450 revenus</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Croissance moyenne (6 mois)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={croissanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="mois" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: 'none', 
                    borderRadius: '8px' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="poids" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Ventes hebdomadaires (tonnes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="jour" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: 'none', 
                    borderRadius: '8px' 
                  }} 
                />
                <Bar dataKey="ventes" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertes récentes */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertes récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50/10 rounded-lg border border-red-200/20">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Stock d'aliment faible - Cage #7</p>
                <p className="text-white/70 text-sm">Niveau critique atteint, réapprovisionnement urgent requis</p>
                <p className="text-white/50 text-xs mt-1">Il y a 1 heure</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-amber-50/10 rounded-lg border border-amber-200/20">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Température eau élevée - Cage #3</p>
                <p className="text-white/70 text-sm">28.5°C détectée, surveillance renforcée recommandée</p>
                <p className="text-white/50 text-xs mt-1">Il y a 3 heures</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-blue-50/10 rounded-lg border border-blue-200/20">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Nouveau cycle démarré - Cage #12</p>
                <p className="text-white/70 text-sm">2,500 alevins introduits avec succès</p>
                <p className="text-white/50 text-xs mt-1">Il y a 6 heures</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
