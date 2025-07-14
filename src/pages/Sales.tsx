
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, TrendingUp, Users, Euro, Fish } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const mockSales = [
  {
    id: 1,
    date: "2024-01-20",
    cage: "Cage #001",
    client: "Restaurant Le Neptune",
    espece: "Tilapia",
    quantite: 85.5,
    nombrePoissons: 95,
    prixUnitaire: 8.50,
    montantTotal: 726.75,
    statut: "livré"
  },
  {
    id: 2,
    date: "2024-01-19",
    cage: "Cage #002",
    client: "Marché Central",
    espece: "Bar",
    quantite: 42.3,
    nombrePoissons: 38,
    prixUnitaire: 12.00,
    montantTotal: 507.60,
    statut: "livré"
  },
  {
    id: 3,
    date: "2024-01-20",
    cage: "Cage #003",
    client: "Grossiste AquaFrais",
    espece: "Dorade",
    quantite: 125.0,
    nombrePoissons: 142,
    prixUnitaire: 9.75,
    montantTotal: 1218.75,
    statut: "confirmé"
  }
];

const monthlyRevenue = [
  { mois: 'Jan', revenus: 25400 },
  { mois: 'Fév', revenus: 28200 },
  { mois: 'Mar', revenus: 31800 },
  { mois: 'Avr', revenus: 29600 },
  { mois: 'Mai', revenus: 35200 },
  { mois: 'Jun', revenus: 32800 },
];

const weeklyQuantity = [
  { jour: 'Lun', quantite: 180 },
  { jour: 'Mar', quantite: 220 },
  { jour: 'Mer', quantite: 195 },
  { jour: 'Jeu', quantite: 165 },
  { jour: 'Ven', quantite: 285 },
  { jour: 'Sam', quantite: 240 },
  { jour: 'Dim', quantite: 125 },
];

const getStatutColor = (statut: string) => {
  switch (statut) {
    case 'livré': return 'bg-green-100 text-green-800 border-green-200';
    case 'confirmé': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'en_cours': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'annulé': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const Sales = () => {
  const revenusJour = mockSales
    .filter(sale => sale.date === "2024-01-20")
    .reduce((acc, sale) => acc + sale.montantTotal, 0);
  
  const quantiteJour = mockSales
    .filter(sale => sale.date === "2024-01-20")
    .reduce((acc, sale) => acc + sale.quantite, 0);
  
  const nombreClientsJour = new Set(
    mockSales
      .filter(sale => sale.date === "2024-01-20")
      .map(sale => sale.client)
  ).size;

  const prixMoyenKg = revenusJour / quantiteJour;

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Gestion des ventes
          </h1>
          <p className="text-white/80 text-lg">
            Suivi commercial et performance des ventes
          </p>
        </div>
        <Button className="bg-aqua-gradient hover:bg-aqua-600 text-white shadow-lg">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle vente
        </Button>
      </div>

      {/* KPIs du jour */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700">Revenus aujourd'hui</CardTitle>
            <Euro className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocean-800">€{revenusJour.toLocaleString()}</div>
            <p className="text-xs text-ocean-600">+18% vs hier</p>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700">Quantité vendue</CardTitle>
            <Fish className="h-5 w-5 text-aqua-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aqua-800">{quantiteJour.toFixed(1)}kg</div>
            <p className="text-xs text-aqua-600">275 poissons</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Clients servis</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{nombreClientsJour}</div>
            <p className="text-xs text-blue-600">Aujourd'hui</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Prix moyen/kg</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">€{prixMoyenKg.toFixed(2)}</div>
            <p className="text-xs text-green-600">+5% ce mois</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Évolution revenus mensuels (€)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="mois" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: 'none', 
                    borderRadius: '8px' 
                  }}
                  formatter={(value) => [`€${value.toLocaleString()}`, 'Revenus']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenus" 
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
              <Fish className="h-5 w-5" />
              Quantités vendues hebdomadaires (kg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyQuantity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="jour" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: 'none', 
                    borderRadius: '8px' 
                  }}
                  formatter={(value) => [`${value}kg`, 'Quantité']}
                />
                <Bar dataKey="quantite" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ventes récentes */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Ventes récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSales.map((sale) => (
              <div key={sale.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-ocean-gradient rounded-lg">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{sale.client}</h4>
                      <p className="text-white/70 text-sm">{sale.cage} • {sale.espece}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge className={getStatutColor(sale.statut)}>
                      {sale.statut}
                    </Badge>
                    <div className="text-right">
                      <div className="text-white font-semibold text-lg">€{sale.montantTotal.toLocaleString()}</div>
                      <div className="text-white/70 text-sm">
                        {new Date(sale.date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Quantité:</span>
                    <div className="text-white font-medium">{sale.quantite}kg</div>
                  </div>
                  <div>
                    <span className="text-white/70">Poissons:</span>
                    <div className="text-white font-medium">{sale.nombrePoissons}</div>
                  </div>
                  <div>
                    <span className="text-white/70">Prix/kg:</span>
                    <div className="text-white font-medium">€{sale.prixUnitaire}</div>
                  </div>
                  <div>
                    <span className="text-white/70">Poids moyen:</span>
                    <div className="text-white font-medium">
                      {(sale.quantite / sale.nombrePoissons).toFixed(2)}kg
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
