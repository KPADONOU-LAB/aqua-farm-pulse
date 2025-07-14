
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, Plus, Clock, TrendingUp, Fish, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import NewFeedingModal from "@/components/modals/NewFeedingModal";

const mockFeedings = [
  {
    id: 1,
    cage: "Cage #001",
    heure: "08:30",
    quantite: 45.5,
    typeAliment: "Granulés croissance",
    appetit: "excellent",
    observations: "Poissons très actifs",
    date: "2024-01-20"
  },
  {
    id: 2,
    cage: "Cage #002",
    heure: "09:15",
    quantite: 38.2,
    typeAliment: "Granulés standard",
    appetit: "bon",
    observations: "Consommation normale",
    date: "2024-01-20"
  },
  {
    id: 3,
    cage: "Cage #003",
    heure: "08:45",
    quantite: 42.1,
    typeAliment: "Granulés croissance",
    appetit: "moyen",
    observations: "Quelques poissons inactifs",
    date: "2024-01-20"
  }
];

const weeklyData = [
  { jour: 'Lun', quantite: 180 },
  { jour: 'Mar', quantite: 195 },
  { jour: 'Mer', quantite: 175 },
  { jour: 'Jeu', quantite: 188 },
  { jour: 'Ven', quantite: 205 },
  { jour: 'Sam', quantite: 170 },
  { jour: 'Dim', quantite: 165 },
];

const getAppetitColor = (appetit: string) => {
  switch (appetit) {
    case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
    case 'bon': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'moyen': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'faible': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const Feeding = () => {
  const totalQuantiteJour = mockFeedings.reduce((acc, feeding) => acc + feeding.quantite, 0);

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
        <NewFeedingModal />
      </div>

      {/* Stats du jour */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700">Sessions aujourd'hui</CardTitle>
            <Coffee className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocean-800">{mockFeedings.length}</div>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700">Quantité totale</CardTitle>
            <TrendingUp className="h-5 w-5 text-aqua-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aqua-800">{totalQuantiteJour.toFixed(1)}kg</div>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Prochaine session</CardTitle>
            <Clock className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">14:30</div>
            <p className="text-xs text-gray-600">Cage #004</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Alertes</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">1</div>
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
            {mockFeedings.map((feeding) => (
              <div key={feeding.id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-ocean-gradient rounded-lg">
                      <Fish className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{feeding.cage}</h4>
                      <p className="text-white/70 text-sm">{feeding.typeAliment}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-white/80">
                      <Clock className="h-4 w-4" />
                      {feeding.heure}
                    </div>
                    
                    <div className="text-white font-medium">
                      {feeding.quantite}kg
                    </div>
                    
                    <Badge className={getAppetitColor(feeding.appetit)}>
                      {feeding.appetit}
                    </Badge>
                  </div>
                </div>
                
                {feeding.observations && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-white/70 text-sm">
                      <strong>Observations:</strong> {feeding.observations}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Feeding;
