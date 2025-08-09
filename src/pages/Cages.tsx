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
import { useLanguage } from "@/contexts/LanguageContext";
import { useSyncedLanguage } from "@/hooks/useSyncedLanguage";
import * as XLSX from 'xlsx';
const getStatutColor = (statut: string) => {
  switch (statut) {
    case 'actif':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'vide':
      return 'bg-card text-muted-foreground border-border';
    case 'maintenance':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-card text-muted-foreground border-border';
  }
};
const getPerformanceColor = (fcr: number, croissance: string, mortalite: number, t: (key: string) => string) => {
  const croissanceNum = parseFloat(croissance?.replace('%', '') || '0');
  if (fcr <= 1.5 && croissanceNum >= 2.0 && mortalite <= 5) {
    return {
      color: 'from-success to-success/80',
      label: t('excellent_performance'),
      textColor: 'text-success',
      bgColor: 'bg-success/10',
      indicatorColor: 'bg-success'
    };
  } else if (fcr <= 2.0 && croissanceNum >= 1.5 && mortalite <= 10) {
    return {
      color: 'from-primary to-primary/80',
      label: t('good_performance'),
      textColor: 'text-primary',
      bgColor: 'bg-primary/10',
      indicatorColor: 'bg-primary'
    };
  } else if (fcr <= 2.5 && croissanceNum >= 1.0 && mortalite <= 15) {
    return {
      color: 'from-warning to-warning/80',
      label: t('average_performance'),
      textColor: 'text-warning',
      bgColor: 'bg-warning/10',
      indicatorColor: 'bg-warning'
    };
  } else {
    return {
      color: 'from-destructive to-destructive/80',
      label: t('critical_performance'),
      textColor: 'text-destructive',
      bgColor: 'bg-destructive/10',
      indicatorColor: 'bg-destructive'
    };
  }
};
const Cages = () => {
  const [cages, setCages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    t
  } = useLanguage();
  useSyncedLanguage(); // Ensure language synchronization

  useEffect(() => {
    if (user) {
      loadCages();
    }
  }, [user]);
  const loadCages = async () => {
    try {
      const {
        data: cagesData,
        error
      } = await supabase.from('cages').select('*').eq('user_id', user?.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;

      // Calculer les coûts de production pour chaque cage
      const cagesWithCosts = await Promise.all((cagesData || []).map(async cage => {
        const {
          data: costs
        } = await supabase.from('financial_data').select('montant').eq('user_id', user?.id).eq('cage_id', cage.id).eq('type_transaction', 'expense');
        const production_cost = costs?.reduce((sum, cost) => sum + cost.montant, 0) || 0;
        return {
          ...cage,
          production_cost
        };
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
      const {
        data: allHistory,
        error
      } = await supabase.from('cage_history').select(`
          *,
          cages!inner(nom, espece)
        `).eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      const fieldLabels: {
        [key: string]: string;
      } = {
        nom: t('name'),
        espece: t('species'),
        nombre_poissons: t('fish_count'),
        poids_moyen: t('average_weight_kg'),
        statut: t('status'),
        date_introduction: t('introduction_date'),
        fcr: "FCR",
        croissance: t('growth'),
        creation: t('creation')
      };
      const exportData = allHistory.map(record => ({
        [t('date')]: new Date(record.created_at).toLocaleString(t('language') === 'fr' ? 'fr-FR' : 'en-US'),
        [t('cage')]: record.cages.nom,
        [t('species')]: record.cages.espece,
        [t('modified_field')]: fieldLabels[record.field_name] || record.field_name,
        [t('old_value')]: record.old_value || 'N/A',
        [t('new_value')]: record.new_value || 'N/A',
        [t('type')]: record.change_type === 'create' ? t('creation') : t('modification')
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t('complete_history'));

      // Ajuster la largeur des colonnes
      const colWidths = [{
        wch: 20
      },
      // Date
      {
        wch: 15
      },
      // Cage
      {
        wch: 15
      },
      // Espèce
      {
        wch: 20
      },
      // Champ modifié
      {
        wch: 15
      },
      // Ancienne valeur
      {
        wch: 15
      },
      // Nouvelle valeur
      {
        wch: 18
      } // Type
      ];
      ws['!cols'] = colWidths;
      const fileName = `${t('history_all_cages')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast({
        title: t('export_success'),
        description: t('export_complete_description')
      });
    } catch (error) {
      console.error('Error exporting history:', error);
      toast({
        title: t('error'),
        description: t('export_error_description'),
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="flex flex-col items-center gap-4">
          <Fish className="h-8 w-8 animate-pulse text-primary" />
          <p className="text-muted-foreground">{t('loading_cages')}</p>
        </div>
      </div>;
  }
  return <div className="container mx-auto p-6 space-y-8 animate-fade-in bg-neutral-50">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('cage_management')}</h1>
            <p className="text-muted-foreground">
              {t('cage_management_description')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportAllHistory} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t('export_history')}
            </Button>
            <NewCageModal />
          </div>
        </div>
      </div>

      {/* Statistiques Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700">{t('active_cages')}</CardTitle>
            <Fish className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocean-800">
              {cages.filter(c => c.statut === 'actif').length}
            </div>
            <p className="text-xs text-ocean-600">
              {t('language') === 'fr' ? `Sur ${cages.length} total` : `Out of ${cages.length} total`}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700">{t('total_fish')}</CardTitle>
            <Users className="h-5 w-5 text-aqua-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aqua-800">
              {cages.reduce((acc, cage) => acc + cage.nombre_poissons, 0).toLocaleString()}
            </div>
            <p className="text-xs text-aqua-600">
              {t('fish_being_raised')}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">{t('average_weight')}</CardTitle>
            <Weight className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {cages.filter(c => c.statut === 'actif').length > 0 ? (cages.filter(c => c.statut === 'actif').reduce((acc, cage) => acc + Number(cage.poids_moyen), 0) / cages.filter(c => c.statut === 'actif').length).toFixed(1) : '0'}kg
            </div>
            <p className="text-xs text-muted-foreground">
              {t('weight_per_fish')}
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">{t('average_fcr')}</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {cages.filter(c => c.statut === 'actif').length > 0 ? (cages.filter(c => c.statut === 'actif').reduce((acc, cage) => acc + Number(cage.fcr), 0) / cages.filter(c => c.statut === 'actif').length).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('conversion_ratio')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Cages */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('your_cages')}</h2>
          {cages.length > 0 && <p className="text-sm text-muted-foreground">
              {t('language') === 'fr' ? `${cages.length} cage${cages.length > 1 ? 's' : ''} au total` : `${cages.length} cage${cages.length > 1 ? 's' : ''} total`}
            </p>}
        </div>

        {cages.length === 0 ? <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Fish className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('no_cages_created')}</h3>
              <p className="text-muted-foreground mb-4 text-center">
                {t('create_first_cage_description')}
              </p>
              <NewCageModal />
            </CardContent>
          </Card> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cages.map(cage => {
          const performance = getPerformanceColor(Number(cage.fcr) || 0, cage.croissance || '0%', Number(cage.taux_mortalite) || 0, t);
          const survivalRate = 100 - (Number(cage.taux_mortalite) || 0);
          return <Card key={cage.id} className="group hover-scale relative overflow-hidden">
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
                    {cage.statut === 'actif' ? <div className="space-y-4">
                        {/* Métriques clés */}
                         <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1">
                             <p className="text-sm text-muted-foreground">FCR</p>
                             <p className="text-lg font-semibold">{cage.fcr || '0'}</p>
                           </div>
                           <div className="space-y-1">
                             <p className="text-sm text-muted-foreground">{t('survival')}</p>
                             <p className="text-lg font-semibold">{survivalRate.toFixed(1)}%</p>
                           </div>
                           <div className="space-y-1">
                             <p className="text-sm text-muted-foreground">{t('average_weight')}</p>
                             <p className="text-lg font-semibold">{cage.poids_moyen}kg</p>
                           </div>
                           <div className="space-y-1">
                             <p className="text-sm text-muted-foreground">{t('estimated_revenue')}</p>
                             <p className="text-lg font-semibold">
                               €{(cage.production_cost ? cage.production_cost * 1.4 : 8750).toLocaleString()}
                             </p>
                           </div>
                         </div>
                        
                         <div className="rounded-lg bg-card/50 backdrop-blur-sm border border-border/20 p-4 space-y-2">
                           <div className="flex justify-between text-sm">
                             <span className="text-muted-foreground">{t('remaining_fish')}</span>
                             <span className="font-semibold">{cage.nombre_poissons.toLocaleString()}</span>
                           </div>
                            {cage.nombre_poissons_initial && cage.nombre_poissons_initial !== cage.nombre_poissons && <div className="text-xs text-muted-foreground">
                                {t('language') === 'fr' ? `sur ${cage.nombre_poissons_initial.toLocaleString()} initial` : `out of ${cage.nombre_poissons_initial.toLocaleString()} initial`}
                              </div>}
                           <div className="flex justify-between text-sm">
                             <span className="text-muted-foreground">{t('growth')}</span>
                             <span className="font-semibold text-success">{cage.croissance || '0%'}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                             <span className="text-muted-foreground">{t('introduction_date')}</span>
                             <span className="font-semibold">
                               {cage.date_introduction ? new Date(cage.date_introduction).toLocaleDateString(t('language') === 'fr' ? 'fr-FR' : 'en-US') : 'N/A'}
                             </span>
                           </div>
                         </div>
                      </div> : <div className="text-center py-8">
                         <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mx-auto mb-4">
                           <Fish className="h-8 w-8 text-muted-foreground" />
                         </div>
                         <p className="text-muted-foreground mb-4">{t('cage_available')}</p>
                         <Button variant="outline" size="sm">
                           {t('start_cycle')}
                         </Button>
                       </div>}
                  </CardContent>
                </Card>;
        })}
          </div>}
      </div>
    </div>;
};
export default Cages;