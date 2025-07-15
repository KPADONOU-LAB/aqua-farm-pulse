
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, Plus, Clock, TrendingUp, Fish, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import NewFeedingModal from "@/components/modals/NewFeedingModal";
import { useFeedingData } from "@/hooks/useFeedingData";
import { Skeleton } from "@/components/ui/skeleton";
import { HomeButton } from "@/components/HomeButton";

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
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Suivi alimentaire
          </h1>
          <p className="text-white/80 text-lg">
            Gestion et suivi des sessions d'alimentation
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <HomeButton />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Consommation hebdomadaire (kg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
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
                <Bar dataKey="quantite" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              Recommandations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50/10 rounded-lg border border-green-200/20">
              <h4 className="text-white font-medium mb-2">💡 Optimisation FCR</h4>
              <p className="text-white/80 text-sm">
                Réduire la quantité de 5% pour les cages avec FCR &gt; 2.0
              </p>
            </div>
            
            <div className="p-4 bg-blue-50/10 rounded-lg border border-blue-200/20">
              <h4 className="text-white font-medium mb-2">📊 Suivi température</h4>
              <p className="text-white/80 text-sm">
                Ajuster les horaires selon la température de l'eau
              </p>
            </div>
            
            <div className="p-4 bg-amber-50/10 rounded-lg border border-amber-200/20">
              <h4 className="text-white font-medium mb-2">⚠️ Surveillance</h4>
              <p className="text-white/80 text-sm">
                Cage #003 montre un appétit réduit - vérifier la qualité de l'eau
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions d'alimentation récentes */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Sessions d'aujourd'hui
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedingSessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/70">Aucune session d'alimentation aujourd'hui</p>
                <p className="text-white/50 text-sm mt-2">Ajoutez une nouvelle session pour commencer</p>
              </div>
            ) : (
              feedingSessions.map((feeding) => (
                <div key={feeding.id} className="p-5 bg-white/10 rounded-xl border border-white/20 hover:bg-white/15 transition-all hover-scale shadow-lg backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="p-3 bg-ocean-gradient rounded-xl shadow-lg">
                          <Fish className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 bg-white text-ocean-600 text-xs font-bold px-2 py-1 rounded-full shadow-md">
                          {feeding.cage?.nom}
                        </div>
                      </div>
                      <div>
                        <Badge className={`${getAlimentTypeColor(feeding.type_aliment)} px-3 py-1 text-sm font-medium rounded-full shadow-md`}>
                          {feeding.type_aliment.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/30">
                        <div className="flex items-center gap-2 text-white">
                          <Clock className="h-4 w-4" />
                          <span className="font-mono font-bold">{feeding.heure}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                        {feeding.quantite}kg
                      </div>
                      
                      <Badge className={`${getAppetitColor(feeding.appetit)} px-4 py-2 text-sm font-bold rounded-lg`}>
                        {feeding.appetit}
                      </Badge>
                    </div>
                  </div>
                  
                  {feeding.observations && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="bg-blue-500/20 backdrop-blur-sm p-3 rounded-lg border border-blue-400/30">
                        <p className="text-white/90 text-sm">
                          <span className="font-semibold text-blue-300">Observations:</span> {feeding.observations}
                        </p>
                      </div>
                    </div>
                  )}
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
