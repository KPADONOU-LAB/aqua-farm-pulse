
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fish, Plus, TrendingUp, Calendar, Weight, Users, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import NewCageModal from "@/components/modals/NewCageModal";
import EditCageModal from "@/components/modals/EditCageModal";
import CageHistoryModal from "@/components/modals/CageHistoryModal";
import { CageDailyHistoryModal } from "@/components/modals/CageDailyHistoryModal";
import { useCageMetrics } from "@/hooks/useCageMetrics";
import * as XLSX from 'xlsx';



const getStatutColor = (statut: string) => {
  switch (statut) {
    case 'actif': return 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/25';
    case 'vide': return 'bg-gray-500 text-white border-gray-600 shadow-lg shadow-gray-500/25';
    case 'maintenance': return 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/25';
    default: return 'bg-gray-500 text-white border-gray-600 shadow-lg shadow-gray-500/25';
  }
};

const getPerformanceColor = (fcr: number, croissance: string, mortalite: number) => {
  const croissanceNum = parseFloat(croissance?.replace('%', '') || '0');
  
  if (fcr <= 1.5 && croissanceNum >= 2.0 && mortalite <= 5) {
    return { color: 'from-emerald-500 to-teal-600', label: 'Excellente', textColor: 'text-emerald-300', bgColor: 'bg-emerald-500/20' };
  } else if (fcr <= 2.0 && croissanceNum >= 1.5 && mortalite <= 10) {
    return { color: 'from-blue-500 to-cyan-600', label: 'Bonne', textColor: 'text-blue-300', bgColor: 'bg-blue-500/20' };
  } else if (fcr <= 2.5 && croissanceNum >= 1.0 && mortalite <= 15) {
    return { color: 'from-amber-500 to-orange-600', label: 'Moyenne', textColor: 'text-amber-300', bgColor: 'bg-amber-500/20' };
  } else {
    return { color: 'from-red-500 to-pink-600', label: 'Critique', textColor: 'text-red-300', bgColor: 'bg-red-500/20' };
  }
};

