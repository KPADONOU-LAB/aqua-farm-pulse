
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, Plus, Clock, TrendingUp, Fish, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import NewFeedingModal from "@/components/modals/NewFeedingModal";
import { useFeedingData } from "@/hooks/useFeedingData";
import { Skeleton } from "@/components/ui/skeleton";


const getAppetitColor = (appetit: string) => {
  switch (appetit) {
    case 'excellent': return 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/25';
    case 'bon': return 'bg-blue-500 text-white border-blue-600 shadow-lg shadow-blue-500/25';
    case 'moyen': return 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/25';
    case 'faible': return 'bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/25';
    default: return 'bg-gray-500 text-white border-gray-600 shadow-lg shadow-gray-500/25';
  }
};

const getAlimentTypeColor = (type: string) => {
  if (type.includes('standard')) return 'bg-slate-500 text-white';
  if (type.includes('croissance')) return 'bg-purple-500 text-white';
  if (type.includes('finition')) return 'bg-indigo-500 text-white';
  return 'bg-gray-500 text-white';
};

const Feeding = () => {
  const { feedingSessions, weeklyData, stats, loading } = useFeedingData();

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
    <div className="min-h-screen p-6 animate-fade-in" style={{backgroundColor: '#C8E9F6'}}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-black mb-2">
            Suivi alimentaire
          </h1>
          <p className="text-black/80 text-lg">
            Gestion et suivi des sessions d'alimentation
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <NewFeedingModal />
        </div>
      </div>

      {/* Stats du jour */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700">Sessions aujourd'hui</CardTitle>
            <Coffee className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocean-800">{stats.sessionsToday}</div>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700">Quantité totale</CardTitle>
            <TrendingUp className="h-5 w-5 text-aqua-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aqua-800">{stats.quantiteTotal.toFixed(1)}kg</div>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Prochaine session</CardTitle>
            <Clock className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.prochainSession}</div>
            <p className="text-xs text-gray-600">Cage #004</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Alertes</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.alertes}</div>
            <p className="text-xs text-red-600">Appétit faible</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique consommation hebdomadaire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="glass-effect border-2 border-white/20 shadow-2xl backdrop-blur-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-3 text-xl font-bold">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                Consommation hebdomadaire (kg)
              </CardTitle>
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white/90 text-sm font-medium">Cette semaine</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="bg-slate-800/30 rounded-xl p-4 border border-cyan-500/20 backdrop-blur-sm">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                  <XAxis 
                    dataKey="jour" 
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
                  <Bar 
                    dataKey="quantite" 
                    fill="url(#greenGradient)" 
                    radius={[6, 6, 0, 0]}
                    stroke="rgba(16, 185, 129, 0.3)"
                    strokeWidth={1}
                  />
                  <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-2 border-white/20 shadow-2xl backdrop-blur-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-lg">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              Recommandations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="group p-5 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-xl border border-emerald-400/30 hover:from-emerald-500/30 hover:to-teal-600/30 transition-all duration-300 hover-scale backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-white text-lg">💡</span>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2 text-lg">Optimisation FCR</h4>
                  <p className="text-white/90 text-sm font-medium bg-slate-800/40 p-3 rounded-lg border border-emerald-500/20">
                    Réduire la quantité de 5% pour les cages avec FCR &gt; 2.0
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group p-5 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-xl border border-blue-400/30 hover:from-blue-500/30 hover:to-indigo-600/30 transition-all duration-300 hover-scale backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-white text-lg">📊</span>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2 text-lg">Suivi température</h4>
                  <p className="text-white/90 text-sm font-medium bg-slate-800/40 p-3 rounded-lg border border-blue-500/20">
                    Ajuster les horaires selon la température de l'eau
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group p-5 bg-gradient-to-r from-amber-500/20 to-orange-600/20 rounded-xl border border-amber-400/30 hover:from-amber-500/30 hover:to-orange-600/30 transition-all duration-300 hover-scale backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-white text-lg">⚠️</span>
                </div>
                <div>
                  <h4 className="text-white font-bold mb-2 text-lg">Surveillance</h4>
                  <p className="text-white/90 text-sm font-medium bg-slate-800/40 p-3 rounded-lg border border-amber-500/20">
                    Cage #003 montre un appétit réduit - vérifier la qualité de l'eau
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions d'alimentation récentes */}
      <Card className="glass-effect border-2 border-cyan-400/30 shadow-2xl backdrop-blur-lg relative overflow-hidden">
        {/* Effet de lueur en arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"></div>
        
        <CardHeader className="relative z-10 pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-4 text-2xl font-bold">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-xl">
                  <Coffee className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-400 rounded-full animate-pulse shadow-lg"></div>
              </div>
              Sessions d'aujourd'hui
            </CardTitle>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-sm font-medium">En temps réel</span>
            </div>
          </div>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="space-y-6">
            {feedingSessions.length === 0 ? (
              <div className="text-center py-12 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-900/20 rounded-2xl border border-white/10"></div>
                <div className="relative z-10">
                  <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Coffee className="h-8 w-8 text-cyan-400" />
                  </div>
                  <p className="text-white/80 text-lg font-medium">Aucune session d'alimentation aujourd'hui</p>
                  <p className="text-white/60 text-sm mt-2">Ajoutez une nouvelle session pour commencer le suivi</p>
                </div>
              </div>
            ) : (
              feedingSessions.map((feeding, index) => (
                <div key={feeding.id} className="group relative p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/20 hover:from-white/15 hover:to-white/10 transition-all duration-300 hover-scale shadow-xl backdrop-blur-sm overflow-hidden">
                  {/* Effet de lueur sur hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Numéro de session */}
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    #{index + 1}
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div className="p-4 bg-gradient-to-br from-ocean-500 to-cyan-600 rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                            <Fish className="h-7 w-7 text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-800 text-sm font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
                            {feeding.cage?.nom}
                          </div>
                        </div>
                        <div>
                          <Badge className={`${getAlimentTypeColor(feeding.type_aliment)} px-4 py-2 text-sm font-bold rounded-xl shadow-lg border-2 border-white/20`}>
                            {feeding.type_aliment.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-slate-700/80 to-slate-800/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/30 shadow-lg">
                          <div className="flex items-center gap-3 text-white">
                            <Clock className="h-5 w-5 text-cyan-400" />
                            <span className="font-mono font-bold text-lg">{feeding.heure}</span>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-bold text-xl shadow-xl border-2 border-emerald-400/30">
                          {feeding.quantite}kg
                        </div>
                        
                        <Badge className={`${getAppetitColor(feeding.appetit)} px-5 py-3 text-sm font-bold rounded-xl border-2 border-white/20 shadow-lg`}>
                          {feeding.appetit}
                        </Badge>
                      </div>
                    </div>
                    
                    {feeding.observations && (
                      <div className="mt-6 pt-6 border-t border-gradient-to-r from-transparent via-white/20 to-transparent">
                        <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm p-4 rounded-xl border border-blue-400/30 shadow-lg">
                          <p className="text-white/95 text-sm leading-relaxed">
                            <span className="font-bold text-blue-300 text-base">💬 Observations:</span> 
                            <span className="ml-2 font-medium">{feeding.observations}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Feeding;
