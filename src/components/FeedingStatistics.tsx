import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCageHistory } from '@/hooks/useCageHistory';
import { useOptimizedCages } from '@/hooks/useOptimizedData';
import { useFarm } from '@/contexts/FarmContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Calendar, TrendingUp, Activity, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export function FeedingStatistics() {
  const { toast } = useToast();
  const { cages } = useOptimizedCages();
  const { getFeedingHistory } = useCageHistory();
  const { formatCurrency } = useFarm();
  
  const [selectedCage, setSelectedCage] = useState<string>('all');
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const activeCages = cages.filter(c => c.statut === 'actif');

  useEffect(() => {
    if (selectedCage && selectedCage !== 'all') {
      loadFeedingData(selectedCage);
    } else if (activeCages.length > 0) {
      loadAllCagesData();
    }
  }, [selectedCage, activeCages]);

  const loadFeedingData = async (cageId: string) => {
    setIsLoading(true);
    try {
      const [daily, weekly, monthly] = await Promise.all([
        getFeedingHistory(cageId, 'day'),
        getFeedingHistory(cageId, 'week'),
        getFeedingHistory(cageId, 'month')
      ]);

      setDailyData(daily || []);
      setWeeklyData(weekly || []);
      setMonthlyData(monthly || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les statistiques d\'alimentation',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllCagesData = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.all(
        activeCages.map((cage) => Promise.all([
          getFeedingHistory(cage.id, 'day'),
          getFeedingHistory(cage.id, 'week'),
          getFeedingHistory(cage.id, 'month')
        ]))
      );

      const allDaily: any[] = [];
      const allWeekly: any[] = [];
      const allMonthly: any[] = [];

      for (const [daily, weekly, monthly] of results) {
        if (daily) allDaily.push(...daily);
        if (weekly) allWeekly.push(...weekly);
        if (monthly) allMonthly.push(...monthly);
      }

      // Grouper et sommer les données
      const groupedDaily = groupAndSum(allDaily, 'periode');
      const groupedWeekly = groupAndSum(allWeekly, 'periode');
      const groupedMonthly = groupAndSum(allMonthly, 'periode');

      setDailyData(groupedDaily);
      setWeeklyData(groupedWeekly);
      setMonthlyData(groupedMonthly);
    } catch (error) {
      console.error('Erreur lors du chargement des données globales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupAndSum = (data: any[], groupKey: string) => {
    const grouped = data.reduce((acc, item) => {
      const key = item[groupKey];
      if (!acc[key]) {
        acc[key] = {
          ...item,
          quantite_totale: 0,
          nombre_sessions: 0
        };
      }
      acc[key].quantite_totale += item.quantite_totale || 0;
      acc[key].nombre_sessions += item.nombre_sessions || 0;
      return acc;
    }, {});

    return Object.values(grouped).sort((a: any, b: any) => 
      new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime()
    );
  };

  const calculateTotals = (data: any[]) => {
    return {
      totalQuantity: data.reduce((sum, item) => sum + (item.quantite_totale || 0), 0),
      totalSessions: data.reduce((sum, item) => sum + (item.nombre_sessions || 0), 0),
      averageQuantity: data.length > 0 ? 
        data.reduce((sum, item) => sum + (item.quantite_totale || 0), 0) / data.length : 0
    };
  };

  const formatPeriod = (period: string, type: 'day' | 'week' | 'month') => {
    if (type === 'day') {
      return new Date(period).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    return period;
  };

  const renderPeriodData = (data: any[], type: 'day' | 'week' | 'month') => {
    const totals = calculateTotals(data);

    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Totaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Total Consommé</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">
                {totals.totalQuantity.toFixed(2)} kg
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Sessions Totales</span>
              </div>
              <div className="text-2xl font-bold text-green-800">
                {totals.totalSessions}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Moyenne</span>
              </div>
              <div className="text-2xl font-bold text-purple-800">
                {totals.averageQuantity.toFixed(2)} kg
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Détail par période */}
        <div className="space-y-3">
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune donnée d'alimentation pour cette période</p>
            </div>
          ) : (
            data.slice(0, 10).map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-card rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {formatPeriod(item.periode, type)}
                    </span>
                  </div>
                  {item.date_debut !== item.date_fin && (
                    <Badge variant="outline" className="text-xs">
                      {new Date(item.date_debut).toLocaleDateString('fr-FR')} - {new Date(item.date_fin).toLocaleDateString('fr-FR')}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto sm:justify-end">
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {item.quantite_totale?.toFixed(2) || '0.00'} kg
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.nombre_sessions || 0} session(s)
                    </div>
                  </div>
                  
                  {item.fcr_calcule > 0 && (
                    <Badge 
                      variant={item.fcr_calcule < 2.0 ? 'default' : 'destructive'}
                      className="ml-2"
                    >
                      FCR: {item.fcr_calcule.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Statistiques d'Alimentation Détaillées
          </CardTitle>
          
          <Select value={selectedCage} onValueChange={setSelectedCage}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sélectionner une cage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les cages</SelectItem>
              {activeCages.map((cage) => (
                <SelectItem key={cage.id} value={cage.id}>
                  {cage.nom} - {cage.espece}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="day" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Par Jour
            </TabsTrigger>
            <TabsTrigger value="week" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Par Semaine
            </TabsTrigger>
            <TabsTrigger value="month" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Par Mois
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="day" className="mt-6">
            {renderPeriodData(dailyData, 'day')}
          </TabsContent>
          
          <TabsContent value="week" className="mt-6">
            {renderPeriodData(weeklyData, 'week')}
          </TabsContent>
          
          <TabsContent value="month" className="mt-6">
            {renderPeriodData(monthlyData, 'month')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}