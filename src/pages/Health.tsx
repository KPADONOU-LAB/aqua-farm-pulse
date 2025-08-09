import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, AlertTriangle, TrendingDown, Activity, Pill } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import NewHealthObservationModal from "@/components/modals/NewHealthObservationModal";
import { useOptimizedHealthData } from "@/hooks/useOptimizedHealthData";
const mockHealthRecords = [{
  id: 1,
  cage: "Cage #001",
  date: "2024-01-20",
  mortalite: 2,
  causePresumee: "Stress thermique",
  traitements: ["Probiotiques"],
  observations: "Amélioration générale observée",
  statut: "surveillance"
}, {
  id: 2,
  cage: "Cage #002",
  date: "2024-01-19",
  mortalite: 0,
  causePresumee: null,
  traitements: [],
  observations: "Population en bonne santé",
  statut: "normal"
}, {
  id: 3,
  cage: "Cage #003",
  date: "2024-01-20",
  mortalite: 5,
  causePresumee: "Maladie bactérienne",
  traitements: ["Antibiotique", "Vitamines"],
  observations: "Intervention vétérinaire requise",
  statut: "alerte"
}];
const mortalityData = [{
  jour: 'Lun',
  mortalite: 1
}, {
  jour: 'Mar',
  mortalite: 3
}, {
  jour: 'Mer',
  mortalite: 2
}, {
  jour: 'Jeu',
  mortalite: 0
}, {
  jour: 'Ven',
  mortalite: 7
}, {
  jour: 'Sam',
  mortalite: 2
}, {
  jour: 'Dim',
  mortalite: 1
}];
const survivalData = [{
  semaine: 'S1',
  taux: 98.5
}, {
  semaine: 'S2',
  taux: 97.8
}, {
  semaine: 'S3',
  taux: 97.2
}, {
  semaine: 'S4',
  taux: 96.9
}, {
  semaine: 'S5',
  taux: 96.1
}, {
  semaine: 'S6',
  taux: 95.8
}];
const getStatutColor = (statut: string) => {
  switch (statut) {
    case 'normal':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'surveillance':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'alerte':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
const Health = () => {
  const { healthObservations } = useOptimizedHealthData();

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const totalMortaliteJour = (healthObservations || [])
    .filter((o) => o.date_observation === todayStr)
    .reduce((acc, o) => acc + (o.mortalite || 0), 0);

  const yesterdayMortality = (healthObservations || [])
    .filter((o) => o.date_observation === yesterdayStr)
    .reduce((acc, o) => acc + (o.mortalite || 0), 0);

  const deltaVsHier = totalMortaliteJour - yesterdayMortality;

  const cagesAlerte = mockHealthRecords.filter(r => r.statut === 'alerte').length;
  const cagesSurveillance = mockHealthRecords.filter(r => r.statut === 'surveillance').length;
  const tauxSurvieGlobal = survivalData[survivalData.length - 1]?.taux || 0;
  return <div className="container mx-auto p-6 space-y-8 animate-fade-in bg-neutral-50">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Santé des poissons</h1>
            <p className="text-muted-foreground">
              Surveillance sanitaire et interventions vétérinaires
            </p>
          </div>
          <div className="flex gap-3">
            <NewHealthObservationModal />
          </div>
        </div>
      </div>

      {/* Statistiques Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Mortalité aujourd'hui</CardTitle>
            <TrendingDown className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalMortaliteJour}</div>
            <p className="text-xs text-muted-foreground">{deltaVsHier >= 0 ? `+${deltaVsHier}` : deltaVsHier} vs hier</p>
          </CardContent>
        </Card>

        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700">Taux de survie</CardTitle>
            <Activity className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocean-800">{tauxSurvieGlobal}%</div>
            <p className="text-xs text-ocean-600">-0.3% cette semaine</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Cages en alerte</CardTitle>
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{cagesAlerte}</div>
            <p className="text-xs text-muted-foreground">Intervention requise</p>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700">Sous surveillance</CardTitle>
            <Heart className="h-5 w-5 text-aqua-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aqua-800">{cagesSurveillance}</div>
            <p className="text-xs text-aqua-600">Suivi renforcé</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Mortalité hebdomadaire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mortalityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="jour" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: 'none',
                borderRadius: '8px'
              }} />
                <Bar dataKey="mortalite" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Évolution taux de survie (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={survivalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="semaine" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" domain={[94, 99]} />
                <Tooltip contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: 'none',
                borderRadius: '8px'
              }} />
                <Line type="monotone" dataKey="taux" stroke="#10b981" strokeWidth={3} dot={{
                fill: '#10b981',
                strokeWidth: 2,
                r: 6
              }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Observations récentes */}
        <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-black flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Observations sanitaires récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockHealthRecords.map(record => <div key={record.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-ocean-gradient rounded-lg">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-foreground font-medium">{record.cage}</h4>
                      <p className="text-muted-foreground text-sm">{new Date(record.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge className={getStatutColor(record.statut)}>
                      {record.statut}
                    </Badge>
                    <div className="text-right">
                      <div className="text-foreground font-semibold">{record.mortalite} décès</div>
                      <div className="text-muted-foreground text-sm">mortalité</div>
                    </div>
                  </div>
                </div>
                
                {record.causePresumee && <div className="mb-3">
                    <span className="text-muted-foreground text-sm">Cause présumée: </span>
                    <span className="text-foreground font-medium">{record.causePresumee}</span>
                  </div>}
                
                {record.traitements.length > 0 && <div className="mb-3">
                    <span className="text-muted-foreground text-sm">Traitements: </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {record.traitements.map((traitement, idx) => <Badge key={idx} className="bg-blue-100/10 text-blue-300 border-blue-200/20">
                          <Pill className="h-3 w-3 mr-1" />
                          {traitement}
                        </Badge>)}
                    </div>
                  </div>}
                
                <div className="pt-3 border-t border-white/10">
                  <p className="text-foreground text-sm">
                    <strong>Observations:</strong> {record.observations}
                  </p>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Health;