
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplets, Plus, Thermometer, Waves, Wind, Eye } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import NewWaterQualityModal from "@/components/modals/NewWaterQualityModal";
import { useWaterQualityData } from "@/hooks/useWaterQualityData";
import { Skeleton } from "@/components/ui/skeleton";


const getStatutColor = (statut: string) => {
  switch (statut) {
    case 'optimal': return 'bg-green-100 text-green-800 border-green-200';
    case 'attention': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'critique': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const WaterQuality = () => {
  const { measurements, temperatureData, phData, stats, loading } = useWaterQualityData();

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
    <div className="container mx-auto p-6 space-y-8 animate-fade-in bg-background">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Qualité de l'eau</h1>
            <p className="text-muted-foreground">
              Surveillance des paramètres environnementaux
            </p>
          </div>
          <div className="flex gap-3">
            <NewWaterQualityModal />
          </div>
        </div>
      </div>

      {/* Statistiques Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardTitle className="text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">🌡️</span>
              Température moyenne
            </CardTitle>
            <div className="text-white/90 text-2xl font-bold">
              {stats.moyenneTemp.toFixed(1)}°C
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.moyenneTemp / 30) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {stats.moyenneTemp < 18 ? 'Température basse' : stats.moyenneTemp > 25 ? 'Température élevée' : 'Température optimale'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardTitle className="text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">⚗️</span>
              pH moyen
            </CardTitle>
            <div className="text-white/90 text-2xl font-bold">
              {stats.moyennePh.toFixed(1)}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(((stats.moyennePh - 6) / (8.5 - 6)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {stats.moyennePh < 7 ? 'pH acide' : stats.moyennePh > 8 ? 'pH basique' : 'pH optimal'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="bg-gradient-to-br from-purple-500 to-violet-500 text-white">
            <CardTitle className="text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">💨</span>
              Oxygène moyen
            </CardTitle>
            <div className="text-white/90 text-2xl font-bold">
              {stats.moyenneOxygene.toFixed(1)} mg/L
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.moyenneOxygene / 12) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {stats.moyenneOxygene < 5 ? 'Oxygène faible' : stats.moyenneOxygene > 8 ? 'Oxygène élevé' : 'Oxygène optimal'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <CardHeader className="bg-gradient-to-br from-orange-500 to-amber-500 text-white">
            <CardTitle className="text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Mesures aujourd'hui
            </CardTitle>
            <div className="text-white/90 text-2xl font-bold">
              {stats.mesuresToday} mesures
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.mesuresToday / 10) * 100, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {stats.mesuresToday < 3 ? 'Peu de mesures' : stats.mesuresToday > 8 ? 'Nombreuses mesures' : 'Bon suivi'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Évolution température (°C)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="heure" stroke="#374151" />
                <YAxis stroke="#374151" domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="url(#temperatureGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2 }}
                />
                <defs>
                  <linearGradient id="temperatureGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Évolution pH
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-white">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={phData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="heure" stroke="#374151" />
                <YAxis stroke="#374151" domain={[6.5, 8.0]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="ph" 
                  stroke="url(#phGradient)" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2 }}
                />
                <defs>
                  <linearGradient id="phGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Mesures récentes */}
      <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-ocean-500 to-aqua-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            Mesures d'aujourd'hui
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {measurements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg mb-2">Aucune mesure enregistrée aujourd'hui</p>
              <p className="text-gray-400 text-sm">Commencez par ajouter une nouvelle mesure</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {measurements.map((measurement) => (
                <div
                  key={measurement.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-gray-800 font-semibold text-lg flex items-center gap-2">
                        <span className="text-blue-500">🏊</span>
                        {measurement.cage?.nom}
                      </h4>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <span>🕐</span> {measurement.heure}
                      </p>
                    </div>
                    <Badge className={getStatutColor(measurement.statut)}>
                      {measurement.statut}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-blue-500">🌡️</span>
                        <span className="text-gray-600 text-sm">Température</span>
                      </div>
                      <p className="text-blue-700 font-bold text-lg">{measurement.temperature}°C</p>
                      <div className="w-full bg-blue-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((measurement.temperature / 30) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-green-500">⚗️</span>
                        <span className="text-gray-600 text-sm">pH</span>
                      </div>
                      <p className="text-green-700 font-bold text-lg">{measurement.ph}</p>
                      <div className="w-full bg-green-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-green-500 h-1 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(((measurement.ph - 6) / (8.5 - 6)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-purple-500">💨</span>
                        <span className="text-gray-600 text-sm">Oxygène</span>
                      </div>
                      <p className="text-purple-700 font-bold text-lg">{measurement.oxygene_dissous} mg/L</p>
                      <div className="w-full bg-purple-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-purple-500 h-1 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((measurement.oxygene_dissous / 12) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {measurement.turbidite && (
                    <div className="bg-orange-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-orange-500">🌫️</span>
                        <span className="text-gray-600 text-sm">Turbidité</span>
                      </div>
                      <p className="text-orange-700 font-bold">{measurement.turbidite} NTU</p>
                    </div>
                  )}
                  
                  {measurement.observations && (
                    <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-gray-400">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-500">📝</span>
                        <span className="text-gray-600 text-sm font-medium">Observations</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{measurement.observations}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaterQuality;
