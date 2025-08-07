import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCageHistory } from '@/hooks/useCageHistory';
import { useOptimizedCages } from '@/hooks/useOptimizedData';
import { useFarm } from '@/contexts/FarmContext';
import { Calendar, TrendingUp, DollarSign, Fish, Scale, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export function CageHistoryPanel() {
  const { toast } = useToast();
  const { formatCurrency } = useFarm();
  const { cages } = useOptimizedCages();
  const { 
    loading, 
    feedingHistory, 
    salesHistory, 
    getFeedingHistory, 
    getSalesHistory,
    formatFeedingHistoryForDisplay,
    formatSalesHistoryForDisplay,
    getCageSummaryStats
  } = useCageHistory();

  const [selectedCage, setSelectedCage] = useState<string>('');
  const [feedingPeriod, setFeedingPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [salesPeriod, setSalesPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (cages.length > 0 && !selectedCage) {
      setSelectedCage(cages[0].id);
    }
  }, [cages, selectedCage]);

  const handleLoadFeedingHistory = async () => {
    if (!selectedCage) return;
    
    try {
      await getFeedingHistory(selectedCage, feedingPeriod);
      toast({
        title: 'Historique chargé',
        description: 'Historique d\'alimentation mis à jour avec succès'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'historique d\'alimentation',
        variant: 'destructive'
      });
    }
  };

  const handleLoadSalesHistory = async () => {
    try {
      await getSalesHistory(salesPeriod, selectedCage || undefined);
      toast({
        title: 'Historique chargé',
        description: 'Historique des ventes mis à jour avec succès'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'historique des ventes',
        variant: 'destructive'
      });
    }
  };

  const exportCompleteHistory = async () => {
    if (!selectedCage) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une cage",
        variant: "destructive"
      });
      return;
    }

    setExportLoading(true);
    try {
      const cage = cages.find(c => c.id === selectedCage);
      if (!cage) return;

      // Récupérer toutes les données
      const [feedingData, salesData, cageStats] = await Promise.all([
        getFeedingHistory(selectedCage, 'day'),
        getSalesHistory('day', selectedCage),
        getCageSummaryStats(selectedCage)
      ]);

      // Créer le workbook Excel
      const wb = XLSX.utils.book_new();

      // Feuille 1: Résumé de la cage
      const summaryData = [
        ['RÉSUMÉ DE LA CAGE', ''],
        ['Nom de la cage', cage.nom],
        ['Espèce', cage.espece],
        ['Statut', cage.statut],
        ['Date d\'introduction', cage.date_introduction || 'N/A'],
        ['Nombre de poissons', cage.nombre_poissons],
        ['Poids moyen (kg)', cage.poids_moyen],
        ['FCR', (cageStats as any)?.fcr || cage.fcr || 0],
        ['Taux de mortalité (%)', cage.taux_mortalite || 0],
        ['Taux de croissance (%)', cage.croissance || '0%'],
        ['Coût par kg', 'N/A'], // Sera calculé via les coûts tracking
        [''],
        ['MÉTRIQUES CALCULÉES', ''],
        ['Alimentation totale (kg)', feedingData?.reduce((sum, item) => sum + (item.quantite_totale || 0), 0) || 0],
        ['Nombre total de sessions d\'alimentation', feedingData?.length || 0],
        ['Chiffre d\'affaires total', salesData?.reduce((sum, item) => sum + (item.chiffre_affaires || 0), 0) || 0],
        ['Quantité vendue totale (kg)', salesData?.reduce((sum, item) => sum + (item.quantite_totale_kg || 0), 0) || 0],
        ['Prix moyen de vente par kg', salesData?.length > 0 ? 
          formatCurrency(salesData.reduce((sum, item) => sum + (item.prix_moyen_kg || 0), 0) / salesData.length) : 'N/A']
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, 'Résumé');

      // Feuille 2: Historique d'alimentation détaillé
      if (feedingData && feedingData.length > 0) {
        const feedingFormatted = feedingData.map(item => ({
          'Période': item.periode,
          'Date début': item.date_debut,
          'Date fin': item.date_fin,
          'Quantité totale (kg)': item.quantite_totale,
          'Nombre de sessions': item.nombre_sessions,
          'Quantité moyenne (kg)': item.quantite_moyenne?.toFixed(2),
          'FCR calculé': item.fcr_calcule?.toFixed(2) || 'N/A',
          'Poids début (kg)': item.poids_debut?.toFixed(2) || 'N/A',
          'Poids fin (kg)': item.poids_fin?.toFixed(2) || 'N/A',
          'Gain de poids (kg)': item.gain_poids?.toFixed(2) || 'N/A'
        }));

        const feedingSheet = XLSX.utils.json_to_sheet(feedingFormatted);
        XLSX.utils.book_append_sheet(wb, feedingSheet, 'Historique Alimentation');
      }

      // Feuille 3: Historique des ventes détaillé
      if (salesData && salesData.length > 0) {
        const salesFormatted = salesData.map(item => ({
          'Période': item.periode,
          'Date début': item.date_debut,
          'Date fin': item.date_fin,
          'Nombre de ventes': item.nombre_ventes,
          'Quantité totale (kg)': item.quantite_totale_kg,
          'Chiffre d\'affaires': formatCurrency(item.chiffre_affaires),
          'Prix moyen par kg': formatCurrency(item.prix_moyen_kg),
          'Clients distincts': item.clients_distincts,
          'Cage': item.cage_nom
        }));

        const salesSheet = XLSX.utils.json_to_sheet(salesFormatted);
        XLSX.utils.book_append_sheet(wb, salesSheet, 'Historique Ventes');
      }

      // Ajuster la largeur des colonnes pour une meilleure lisibilité
      Object.keys(wb.Sheets).forEach(sheetName => {
        const sheet = wb.Sheets[sheetName];
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
        const columnWidths: any[] = [];
        
        for (let C = range.s.c; C <= range.e.c; ++C) {
          let maxWidth = 10;
          for (let R = range.s.r; R <= range.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = sheet[cellAddress];
            if (cell && cell.v) {
              const cellLength = cell.v.toString().length;
              maxWidth = Math.max(maxWidth, cellLength);
            }
          }
          columnWidths.push({ width: Math.min(maxWidth + 2, 50) });
        }
        sheet['!cols'] = columnWidths;
      });

      // Générer le nom de fichier avec la date
      const fileName = `historique_cage_${cage.nom.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Exporter le fichier
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Export réussi ✅",
        description: `L'historique complet a été exporté vers ${fileName}`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export Excel",
        variant: "destructive"
      });
    } finally {
      setExportLoading(false);
    }
  };

  const formattedFeedingHistory = formatFeedingHistoryForDisplay(feedingHistory);
  const formattedSalesHistory = formatSalesHistoryForDisplay(salesHistory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Historique des Cages</h2>
        
        <div className="flex items-center gap-4">
          <Select value={selectedCage} onValueChange={setSelectedCage}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Choisir une cage" />
            </SelectTrigger>
            <SelectContent>
              {cages.map((cage) => (
                <SelectItem key={cage.id} value={cage.id}>
                  {cage.nom} - {cage.espece}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={exportCompleteHistory}
            disabled={!selectedCage || exportLoading}
            className="flex items-center gap-2"
            variant="outline"
          >
            <FileDown className="h-4 w-4" />
            {exportLoading ? 'Export en cours...' : 'Exporter tout en Excel'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="feeding" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feeding">Historique Alimentation</TabsTrigger>
          <TabsTrigger value="sales">Historique Ventes</TabsTrigger>
        </TabsList>

        <TabsContent value="feeding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fish className="h-5 w-5" />
                Historique d'Alimentation et FCR
              </CardTitle>
              <div className="flex items-center gap-4">
                <Select value={feedingPeriod} onValueChange={(value: 'day' | 'week' | 'month') => setFeedingPeriod(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Par jour</SelectItem>
                    <SelectItem value="week">Par semaine</SelectItem>
                    <SelectItem value="month">Par mois</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleLoadFeedingHistory} disabled={loading || !selectedCage}>
                  {loading ? 'Chargement...' : 'Charger'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formattedFeedingHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Période</TableHead>
                      <TableHead>Quantité Totale</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Quantité Moyenne</TableHead>
                      <TableHead>FCR Calculé</TableHead>
                      <TableHead>Gain de Poids</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formattedFeedingHistory.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.periode}</TableCell>
                        <TableCell>{item.quantite_totale_formatted}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.nombre_sessions}</Badge>
                        </TableCell>
                        <TableCell>{item.quantite_moyenne_formatted}</TableCell>
                        <TableCell>
                          <Badge variant={parseFloat(item.fcr_formatted) > 2.2 ? 'destructive' : 'default'}>
                            {item.fcr_formatted}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-600">{item.gain_poids_formatted}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Fish className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun historique d'alimentation disponible</p>
                  <p className="text-sm">Sélectionnez une cage et une période pour voir les données</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Historique des Ventes
              </CardTitle>
              <div className="flex items-center gap-4">
                <Select value={salesPeriod} onValueChange={(value: 'day' | 'week' | 'month') => setSalesPeriod(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Par jour</SelectItem>
                    <SelectItem value="week">Par semaine</SelectItem>
                    <SelectItem value="month">Par mois</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleLoadSalesHistory} disabled={loading}>
                  {loading ? 'Chargement...' : 'Charger'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formattedSalesHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Période</TableHead>
                      <TableHead>Ventes</TableHead>
                      <TableHead>Quantité Totale</TableHead>
                      <TableHead>Chiffre d'Affaires</TableHead>
                      <TableHead>Prix Moyen/kg</TableHead>
                      <TableHead>Clients</TableHead>
                      <TableHead>Cage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formattedSalesHistory.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.periode}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.nombre_ventes}</Badge>
                        </TableCell>
                        <TableCell>{item.quantite_totale_formatted}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {item.chiffre_affaires_formatted}
                        </TableCell>
                        <TableCell>{item.prix_moyen_formatted}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.clients_distincts}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.cage_nom}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun historique de ventes disponible</p>
                  <p className="text-sm">Chargez les données pour voir l'historique des ventes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">FCR Moyen Actuel</p>
                <p className="text-2xl font-bold">
                  {feedingHistory.length > 0 
                    ? (feedingHistory.reduce((sum, item) => sum + item.fcr_calcule, 0) / feedingHistory.length).toFixed(2)
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Alimentation Totale</p>
                <p className="text-2xl font-bold">
                  {feedingHistory.length > 0 
                    ? `${feedingHistory.reduce((sum, item) => sum + item.quantite_totale, 0).toFixed(1)} kg`
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">CA Total</p>
                <p className="text-2xl font-bold">
                  {salesHistory.length > 0 
                    ? salesHistory.reduce((sum, item) => sum + item.chiffre_affaires, 0).toFixed(0)
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}