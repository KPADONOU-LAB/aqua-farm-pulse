
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Fish, Plus, TrendingUp, Calendar, Weight, Users, Download, Activity, DollarSign } from "lucide-react";
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
    case 'actif': return 'bg-success text-success-foreground border-success/50';
    case 'vide': return 'bg-muted text-muted-foreground border-muted';
    case 'maintenance': return 'bg-warning text-warning-foreground border-warning/50';
    default: return 'bg-secondary text-secondary-foreground border-secondary';
  }
};

const getPerformanceColor = (fcr: number, croissance: string, mortalite: number) => {
  const croissanceNum = parseFloat(croissance?.replace('%', '') || '0');
  
  if (fcr <= 1.5 && croissanceNum >= 2.0 && mortalite <= 5) {
    return { 
      color: 'from-success to-success/80', 
      label: 'Excellente', 
      textColor: 'text-success', 
      bgColor: 'bg-success/10',
      indicatorColor: 'bg-success'
    };
  } else if (fcr <= 2.0 && croissanceNum >= 1.5 && mortalite <= 10) {
    return { 
      color: 'from-primary to-primary/80', 
      label: 'Bonne', 
      textColor: 'text-primary', 
      bgColor: 'bg-primary/10',
      indicatorColor: 'bg-primary'
    };
  } else if (fcr <= 2.5 && croissanceNum >= 1.0 && mortalite <= 15) {
    return { 
      color: 'from-warning to-warning/80', 
      label: 'Moyenne', 
      textColor: 'text-warning', 
      bgColor: 'bg-warning/10',
      indicatorColor: 'bg-warning'
    };
  } else {
    return { 
      color: 'from-destructive to-destructive/80', 
      label: 'Critique', 
      textColor: 'text-destructive', 
      bgColor: 'bg-destructive/10',
      indicatorColor: 'bg-destructive'
    };
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
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <Fish className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-muted-foreground">Chargement des cages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-fade-in bg-background">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Gestion des cages</h1>
            <p className="text-muted-foreground">
              Surveillez et gérez vos installations piscicoles en temps réel
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={exportAllHistory}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter historique
            </Button>
            <NewCageModal />
          </div>
        </div>
      </div>

      {/* Statistiques Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cages actives</CardTitle>
            <Fish className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cages.filter(c => c.statut === 'actif').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Sur {cages.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total poissons</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cages.reduce((acc, cage) => acc + cage.nombre_poissons, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Poissons en élevage
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Poids moyen</CardTitle>
            <Weight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cages.filter(c => c.statut === 'actif').length > 0 ? (
                (cages
                  .filter(c => c.statut === 'actif')
                  .reduce((acc, cage) => acc + Number(cage.poids_moyen), 0) / 
                  cages.filter(c => c.statut === 'actif').length
                ).toFixed(1)
              ) : '0'}kg
            </div>
            <p className="text-xs text-muted-foreground">
              Poids par poisson
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">FCR moyen</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cages.filter(c => c.statut === 'actif').length > 0 ? (
                (cages
                  .filter(c => c.statut === 'actif')
                  .reduce((acc, cage) => acc + Number(cage.fcr), 0) / 
                  cages.filter(c => c.statut === 'actif').length
                ).toFixed(1)
              ) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Ratio de conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Cages */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Vos cages</h2>
          {cages.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {cages.length} cage{cages.length > 1 ? 's' : ''} au total
            </p>
          )}
        </div>

        {cages.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Fish className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune cage créée</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Commencez par créer votre première cage pour suivre vos installations piscicoles
              </p>
              <NewCageModal />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cages.map((cage) => {
              const performance = getPerformanceColor(
                Number(cage.fcr) || 0,
                cage.croissance || '0%',
                Number(cage.taux_mortalite) || 0
              );
              const survivalRate = 100 - (Number(cage.taux_mortalite) || 0);
              
              return (
                <Card key={cage.id} className="group hover-scale relative overflow-hidden">
                  {/* Indicateur de performance */}
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${performance.color}`}></div>
                  
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Fish className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold">{cage.nom}</CardTitle>
                          <p className="text-sm text-muted-foreground">{cage.espece}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatutColor(cage.statut)}>
                          {cage.statut}
                        </Badge>
                        <Badge variant="outline" className={`${performance.textColor} border-current`}>
                          {performance.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <EditCageModal cage={cage} onCageUpdated={loadCages} />
                      <CageHistoryModal cage={cage} />
                      <CageDailyHistoryModal cage={cage} />
                    </div>
                  </CardHeader>
              
                  <CardContent className="space-y-4">
                    {cage.statut === 'actif' ? (
                      <div className="space-y-4">
                        {/* Métriques clés */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">FCR</p>
                            <p className="text-lg font-semibold">{cage.fcr || '0'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Survie</p>
                            <p className="text-lg font-semibold">{survivalRate.toFixed(1)}%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Poids moyen</p>
                            <p className="text-lg font-semibold">{cage.poids_moyen}kg</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Revenus estimés</p>
                            <p className="text-lg font-semibold">
                              €{(cage.production_cost ? cage.production_cost * 1.4 : 8750).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* Détails de la cage */}
                        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Poissons restants</span>
                            <span className="font-semibold">{cage.nombre_poissons.toLocaleString()}</span>
                          </div>
                          {cage.nombre_poissons_initial && cage.nombre_poissons_initial !== cage.nombre_poissons && (
                            <div className="text-xs text-muted-foreground">
                              sur {cage.nombre_poissons_initial.toLocaleString()} initial
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Croissance</span>
                            <span className="font-semibold text-success">{cage.croissance || '0%'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Date introduction</span>
                            <span className="font-semibold">
                              {cage.date_introduction ? new Date(cage.date_introduction).toLocaleDateString('fr-FR') : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mx-auto mb-4">
                          <Fish className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground mb-4">Cage disponible</p>
                        <Button variant="outline" size="sm">
                          Démarrer cycle
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cages;
