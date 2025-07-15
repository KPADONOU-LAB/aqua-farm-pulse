
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
    case 'normal': return 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/25';
    case 'faible': return 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/25';
    case 'critique': return 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/25';
    default: return 'bg-gray-500 text-white border-gray-600 shadow-lg shadow-gray-500/25';
  }
};

const getCategoryColor = (categorie: string) => {
  switch (categorie) {
    case 'aliment': return 'bg-green-500 text-white';
    case 'veterinaire': return 'bg-blue-500 text-white';
    case 'materiel': return 'bg-purple-500 text-white';
    default: return 'bg-gray-500 text-white';
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="glass-effect border-2 border-white/20 shadow-2xl backdrop-blur-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                Consommation mensuelle
              </CardTitle>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white/90 text-sm font-medium">Par catégorie</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="bg-slate-800/30 rounded-xl p-4 border border-cyan-500/20 backdrop-blur-sm">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={consumptionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                  <XAxis 
                    dataKey="mois" 
                    stroke="#fff" 
                    fontSize={12}
                    fontWeight="500"
                    tick={{ fill: '#fff' }}
                  />
                  <YAxis 
                    stroke="#fff" 
                    fontSize={12}
                    fontWeight="500"
                    tick={{ fill: '#fff' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.2)', 
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: '500'
                    }} 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="aliment" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="veterinaire" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="materiel" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-2 border-white/20 shadow-2xl backdrop-blur-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              Répartition des stocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-800/30 rounded-xl p-4 border border-cyan-500/20 backdrop-blur-sm">
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
                      backgroundColor: 'rgba(30, 41, 59, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.2)', 
                      borderRadius: '12px',
                      color: '#fff'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des stocks */}
      <Card className="glass-effect border-2 border-cyan-400/30 shadow-2xl backdrop-blur-lg relative overflow-hidden">
        {/* Effet de lueur en arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"></div>
        
        <CardHeader className="relative z-10 pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-4 text-2xl font-bold">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-xl">
                  <Package className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 rounded-full animate-pulse shadow-lg"></div>
              </div>
              Inventaire détaillé
            </CardTitle>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-sm font-medium">Temps réel</span>
            </div>
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="space-y-6">
            {inventory.length === 0 ? (
              <div className="text-center py-12 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-900/20 rounded-2xl border border-white/10"></div>
                <div className="relative z-10">
                  <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Package className="h-8 w-8 text-cyan-400" />
                  </div>
                  <p className="text-white/80 text-lg font-medium">Aucun article en stock</p>
                  <p className="text-white/60 text-sm mt-2">Ajoutez des articles à votre inventaire</p>
                </div>
              </div>
            ) : (
              inventory.map((item, index) => {
                const IconComponent = getCategoryIcon(item.categorie);
                return (
                  <div key={item.id} className="group relative p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/20 hover:from-white/15 hover:to-white/10 transition-all duration-300 hover-scale shadow-xl backdrop-blur-sm overflow-hidden">
                    {/* Effet de lueur sur hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Indicateur de statut */}
                    <div className="absolute top-3 right-3">
                      <Badge className={`${getStatutColor(item.statut)} px-3 py-1 text-xs font-bold rounded-full shadow-lg`}>
                        {item.statut}
                      </Badge>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <div className="p-4 bg-gradient-to-br from-ocean-500 to-cyan-600 rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                              <IconComponent className="h-7 w-7 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2">
                              <Badge className={`${getCategoryColor(item.categorie)} text-xs px-2 py-1 rounded-full shadow-lg border-2 border-white/20`}>
                                {item.categorie}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-lg mb-1">{item.nom}</h4>
                            <p className="text-white/70 text-sm font-medium">{item.fournisseur || 'Non spécifié'}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl font-bold text-lg shadow-xl">
                            {item.stock_actuel} {item.unite}
                          </div>
                          <div className="text-white/70 text-sm mt-1 font-medium">
                            Min: {item.stock_min} {item.unite}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 p-3 rounded-xl border border-blue-400/30">
                          <span className="text-blue-300 text-sm font-semibold block">Prix unitaire</span>
                          <div className="text-white font-bold text-lg">€{item.prix_unitaire}</div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 rounded-xl border border-green-400/30">
                          <span className="text-green-300 text-sm font-semibold block">Valeur stock</span>
                          <div className="text-white font-bold text-lg">
                            €{(item.stock_actuel * item.prix_unitaire).toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 rounded-xl border border-purple-400/30">
                          <span className="text-purple-300 text-sm font-semibold block">Catégorie</span>
                          <div className="text-white font-bold text-lg capitalize">{item.categorie}</div>
                        </div>
                        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-3 rounded-xl border border-amber-400/30">
                          <span className="text-amber-300 text-sm font-semibold block">Expiration</span>
                          <div className="text-white font-bold text-lg">
                            {item.date_expiration 
                              ? new Date(item.date_expiration).toLocaleDateString('fr-FR')
                              : 'N/A'
                            }
                          </div>
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
