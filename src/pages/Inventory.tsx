import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, AlertTriangle, TrendingUp, Coffee, Pill, Wrench } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import NewInventoryModal from "@/components/modals/NewInventoryModal";
import { useInventoryData } from "@/hooks/useInventoryData";
import { useFarm } from "@/contexts/FarmContext";
import { Skeleton } from "@/components/ui/skeleton";
const getStatutColor = (statut: string) => {
  switch (statut) {
    case 'normal':
      return 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/25';
    case 'faible':
      return 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/25';
    case 'critique':
      return 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/25';
    default:
      return 'bg-gray-500 text-white border-gray-600 shadow-lg shadow-gray-500/25';
  }
};
const getCategoryColor = (categorie: string) => {
  switch (categorie) {
    case 'aliment':
      return 'bg-green-500 text-white';
    case 'veterinaire':
      return 'bg-blue-500 text-white';
    case 'materiel':
      return 'bg-purple-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};
const getCategoryIcon = (categorie: string) => {
  switch (categorie) {
    case 'aliment':
      return Coffee;
    case 'veterinaire':
      return Pill;
    case 'materiel':
      return Wrench;
    default:
      return Package;
  }
};
const Inventory = () => {
  const {
    inventory,
    consumptionData,
    categoryData,
    stats,
    loading
  } = useInventoryData();
  const {
    formatCurrency
  } = useFarm();
  if (loading) {
    return <div className="min-h-screen p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({
          length: 4
        }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>;
  }
  return <div className="container mx-auto p-6 space-y-8 animate-fade-in bg-neutral-50">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Gestion des stocks</h1>
            <p className="text-muted-foreground">
              Suivi des approvisionnements et inventaire
            </p>
          </div>
          <div className="flex gap-3">
            <NewInventoryModal />
          </div>
        </div>
      </div>

      {/* Indicateurs stocks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Stocks critiques</CardTitle>
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.stocksCritiques}</div>
            <p className="text-xs text-muted-foreground">Réappro urgent</p>
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

        <Card className="stat-card bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Valeur totale</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{formatCurrency(stats.valeurTotale / 1000)}k</div>
            <p className="text-xs text-muted-foreground">Stock en valeur</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="glass-effect border-2 border-emerald-400/40 shadow-2xl backdrop-blur-lg relative overflow-hidden group">
          {/* Effet de lueur animée */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/15 pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400 animate-pulse"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <CardHeader className="pb-4 relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-4 text-xl font-bold">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                </div>
                <div>
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Consommation mensuelle
                  </span>
                  <div className="text-white/70 text-sm font-normal">Évolution par catégorie</div>
                </div>
              </CardTitle>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-400/30 shadow-lg">
                <span className="text-emerald-300 text-sm font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  Live Data
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-2 relative z-10">
            <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/60 rounded-2xl p-6 border border-emerald-500/20 backdrop-blur-sm shadow-inner">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={consumptionData} margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5
              }}>
                  <defs>
                    <linearGradient id="alimentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="veterinaireGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#0284c7" stopOpacity={0.6} />
                    </linearGradient>
                    <linearGradient id="materielGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                  <XAxis dataKey="mois" stroke="#fff" fontSize={12} fontWeight="600" tick={{
                  fill: '#e5e7eb',
                  fontWeight: '600'
                }} />
                  <YAxis stroke="#fff" fontSize={12} fontWeight="600" tick={{
                  fill: '#e5e7eb',
                  fontWeight: '600'
                }} />
                  <Tooltip contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  backdropFilter: 'blur(16px)'
                }} cursor={{
                  fill: 'rgba(16, 185, 129, 0.1)'
                }} />
                  <Bar dataKey="aliment" fill="url(#alimentGradient)" radius={[6, 6, 0, 0]} stroke="rgba(16, 185, 129, 0.4)" strokeWidth={1} />
                  <Bar dataKey="veterinaire" fill="url(#veterinaireGradient)" radius={[6, 6, 0, 0]} stroke="rgba(14, 165, 233, 0.4)" strokeWidth={1} />
                  <Bar dataKey="materiel" fill="url(#materielGradient)" radius={[6, 6, 0, 0]} stroke="rgba(245, 158, 11, 0.4)" strokeWidth={1} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-2 border-purple-400/40 shadow-2xl backdrop-blur-lg relative overflow-hidden group">
          {/* Effet de lueur animée */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-blue-500/15 pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 animate-pulse"></div>
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="flex items-center gap-4 text-xl font-bold text-black">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-purple-500 via-pink-600 to-blue-600 rounded-xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
              </div>
              <div>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Répartition des stocks
                </span>
                <div className="text-white/70 text-sm font-normal">Distribution par catégorie</div>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative z-10">
            <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/60 rounded-2xl p-6 border border-purple-500/20 backdrop-blur-sm shadow-inner">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge> 
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={40} paddingAngle={3} label={({
                  name,
                  percent
                }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{
                  filter: 'url(#glow)'
                }}>
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '2px solid rgba(147, 51, 234, 0.3)',
                  borderRadius: '16px',
                  color: '#fff',
                  fontWeight: '600',
                  backdropFilter: 'blur(16px)'
                }} />
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
            <CardTitle className="flex items-center gap-4 text-2xl font-bold text-black">
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
              <span className="text-sm font-medium text-black">Temps réel</span>
            </div>
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="space-y-6">
            {inventory.length === 0 ? <div className="text-center py-12 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-900/20 rounded-2xl border border-white/10"></div>
                <div className="relative z-10">
                  <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Package className="h-8 w-8 text-cyan-400" />
                  </div>
                  <p className="text-white/80 text-lg font-medium">Aucun article en stock</p>
                  <p className="text-white/60 text-sm mt-2">Ajoutez des articles à votre inventaire</p>
                </div>
              </div> : inventory.map((item, index) => {
            const IconComponent = getCategoryIcon(item.categorie);
            const stockPercentage = item.stock_actuel / (item.stock_min * 3) * 100; // Assume 3x min is full
            const stockStatus = item.stock_actuel <= item.stock_min ? 'critique' : item.stock_actuel <= item.stock_min * 2 ? 'faible' : 'normal';
            return <div key={item.id} className="group relative p-8 bg-gradient-to-br from-white/15 to-white/5 rounded-3xl border-2 border-white/30 hover:from-white/20 hover:to-white/10 transition-all duration-500 hover-scale shadow-2xl backdrop-blur-lg overflow-hidden">
                    {/* Effet de particules animées */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-4 left-4 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                      <div className="absolute top-8 right-12 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                      <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                    
                    {/* Lueur de fond dynamique */}
                    <div className={`absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500 ${stockStatus === 'critique' ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20' : stockStatus === 'faible' ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20' : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20'}`}></div>
                    
                    {/* Barre de statut en haut */}
                    <div className={`absolute top-0 left-0 w-full h-2 ${stockStatus === 'critique' ? 'bg-gradient-to-r from-red-400 to-pink-500' : stockStatus === 'faible' ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'} animate-pulse`}></div>
                    
                    {/* Badge de priorité flottant */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <Badge className={`${getStatutColor(item.statut)} px-4 py-2 text-sm font-bold rounded-xl shadow-xl border-2 border-white/30 backdrop-blur-sm`}>
                        {item.statut.toUpperCase()}
                      </Badge>
                      <div className="text-xs font-bold text-white/90 text-center bg-black/30 px-2 py-1 rounded-lg backdrop-blur-sm">
                        #{index + 1}
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <div className="p-5 bg-gradient-to-br from-ocean-500 via-cyan-600 to-blue-700 rounded-3xl shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                              <IconComponent className="h-8 w-8 text-white drop-shadow-lg" />
                            </div>
                            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-3xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                            <div className="absolute -top-3 -right-3">
                              <Badge className={`${getCategoryColor(item.categorie)} text-xs px-3 py-1 rounded-full shadow-xl border-2 border-white/40 font-bold animate-pulse`}>
                                {item.categorie.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold text-2xl mb-2 transition-colors duration-300 text-black">
                              {item.nom}
                            </h4>
                            <p className="text-base font-medium flex items-center gap-2 text-black">
                              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                              {item.fournisseur || 'Fournisseur non spécifié'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-6 py-4 rounded-2xl font-bold text-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
                            {item.stock_actuel} {item.unite}
                          </div>
                          <div className="text-white/80 text-sm mt-2 font-semibold bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                            Minimum: {item.stock_min} {item.unite}
                          </div>
                          
                          {/* Barre de progression du stock */}
                          <div className="mt-3 w-32 h-3 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
                            <div className={`h-full transition-all duration-1000 ${stockStatus === 'critique' ? 'bg-gradient-to-r from-red-500 to-pink-500' : stockStatus === 'faible' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'} shadow-lg`} style={{
                        width: `${Math.min(stockPercentage, 100)}%`
                      }}></div>
                          </div>
                          <div className="text-xs text-white/70 mt-1 font-medium bg-slate-700">
                            {stockPercentage.toFixed(0)}% de capacité
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="group/card bg-gradient-to-br from-blue-600/30 to-indigo-600/30 p-5 rounded-2xl border-2 border-blue-400/40 hover:border-blue-300/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold text-slate-50">Prix unitaire</span>
                          </div>
                          <div className="text-white font-bold text-xl group-hover/card:text-blue-300 transition-colors">
                            {formatCurrency(item.prix_unitaire)}
                          </div>
                        </div>
                        
                        <div className="group/card bg-gradient-to-br from-emerald-600/30 to-teal-600/30 p-5 rounded-2xl border-2 border-emerald-400/40 hover:border-emerald-300/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold text-slate-50">Valeur stock</span>
                          </div>
                          <div className="text-white font-bold text-xl group-hover/card:text-emerald-300 transition-colors">
                            {formatCurrency(item.stock_actuel * item.prix_unitaire)}
                          </div>
                        </div>
                        
                        <div className="group/card bg-gradient-to-br from-purple-600/30 to-pink-600/30 p-5 rounded-2xl border-2 border-purple-400/40 hover:border-purple-300/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold text-slate-50">Catégorie</span>
                          </div>
                          <div className="text-white font-bold text-xl capitalize group-hover/card:text-purple-300 transition-colors">
                            {item.categorie}
                          </div>
                        </div>
                        
                        <div className="group/card bg-gradient-to-br from-amber-600/30 to-orange-600/30 p-5 rounded-2xl border-2 border-amber-400/40 hover:border-amber-300/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold text-slate-50">Expiration</span>
                          </div>
                          <div className="text-white font-bold text-xl group-hover/card:text-amber-300 transition-colors">
                            {item.date_expiration ? new Date(item.date_expiration).toLocaleDateString('fr-FR') : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>;
          })}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Inventory;