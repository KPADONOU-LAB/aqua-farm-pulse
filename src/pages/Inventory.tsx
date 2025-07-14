
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, AlertTriangle, TrendingUp, Coffee, Pill, Wrench } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import NewInventoryModal from "@/components/modals/NewInventoryModal";

const mockInventory = [
  {
    id: 1,
    nom: "Granulés croissance premium",
    categorie: "aliment",
    stockActuel: 2.5,
    unite: "tonnes",
    stockMin: 1.0,
    prixUnitaire: 1200,
    fournisseur: "AquaFeed Pro",
    dateExpiration: "2024-06-15",
    statut: "normal"
  },
  {
    id: 2,
    nom: "Granulés standard",
    categorie: "aliment", 
    stockActuel: 4.2,
    unite: "tonnes",
    stockMin: 2.0,
    prixUnitaire: 980,
    fournisseur: "AquaFeed Pro",
    dateExpiration: "2024-05-20",
    statut: "normal"
  },
  {
    id: 3,
    nom: "Probiotiques aqua",
    categorie: "veterinaire",
    stockActuel: 0.5,
    unite: "kg",
    stockMin: 2.0,
    prixUnitaire: 85,
    fournisseur: "VetAqua",
    dateExpiration: "2024-08-30",
    statut: "critique"
  },
  {
    id: 4,
    nom: "Antibiotique large spectre",
    categorie: "veterinaire",
    stockActuel: 12,
    unite: "flacons",
    stockMin: 5,
    prixUnitaire: 45,
    fournisseur: "VetAqua", 
    dateExpiration: "2025-01-15",
    statut: "normal"
  },
  {
    id: 5,
    nom: "Filets de rechange",
    categorie: "materiel",
    stockActuel: 3,
    unite: "unités",
    stockMin: 5,
    prixUnitaire: 250,
    fournisseur: "AquaEquip",
    dateExpiration: null,
    statut: "faible"
  }
];

const consumptionData = [
  { mois: 'Jan', aliment: 8.5, veterinaire: 0.8, materiel: 1.2 },
  { mois: 'Fév', aliment: 9.2, veterinaire: 1.1, materiel: 0.9 },
  { mois: 'Mar', aliment: 8.8, veterinaire: 0.6, materiel: 2.1 },
  { mois: 'Avr', aliment: 9.5, veterinaire: 1.3, materiel: 0.7 },
  { mois: 'Mai', aliment: 10.1, veterinaire: 0.9, materiel: 1.8 },
  { mois: 'Jun', aliment: 9.7, veterinaire: 0.7, materiel: 1.1 },
];

const categoryData = [
  { name: 'Aliments', value: 6.7, color: '#10b981' },
  { name: 'Vétérinaire', value: 12.5, color: '#0ea5e9' },
  { name: 'Matériel', value: 3, color: '#f59e0b' },
];

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
  const stocksCritiques = mockInventory.filter(item => item.statut === 'critique').length;
  const stocksFaibles = mockInventory.filter(item => item.statut === 'faible').length;
  const valeurTotale = mockInventory.reduce((acc, item) => acc + (item.stockActuel * item.prixUnitaire), 0);

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
        <NewInventoryModal />
      </div>

      {/* Indicateurs stocks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Stocks critiques</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stocksCritiques}</div>
            <p className="text-xs text-red-600">Réappro urgent</p>
          </CardContent>
        </Card>

        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700">Stocks faibles</CardTitle>
            <TrendingUp className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocean-800">{stocksFaibles}</div>
            <p className="text-xs text-ocean-600">À surveiller</p>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700">Articles total</CardTitle>
            <Package className="h-5 w-5 text-aqua-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aqua-800">{mockInventory.length}</div>
            <p className="text-xs text-aqua-600">En gestion</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Valeur totale</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">€{(valeurTotale / 1000).toFixed(1)}k</div>
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
            {mockInventory.map((item) => {
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
                          {item.stockActuel} {item.unite}
                        </div>
                        <div className="text-white/70 text-sm">
                          Min: {item.stockMin} {item.unite}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-white/70">Prix unitaire:</span>
                      <div className="text-white font-medium">€{item.prixUnitaire}</div>
                    </div>
                    <div>
                      <span className="text-white/70">Valeur stock:</span>
                      <div className="text-white font-medium">
                        €{(item.stockActuel * item.prixUnitaire).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-white/70">Catégorie:</span>
                      <div className="text-white font-medium capitalize">{item.categorie}</div>
                    </div>
                    <div>
                      <span className="text-white/70">Expiration:</span>
                      <div className="text-white font-medium">
                        {item.dateExpiration 
                          ? new Date(item.dateExpiration).toLocaleDateString('fr-FR')
                          : 'N/A'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
