import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWeighings } from '@/hooks/useWeighings';
import { NewWeighingModal } from '@/components/modals/NewWeighingModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Scale, TrendingUp, TrendingDown, Minus, Camera, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface Cage {
  id: string;
  nom: string;
  espece: string;
  nombre_poissons: number;
}

export default function WeeklyWeighings() {
  const { weighings, stats, loading, refetch } = useWeighings();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cages, setCages] = useState<Cage[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);

  useEffect(() => {
    fetchCages();
    prepareGrowthData();
  }, [user, weighings]);

  const fetchCages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cages')
        .select('id, nom, espece, nombre_poissons')
        .eq('user_id', user.id)
        .eq('statut', 'en_production');

      if (error) throw error;
      setCages(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des cages:', error);
    }
  };

  const prepareGrowthData = () => {
    // Grouper les pesées par semaine pour créer un graphique de croissance
    const growthByWeek = weighings.reduce((acc: any, weighing) => {
      const week = new Date(weighing.date_pesee).toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      
      if (!acc[week]) {
        acc[week] = {
          semaine: week,
          poids_moyen: 0,
          croissance: 0,
          count: 0
        };
      }
      
      acc[week].poids_moyen += weighing.poids_moyen_echantillon;
      acc[week].croissance += weighing.taux_croissance_semaine;
      acc[week].count += 1;
      
      return acc;
    }, {});

    const chartData = Object.values(growthByWeek).map((item: any) => ({
      semaine: item.semaine,
      poids_moyen: (item.poids_moyen / item.count).toFixed(1),
      croissance: (item.croissance / item.count).toFixed(1)
    }));

    setGrowthData(chartData);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'negative':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pesées Hebdomadaires</h1>
            <p className="text-gray-600 mt-2">Suivi de la croissance et calcul automatique de la biomasse</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Pesée
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Croissance Moyenne</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.croissanceRateMoyenne.toFixed(1)}%
                    </p>
                    {getTrendIcon(stats.tendanceCroissance)}
                  </div>
                </div>
                <Scale className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Biomasse Totale</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.biomasseTotal.toFixed(0)} kg
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">B</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Poids Moyen Récent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.poidsRecentMoyen.toFixed(0)} g
                  </p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 font-bold">P</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tendance</p>
                  <Badge className={`${getTrendColor(stats.tendanceCroissance)} mt-2`}>
                    {stats.tendanceCroissance === 'positive' && 'En hausse'}
                    {stats.tendanceCroissance === 'negative' && 'En baisse'}
                    {stats.tendanceCroissance === 'stable' && 'Stable'}
                  </Badge>
                </div>
                {getTrendIcon(stats.tendanceCroissance)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Growth Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Évolution du Poids Moyen</CardTitle>
              <CardDescription>Progression hebdomadaire du poids par échantillon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis 
                      dataKey="semaine" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                    />
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
                      dataKey="poids_moyen" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Taux de Croissance Hebdomadaire</CardTitle>
              <CardDescription>Pourcentage de croissance par semaine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis 
                      dataKey="semaine" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="croissance" 
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Weighings */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Pesées Récentes</CardTitle>
            <CardDescription>Historique des dernières pesées effectuées</CardDescription>
          </CardHeader>
          <CardContent>
            {weighings.length === 0 ? (
              <div className="text-center py-12">
                <Scale className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune pesée enregistrée</h3>
                <p className="text-gray-600 mb-4">Commencez par enregistrer votre première pesée hebdomadaire</p>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Première Pesée
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weighings.slice(0, 6).map((weighing) => (
                  <Card key={weighing.id} className="bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{weighing.cage?.nom}</h4>
                          <p className="text-sm text-gray-600">{weighing.cage?.espece}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={weighing.taux_croissance_semaine > 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}
                        >
                          {weighing.taux_croissance_semaine.toFixed(1)}%
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Date:</span>
                          <span className="font-medium">{new Date(weighing.date_pesee).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Poids moyen:</span>
                          <span className="font-medium">{weighing.poids_moyen_echantillon} g</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Biomasse:</span>
                          <span className="font-medium">{weighing.biomasse_totale.toFixed(1)} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Échantillons:</span>
                          <span className="font-medium">{weighing.nombre_echantillons}</span>
                        </div>
                      </div>

                      {weighing.photos && weighing.photos.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Camera className="w-4 h-4 mr-1" />
                          {weighing.photos.length} photo(s)
                        </div>
                      )}

                      {weighing.observations && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {weighing.observations}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <NewWeighingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cages={cages}
        />
      </div>
    </div>
  );
}