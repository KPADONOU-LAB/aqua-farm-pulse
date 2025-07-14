
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fish, Plus, TrendingUp, Calendar, Weight, Users } from "lucide-react";
import NewCageModal from "@/components/modals/NewCageModal";

const mockCages = [
  {
    id: 1,
    nom: "Cage #001",
    espece: "Tilapia",
    nombrePoissons: 2500,
    poidsMoyen: 0.8,
    dateIntroduction: "2024-01-15",
    statut: "actif",
    fcr: 1.8,
    croissance: "+12%"
  },
  {
    id: 2,
    nom: "Cage #002",
    espece: "Bar",
    nombrePoissons: 1800,
    poidsMoyen: 1.2,
    dateIntroduction: "2023-12-10",
    statut: "actif",
    fcr: 2.1,
    croissance: "+8%"
  },
  {
    id: 3,
    nom: "Cage #003",
    espece: "Dorade",
    nombrePoissons: 2200,
    poidsMoyen: 0.95,
    dateIntroduction: "2024-02-01",
    statut: "actif",
    fcr: 1.9,
    croissance: "+15%"
  },
  {
    id: 4,
    nom: "Cage #004",
    espece: "Tilapia",
    nombrePoissons: 0,
    poidsMoyen: 0,
    dateIntroduction: null,
    statut: "vide",
    fcr: 0,
    croissance: "0%"
  }
];

const getStatutColor = (statut: string) => {
  switch (statut) {
    case 'actif': return 'bg-green-100 text-green-800 border-green-200';
    case 'vide': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const Cages = () => {
  return (
    <div className="min-h-screen p-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Gestion des cages
          </h1>
          <p className="text-white/80 text-lg">
            Suivi et gestion de vos installations piscicoles
          </p>
        </div>
        <NewCageModal />
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700">Cages actives</CardTitle>
            <Fish className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocean-800">
              {mockCages.filter(c => c.statut === 'actif').length}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700">Total poissons</CardTitle>
            <Users className="h-5 w-5 text-aqua-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aqua-800">
              {mockCages.reduce((acc, cage) => acc + cage.nombrePoissons, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Poids moyen</CardTitle>
            <Weight className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">
              {(mockCages
                .filter(c => c.statut === 'actif')
                .reduce((acc, cage) => acc + cage.poidsMoyen, 0) / 
                mockCages.filter(c => c.statut === 'actif').length
              ).toFixed(1)}kg
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">FCR moyen</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">
              {(mockCages
                .filter(c => c.statut === 'actif')
                .reduce((acc, cage) => acc + cage.fcr, 0) / 
                mockCages.filter(c => c.statut === 'actif').length
              ).toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des cages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCages.map((cage) => (
          <Card key={cage.id} className="glass-effect hover:scale-105 transition-all duration-300 cursor-pointer">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Fish className="h-5 w-5" />
                    {cage.nom}
                  </CardTitle>
                  <p className="text-white/70 mt-1">{cage.espece}</p>
                </div>
                <Badge className={getStatutColor(cage.statut)}>
                  {cage.statut}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cage.statut === 'actif' ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Poissons:</span>
                    <span className="text-white font-semibold">{cage.nombrePoissons.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Poids moyen:</span>
                    <span className="text-white font-semibold">{cage.poidsMoyen}kg</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">FCR:</span>
                    <span className="text-white font-semibold">{cage.fcr}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Croissance:</span>
                    <span className="text-green-400 font-semibold">{cage.croissance}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Introduit:
                    </span>
                    <span className="text-white/80">
                      {cage.dateIntroduction ? new Date(cage.dateIntroduction).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Fish className="h-12 w-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/60">Cage disponible</p>
                  <Button variant="outline" className="mt-3 bg-white/10 border-white/20 text-white hover:bg-white/20">
                    Démarrer cycle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Cages;
