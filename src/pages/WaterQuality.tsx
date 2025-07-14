
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
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Qualité de l'eau
          </h1>
          <p className="text-white/80 text-lg">
            Surveillance des paramètres environnementaux
          </p>
        </div>
        <NewWaterQualityModal />
      </div>

      {/* Paramètres moyens */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700">Température moy.</CardTitle>
            <Thermometer className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocean-800">{stats.moyenneTemp.toFixed(1)}°C</div>
            <p className="text-xs text-ocean-600">Plage: 22-28°C</p>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700">pH moyen</CardTitle>
            <Droplets className="h-5 w-5 text-aqua-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aqua-800">{stats.moyennePh.toFixed(1)}</div>
            <p className="text-xs text-aqua-600">Plage: 6.5-8.0</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Oxygène moy.</CardTitle>
            <Wind className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.moyenneOxygene.toFixed(1)}mg/L</div>
            <p className="text-xs text-blue-600">Min: 5.0mg/L</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Mesures today</CardTitle>
            <Eye className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.mesuresToday}</div>
            <p className="text-xs text-green-600">Mesures aujourd'hui</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Évolution température (°C)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={temperatureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="heure" stroke="#fff" />
                <YAxis stroke="#fff" domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: 'none', 
                    borderRadius: '8px' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Évolution pH
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={phData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="heure" stroke="#fff" />
                <YAxis stroke="#fff" domain={[6.5, 8.0]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    border: 'none', 
                    borderRadius: '8px' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="ph" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Mesures récentes */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Waves className="h-5 w-5" />
            Mesures d'aujourd'hui
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {measurements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/70">Aucune mesure aujourd'hui</p>
                <p className="text-white/50 text-sm mt-2">Ajoutez une nouvelle mesure pour commencer</p>
              </div>
            ) : (
              measurements.map((measurement) => (
                <div key={measurement.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-ocean-gradient rounded-lg">
                        <Droplets className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{measurement.cage?.nom}</h4>
                        <p className="text-white/70 text-sm">{measurement.heure}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <Badge className={getStatutColor(measurement.statut)}>
                        {measurement.statut}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Thermometer className="h-4 w-4 text-red-400" />
                        <span className="text-white/70 text-sm">Temp.</span>
                      </div>
                      <div className="text-white font-semibold">{measurement.temperature}°C</div>
                    </div>
                    
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Droplets className="h-4 w-4 text-blue-400" />
                        <span className="text-white/70 text-sm">pH</span>
                      </div>
                      <div className="text-white font-semibold">{measurement.ph}</div>
                    </div>
                    
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Wind className="h-4 w-4 text-green-400" />
                        <span className="text-white/70 text-sm">O₂</span>
                      </div>
                      <div className="text-white font-semibold">{measurement.oxygene_dissous}mg/L</div>
                    </div>
                    
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Eye className="h-4 w-4 text-amber-400" />
                        <span className="text-white/70 text-sm">Turbidité</span>
                      </div>
                      <div className="text-white font-semibold">{measurement.turbidite || 'N/A'}</div>
                    </div>
                  </div>
                  
                  {measurement.observations && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <p className="text-white/70 text-sm">
                        <strong>Observations:</strong> {measurement.observations}
                      </p>
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

export default WaterQuality;
