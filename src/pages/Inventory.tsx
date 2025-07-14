
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, AlertTriangle, TrendingUp, Coffee, Pill, Wrench } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import NewInventoryModal from "@/components/modals/NewInventoryModal";
import { useInventoryData } from "@/hooks/useInventoryData";
import { Skeleton } from "@/components/ui/skeleton";
import { HomeButton } from "@/components/HomeButton";

const getStatutColor = (statut: string) => {
  switch (statut) {
    case 'normal': return 'bg-green-100 text-green-800 border-green-200';
    case 'faible': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'critique': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getCategoryIcon = (categorie: string) => {
  switch (categorie) {
    case 'aliment': return Coffee;
    case 'veterinaire': return Pill;
    case 'materiel': return Wrench;
    default: return Package;
  }
};

const Inventory = () => {
  const { inventory, consumptionData, categoryData, stats, loading } = useInventoryData();

  if (loading) {
    return (
      <div className="min-h-screen p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Gestion des stocks
          </h1>
          <p className="text-white/80 text-lg">
            Suivi des approvisionnements et inventaire
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <HomeButton />
          <NewInventoryModal />
        </div>
      </div>

      {/* Indicateurs stocks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Stocks critiques</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.stocksCritiques}</div>
            <p className="text-xs text-red-600">Réappro urgent</p>
          </CardContent>
        </Card>

        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700">Stocks faibles</CardTitle>
            <TrendingUp className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocean-800">{stats.stocksFaibles}</div>
            <p className="text-xs text-ocean-600">À surveiller</p>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700">Articles total</CardTitle>
            <Package className="h-5 w-5 text-aqua-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aqua-800">{stats.articlesTotal}</div>
            <p className="text-xs text-aqua-600">En gestion</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Valeur totale</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">€{(stats.valeurTotale / 1000).toFixed(1)}k</div>
            <p className="text-xs text-blue-600">Stock en valeur</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Consommation mensuelle (tonnes/kg/unités)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={consumptionData}>
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
                <Bar dataKey="aliment" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="veterinaire" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                <Bar dataKey="materiel" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="h-5 w-5" />
              Répartition des stocks par catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: 'none', 
                    borderRadius: '8px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Liste des stocks */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="h-5 w-5" />
            Inventaire détaillé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/70">Aucun article en stock</p>
                <p className="text-white/50 text-sm mt-2">Ajoutez des articles à votre inventaire</p>
              </div>
            ) : (
              inventory.map((item) => {
                const IconComponent = getCategoryIcon(item.categorie);
                return (
                  <div key={item.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-ocean-gradient rounded-lg">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{item.nom}</h4>
                          <p className="text-white/70 text-sm">{item.fournisseur}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge className={getStatutColor(item.statut)}>
                          {item.statut}
                        </Badge>
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            {item.stock_actuel} {item.unite}
                          </div>
                          <div className="text-white/70 text-sm">
                            Min: {item.stock_min} {item.unite}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-white/70">Prix unitaire:</span>
                        <div className="text-white font-medium">€{item.prix_unitaire}</div>
                      </div>
                      <div>
                        <span className="text-white/70">Valeur stock:</span>
                        <div className="text-white font-medium">
                          €{(item.stock_actuel * item.prix_unitaire).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-white/70">Catégorie:</span>
                        <div className="text-white font-medium capitalize">{item.categorie}</div>
                      </div>
                      <div>
                        <span className="text-white/70">Expiration:</span>
                        <div className="text-white font-medium">
                          {item.date_expiration 
                            ? new Date(item.date_expiration).toLocaleDateString('fr-FR')
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
