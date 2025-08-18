import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Plus, TrendingUp, Users, Euro, Fish, History, BarChart3, FileText, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import NewSaleModal from "@/components/modals/NewSaleModal";
import { useSalesData } from "@/hooks/useSalesData";
import { useFarm } from "@/contexts/FarmContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
const monthlyRevenue = [{
  mois: 'Jan',
  revenus: 25400
}, {
  mois: 'Fév',
  revenus: 28200
}, {
  mois: 'Mar',
  revenus: 31800
}, {
  mois: 'Avr',
  revenus: 29600
}, {
  mois: 'Mai',
  revenus: 35200
}, {
  mois: 'Jun',
  revenus: 32800
}];
const weeklyQuantity = [{
  jour: 'Lun',
  quantite: 180
}, {
  jour: 'Mar',
  quantite: 220
}, {
  jour: 'Mer',
  quantite: 195
}, {
  jour: 'Jeu',
  quantite: 165
}, {
  jour: 'Ven',
  quantite: 285
}, {
  jour: 'Sam',
  quantite: 240
}, {
  jour: 'Dim',
  quantite: 125
}];
const getStatutColor = (statut: string) => {
  switch (statut) {
    case 'livré':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'confirmé':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'en_cours':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'annulé':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
const Sales = () => {
  const {
    sales,
    loading,
    generateInvoice
  } = useSalesData();
  const { formatCurrency } = useFarm();
  const { t } = useLanguage();

  // Calculer les données du jour
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(sale => sale.date_vente === today);
  const revenusJour = todaySales.reduce((acc, sale) => acc + sale.prix_total, 0);
  const quantiteJour = todaySales.reduce((acc, sale) => acc + sale.quantite_kg, 0);
  const nombreClientsJour = new Set(todaySales.map(sale => sale.client)).size;
  const prixMoyenKg = quantiteJour > 0 ? revenusJour / quantiteJour : 0;
  return <div className="container mx-auto p-6 space-y-8 animate-fade-in bg-neutral-50">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('sales_title')}</h1>
            <p className="text-muted-foreground">
              Suivi commercial et performance des ventes
            </p>
          </div>
          <div className="flex gap-3">
            <NewSaleModal />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Tableau de bord
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Détails des ventes
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analyses
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-8">
          {/* KPIs du jour */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="stat-card ocean-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-ocean-700">Revenus aujourd'hui</CardTitle>
                <Euro className="h-5 w-5 text-ocean-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-ocean-800">{formatCurrency(revenusJour)}</div>
                <p className="text-xs text-ocean-600">+18% vs hier</p>
              </CardContent>
            </Card>

            <Card className="stat-card aqua-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-aqua-700">Quantité vendue</CardTitle>
                <Fish className="h-5 w-5 text-aqua-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-aqua-800">{quantiteJour.toFixed(1)}kg</div>
                <p className="text-xs text-aqua-600">275 poissons</p>
              </CardContent>
            </Card>

            <Card className="stat-card bg-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Clients servis</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{nombreClientsJour}</div>
                <p className="text-xs text-muted-foreground">Aujourd'hui</p>
              </CardContent>
            </Card>

            <Card className="stat-card bg-card/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Prix moyen/kg</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{formatCurrency(prixMoyenKg)}</div>
                <p className="text-xs text-muted-foreground">+5% ce mois</p>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-effect">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                  <Euro className="h-5 w-5" />
                  Évolution revenus mensuels
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-gray-400">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="mois" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    borderRadius: '8px'
                  }} formatter={(value) => [formatCurrency(Number(value)), 'Revenus']} />
                    <Line type="monotone" dataKey="revenus" stroke="#10b981" strokeWidth={3} dot={{
                    fill: '#10b981',
                    strokeWidth: 2,
                    r: 6
                  }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Fish className="h-5 w-5" />
                  Quantités vendues hebdomadaires (kg)
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-gray-400">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyQuantity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="jour" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: 'none',
                    borderRadius: '8px'
                  }} formatter={value => [`${value}kg`, 'Quantité']} />
                    <Bar dataKey="quantite" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab - Ventes du jour */}
        <TabsContent value="history" className="space-y-6">
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700">
              <CardTitle className="text-white flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique des ventes du jour
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-gray-50">
                    <TableHead className="text-gray-700 font-semibold">Client</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Quantité</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Cage</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Heure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? <TableRow>
                      <TableCell colSpan={4} className="text-gray-600 text-center py-8">
                        Chargement des ventes...
                      </TableCell>
                    </TableRow> : todaySales.length === 0 ? <TableRow>
                      <TableCell colSpan={4} className="text-gray-600 text-center py-8">
                        Aucune vente aujourd'hui
                      </TableCell>
                    </TableRow> : todaySales.map(sale => <TableRow key={sale.id} className="border-gray-100 hover:bg-blue-50">
                        <TableCell className="text-gray-900 font-medium">{sale.client}</TableCell>
                        <TableCell className="text-gray-700">{sale.quantite_kg}kg</TableCell>
                        <TableCell className="text-gray-700">{sale.cage?.nom || 'N/A'}</TableCell>
                        <TableCell className="text-gray-700">
                          {format(new Date(sale.date_vente), 'HH:mm', {
                      locale: fr
                    })}
                        </TableCell>
                      </TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details Tab - Détails des factures */}
        <TabsContent value="details" className="space-y-6">
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700">
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Détails des ventes - Factures
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 hover:bg-gray-50">
                    <TableHead className="text-gray-700 font-semibold">Date</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Client</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Cage</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Quantité</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Prix/kg</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Montant total payé</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? <TableRow>
                      <TableCell colSpan={7} className="text-gray-600 text-center py-8">
                        Chargement des ventes...
                      </TableCell>
                    </TableRow> : todaySales.length === 0 ? <TableRow>
                      <TableCell colSpan={7} className="text-gray-600 text-center py-8">
                        Aucune vente aujourd'hui
                      </TableCell>
                    </TableRow> : todaySales.map(sale => <TableRow key={sale.id} className="border-gray-100 hover:bg-blue-50">
                        <TableCell className="text-gray-900">
                          {format(new Date(sale.date_vente), 'dd/MM/yyyy', {
                      locale: fr
                    })}
                        </TableCell>
                        <TableCell className="text-gray-900 font-medium">{sale.client}</TableCell>
                        <TableCell className="text-gray-700">{sale.cage?.nom || 'N/A'}</TableCell>
                        <TableCell className="text-gray-700">{sale.quantite_kg}kg</TableCell>
                        <TableCell className="text-gray-700">{formatCurrency(sale.prix_par_kg)}</TableCell>
                        <TableCell className="text-green-700 font-bold text-lg">{formatCurrency(sale.prix_total)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => generateInvoice(sale)}>
                            <Printer className="h-4 w-4 mr-1" />
                            Facture
                          </Button>
                        </TableCell>
                      </TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <TrendingUp className="h-5 w-5" />
                  Performances mensuelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-black">Chiffre d'affaires:</span>
                    <span className="font-semibold text-black">{formatCurrency(182200)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-black">Croissance:</span>
                    <span className="text-green-400 font-semibold">+24.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-black">Ventes totales:</span>
                    <span className="font-semibold text-black">1,247kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-black">Clients uniques:</span>
                    <span className="font-semibold text-black">47</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Fish className="h-5 w-5" />
                  Top espèces vendues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-black">Tilapia:</span>
                    <span className="font-semibold text-black">425kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-black">Dorade:</span>
                    <span className="font-semibold text-black">385kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-black">Bar:</span>
                    <span className="font-semibold text-black">287kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-black">Loup:</span>
                    <span className="font-semibold text-black">150kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Users className="h-5 w-5" />
                  Top clients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-black">Restaurant Le Neptune:</span>
                    <span className="font-semibold text-black">{formatCurrency(8450)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-black">Grossiste AquaFrais:</span>
                    <span className="font-semibold text-black">{formatCurrency(6240)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-black">Marché Central:</span>
                    <span className="font-semibold text-black">{formatCurrency(4875)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-black">Poissonnerie du Port:</span>
                    <span className="font-semibold text-black">{formatCurrency(3690)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <BarChart3 className="h-5 w-5" />
                Analyse détaillée des revenus
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-zinc-400">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="mois" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '8px'
                }} formatter={(value) => [formatCurrency(Number(value)), 'Revenus']} />
                  <Bar dataKey="revenus" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default Sales;