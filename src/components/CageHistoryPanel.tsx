import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCageHistory } from '@/hooks/useCageHistory';
import { useOptimizedCages } from '@/hooks/useOptimizedData';
import { Calendar, TrendingUp, DollarSign, Fish, Scale } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CageHistoryPanel() {
  const { toast } = useToast();
  const { cages } = useOptimizedCages();
  const {
    loading,
    feedingHistory,
    salesHistory,
    getFeedingHistory,
    getSalesHistory,
    formatFeedingHistoryForDisplay,
    formatSalesHistoryForDisplay
  } = useCageHistory();

  const [selectedCage, setSelectedCage] = useState<string>('');
  const [feedingPeriod, setFeedingPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [salesPeriod, setSalesPeriod] = useState<'day' | 'week' | 'month'>('month');

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