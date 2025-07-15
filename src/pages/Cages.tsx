
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
import * as XLSX from 'xlsx';
import { HomeButton } from "@/components/HomeButton";


const getStatutColor = (statut: string) => {
  switch (statut) {
    case 'actif': return 'bg-green-100 text-green-800 border-green-200';
    case 'vide': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <HomeButton />
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
          cages.map((cage) => (
          <Card key={cage.id} className="glass-effect hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Fish className="h-5 w-5" />
                    {cage.nom}
                  </CardTitle>
                  <p className="text-white/70 mt-1">{cage.espece}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getStatutColor(cage.statut)}>
                    {cage.statut}
                  </Badge>
                  <div className="flex gap-2">
                    <EditCageModal cage={cage} onCageUpdated={loadCages} />
                    <CageHistoryModal cage={cage} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cage.statut === 'actif' ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Poissons:</span>
                    <span className="text-white font-semibold">{cage.nombre_poissons.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Poids moyen:</span>
                    <span className="text-white font-semibold">{cage.poids_moyen}kg</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">FCR:</span>
                    <span className="text-white font-semibold">{cage.fcr}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Coût production:</span>
                    <span className="text-yellow-400 font-semibold">
                      {cage.production_cost ? `${cage.production_cost.toLocaleString('fr-FR')}€` : 'N/A'}
                    </span>
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
                      {cage.date_introduction ? new Date(cage.date_introduction).toLocaleDateString('fr-FR') : 'N/A'}
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
          ))
        )}
      </div>
    </div>
  );
};

export default Cages;