const Cages = () => {
  const [cages, setCages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadCages();
    }
  }, [user]);

  const loadCages = async () => {
    try {
      const { data: cagesData, error } = await supabase
        .from('cages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculer les coûts de production pour chaque cage
      const cagesWithCosts = await Promise.all((cagesData || []).map(async (cage) => {
        const { data: costs } = await supabase
          .from('financial_data')
          .select('montant')
          .eq('user_id', user?.id)
          .eq('cage_id', cage.id)
          .eq('type_transaction', 'expense');

        const production_cost = costs?.reduce((sum, cost) => sum + cost.montant, 0) || 0;
        return { ...cage, production_cost };
      }));

      setCages(cagesWithCosts);
    } catch (error) {
      console.error('Error loading cages:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAllHistory = async () => {
    if (!user) return;

    try {
      // Récupérer l'historique de toutes les cages
      const { data: allHistory, error } = await supabase
        .from('cage_history')
        .select(`
          *,
          cages!inner(nom, espece)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const fieldLabels: { [key: string]: string } = {
        nom: "Nom",
        espece: "Espèce",
        nombre_poissons: "Nombre de poissons",
        poids_moyen: "Poids moyen (kg)",
        statut: "Statut",
        date_introduction: "Date d'introduction",
        fcr: "FCR",
        croissance: "Croissance",
        creation: "Création"
      };

      const exportData = allHistory.map(record => ({
        'Date': new Date(record.created_at).toLocaleString('fr-FR'),
        'Cage': record.cages.nom,
        'Espèce': record.cages.espece,
        'Champ modifié': fieldLabels[record.field_name] || record.field_name,
        'Ancienne valeur': record.old_value || 'N/A',
        'Nouvelle valeur': record.new_value || 'N/A',
        'Type': record.change_type === 'create' ? 'Création' : 'Modification'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Historique_Complet');
      
      // Ajuster la largeur des colonnes
      const colWidths = [
        { wch: 20 }, // Date
        { wch: 15 }, // Cage
        { wch: 15 }, // Espèce
        { wch: 20 }, // Champ modifié
        { wch: 15 }, // Ancienne valeur
        { wch: 15 }, // Nouvelle valeur
        { wch: 18 }  // Type
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `Historique_Toutes_Cages_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export réussi",
        description: "L'historique complet a été exporté en Excel."
      });
    } catch (error) {
      console.error('Error exporting history:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export de l'historique.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 animate-fade-in flex items-center justify-center">
        <div className="text-white text-lg">Chargement des cages...</div>
      </div>
    );
  }

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
        <div className="flex gap-3">
          <Button
            onClick={exportAllHistory}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter historique
          </Button>
          <NewCageModal />
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700 text-center w-full">Cages actives</CardTitle>
            <Fish className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-ocean-800">
              {cages.filter(c => c.statut === 'actif').length}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700 text-center w-full">Total poissons</CardTitle>
            <Users className="h-5 w-5 text-aqua-600" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-aqua-800">
              {cages.reduce((acc, cage) => acc + cage.nombre_poissons, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 text-center w-full">Poids moyen</CardTitle>
            <Weight className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-gray-800">
              {cages.filter(c => c.statut === 'actif').length > 0 ? (
                (cages
                  .filter(c => c.statut === 'actif')
                  .reduce((acc, cage) => acc + Number(cage.poids_moyen), 0) / 
                  cages.filter(c => c.statut === 'actif').length
                ).toFixed(1)
              ) : '0'}kg
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 text-center w-full">FCR moyen</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-gray-800">
              {cages.filter(c => c.statut === 'actif').length > 0 ? (
                (cages
                  .filter(c => c.statut === 'actif')
                  .reduce((acc, cage) => acc + Number(cage.fcr), 0) / 
                  cages.filter(c => c.statut === 'actif').length
                ).toFixed(1)
              ) : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des cages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cages.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Fish className="h-16 w-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 text-lg mb-4">Aucune cage créée</p>
            <NewCageModal />
          </div>
        ) : (
          cages.map((cage) => {
            const performance = getPerformanceColor(
              Number(cage.fcr) || 0,
              cage.croissance || '0%',
              Number(cage.taux_mortalite) || 0
            );
            const survivalRate = 100 - (Number(cage.taux_mortalite) || 0);
            
            return (
            <Card key={cage.id} className="group relative bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg hover:from-white/20 hover:to-white/10 transition-all duration-500 hover-scale shadow-2xl border-2 border-white/20 overflow-hidden">
              {/* Effet de lueur animée selon la performance */}
              <div className={`absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-br ${performance.color}`}></div>
              
              {/* Barre de performance en haut */}
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${performance.color} animate-pulse`}></div>
              
              {/* Badge de performance flottant */}
              <div className="absolute top-4 right-4 z-10">
                <div className={`${performance.bgColor} backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 shadow-xl`}>
                  <span className={`${performance.textColor} text-sm font-bold`}>Performance: {performance.label}</span>
                </div>
              </div>
              
              <CardHeader className="pb-4 relative z-10">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-white flex items-center gap-3 text-xl font-bold group-hover:text-cyan-300 transition-colors duration-300">
                      <div className="relative">
                        <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                          <Fish className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-xl blur opacity-40 group-hover:opacity-70 transition-opacity"></div>
                      </div>
                      <span className="truncate bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">{cage.nom}</span>
                    </CardTitle>
                    <p className="text-white/80 mt-2 text-base font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                      {cage.espece}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <Badge className={`${getStatutColor(cage.statut)} text-sm font-bold px-4 py-2 rounded-xl shadow-xl border-2 border-white/20`}>
                      {cage.statut.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mt-4">
                  <EditCageModal cage={cage} onCageUpdated={loadCages} />
                  <CageHistoryModal cage={cage} />
                  <CageDailyHistoryModal cage={cage} />
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-6 relative z-10">
                {cage.statut === 'actif' ? (
                  <div className="space-y-6">
                    {/* Métriques principales en grid premium */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group/metric bg-gradient-to-br from-blue-600/30 to-indigo-600/30 p-5 rounded-2xl border-2 border-blue-400/40 hover:border-blue-300/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-xl relative overflow-hidden">
                        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="text-blue-300 text-sm font-bold mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          FCR
                        </div>
                        <div className="text-white font-black text-3xl group-hover/metric:text-blue-300 transition-colors">
                          {cage.fcr || '0'}
                        </div>
                      </div>
                      
                      <div className="group/metric bg-gradient-to-br from-emerald-600/30 to-teal-600/30 p-5 rounded-2xl border-2 border-emerald-400/40 hover:border-emerald-300/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-xl relative overflow-hidden">
                        <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                        <div className="text-emerald-300 text-sm font-bold mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          Survie
                        </div>
                        <div className="text-white font-black text-3xl group-hover/metric:text-emerald-300 transition-colors">
                          {survivalRate.toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="group/metric bg-gradient-to-br from-purple-600/30 to-pink-600/30 p-5 rounded-2xl border-2 border-purple-400/40 hover:border-purple-300/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-xl relative overflow-hidden">
                        <div className="absolute top-2 right-2 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                        <div className="text-purple-300 text-sm font-bold mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                          Croissance
                        </div>
                        <div className="text-white font-black text-3xl group-hover/metric:text-purple-300 transition-colors">
                          {cage.poids_moyen}kg
                        </div>
                      </div>
                      
                      <div className="group/metric bg-gradient-to-br from-amber-600/30 to-orange-600/30 p-5 rounded-2xl border-2 border-amber-400/40 hover:border-amber-300/60 transition-all duration-300 hover:scale-105 backdrop-blur-sm shadow-xl relative overflow-hidden">
                        <div className="absolute top-2 right-2 w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                        <div className="text-amber-300 text-sm font-bold mb-2 flex items-center gap-2">
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                          Revenus
                        </div>
                        <div className="text-white font-black text-2xl group-hover/metric:text-amber-300 transition-colors">
                          €{(cage.production_cost ? cage.production_cost * 1.4 : 8750).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Section détails avec animation */}
                    <div className="bg-gradient-to-br from-slate-900/40 to-slate-800/60 rounded-2xl p-6 border-2 border-cyan-500/20 backdrop-blur-sm shadow-inner space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-white/80 text-sm font-bold flex items-center gap-2">
                          <Users className="h-4 w-4 text-cyan-400" />
                          Poissons restants:
                        </span>
                        <div className="text-right">
                          <span className="text-white font-black text-xl">{cage.nombre_poissons.toLocaleString()}</span>
                          {cage.nombre_poissons_initial && cage.nombre_poissons_initial !== cage.nombre_poissons && (
                            <div className="text-xs text-white/60 font-medium">
                              sur {cage.nombre_poissons_initial.toLocaleString()} initial
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b border-white/10">
                        <span className="text-white/80 text-sm font-bold flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          Croissance:
                        </span>
                        <span className="text-green-400 font-black text-xl">{cage.croissance || '0%'}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3">
                        <span className="text-white/80 text-sm font-bold flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-400" />
                          Introduit:
                        </span>
                        <span className="text-white font-bold text-lg">
                          {cage.date_introduction ? new Date(cage.date_introduction).toLocaleDateString('fr-FR') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-900/20 rounded-2xl border border-white/10"></div>
                    <div className="relative z-10">
                      <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Fish className="h-8 w-8 text-cyan-400" />
                      </div>
                      <p className="text-white/80 text-lg font-medium mb-4">Cage disponible</p>
                      <Button variant="outline" className="bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400/30 text-white hover:from-blue-600 hover:to-cyan-600 font-bold shadow-xl">
                        Démarrer cycle
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Cages;
