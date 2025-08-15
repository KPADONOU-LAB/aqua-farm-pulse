import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, Fish, Droplets, Heart, TrendingUp, Euro, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCageMetrics } from '@/hooks/useCageMetrics';
import { useFarm } from '@/contexts/FarmContext';
import { toast } from 'sonner';
interface CageDailyHistoryModalProps {
  cage: any;
}
export const CageDailyHistoryModal = ({
  cage
}: CageDailyHistoryModalProps) => {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const {
    getCageDailyHistory,
    loading
  } = useCageMetrics();
  const {
    formatCurrency
  } = useFarm();
  const loadHistory = async () => {
    if (!cage?.id) return;
    try {
      const data = await getCageDailyHistory(cage.id);
      setHistory(data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    }
  };
  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open, cage?.id]);
  const formatActivities = (activities: any[], type: string) => {
    if (!activities || activities.length === 0) return null;
    const getIcon = () => {
      switch (type) {
        case 'alimentation':
          return <Fish className="h-4 w-4" />;
        case 'qualite_eau':
          return <Droplets className="h-4 w-4" />;
        case 'sante':
          return <Heart className="h-4 w-4" />;
        case 'ventes':
          return <TrendingUp className="h-4 w-4" />;
        case 'finance':
          return <Euro className="h-4 w-4" />;
        default:
          return <FileText className="h-4 w-4" />;
      }
    };
    const getTitle = () => {
      switch (type) {
        case 'alimentation':
          return 'Alimentation';
        case 'qualite_eau':
          return 'Qualité de l\'eau';
        case 'sante':
          return 'Santé';
        case 'ventes':
          return 'Ventes';
        case 'finance':
          return 'Finance';
        default:
          return type;
      }
    };
    return <Card key={type} className="mb-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {getIcon()}
            {getTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activities.map((activity, index) => <div key={index} className="p-2 bg-muted/50 rounded-md text-xs">
              {type === 'alimentation' && <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">{activity.heure}</span>
                    <Badge variant="outline" className="text-xs">
                      {activity.quantite}kg
                    </Badge>
                  </div>
                  <p><strong>Type:</strong> {activity.type_aliment}</p>
                  <p><strong>Appétit:</strong> {activity.appetit}</p>
                  {activity.observations && <p><strong>Observations:</strong> {activity.observations}</p>}
                </div>}

              {type === 'qualite_eau' && <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">{activity.heure}</span>
                    <Badge variant={activity.statut === 'optimal' ? 'default' : 'destructive'}>
                      {activity.statut}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p><strong>T°:</strong> {activity.temperature}°C</p>
                    <p><strong>pH:</strong> {activity.ph}</p>
                    <p><strong>O2:</strong> {activity.oxygene_dissous} mg/L</p>
                    {activity.turbidite && <p><strong>Turbidité:</strong> {activity.turbidite} NTU</p>}
                  </div>
                  {activity.observations && <p className="mt-1"><strong>Observations:</strong> {activity.observations}</p>}
                </div>}

              {type === 'sante' && <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={activity.statut === 'normal' ? 'default' : 'destructive'}>
                      {activity.statut}
                    </Badge>
                    {activity.mortalite > 0 && <Badge variant="destructive">
                        {activity.mortalite} morts
                      </Badge>}
                  </div>
                  <p><strong>Observations:</strong> {activity.observations}</p>
                  {activity.cause_presumee && <p><strong>Cause présumée:</strong> {activity.cause_presumee}</p>}
                  {activity.traitements && activity.traitements.length > 0 && <p><strong>Traitements:</strong> {activity.traitements.join(', ')}</p>}
                </div>}

              {type === 'ventes' && <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="default">
                      {activity.quantite_kg}kg
                    </Badge>
                    <Badge variant="outline">
                      {formatCurrency(activity.prix_total)}
                    </Badge>
                  </div>
                  <p><strong>Client:</strong> {activity.client}</p>
                  <p><strong>Type:</strong> {activity.type_vente}</p>
                  <p><strong>Prix/kg:</strong> {formatCurrency(activity.prix_par_kg)}</p>
                  {activity.notes && <p><strong>Notes:</strong> {activity.notes}</p>}
                </div>}

              {type === 'finance' && <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={activity.type_transaction === 'income' ? 'default' : 'destructive'}>
                      {activity.type_transaction === 'income' ? 'Recette' : 'Dépense'}
                    </Badge>
                    <Badge variant="outline">
                      {formatCurrency(activity.montant)}
                    </Badge>
                  </div>
                  <p><strong>Catégorie:</strong> {activity.categorie}</p>
                  <p><strong>Description:</strong> {activity.description}</p>
                  {activity.reference_document && <p><strong>Référence:</strong> {activity.reference_document}</p>}
                </div>}
            </div>)}
        </CardContent>
      </Card>;
  };
  const hasActivities = (day: any) => {
    return day.alimentation && day.alimentation.length > 0 || day.qualite_eau && day.qualite_eau.length > 0 || day.sante && day.sante.length > 0 || day.ventes && day.ventes.length > 0 || day.finance && day.finance.length > 0;
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:w-auto justify-center gap-1 py-0 px-0">
          <Calendar className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Historique journalier</span>
          <span className="sr-only sm:hidden">Historique journalier</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            Historique journalier - {cage.nom} ({cage.espece})
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          {loading ? <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div> : history.length === 0 ? <div className="text-center p-8 text-muted-foreground">
              Aucun historique disponible pour cette cage.
            </div> : <div className="space-y-6">
              {history.map((day, index) => <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">
                      {format(new Date(day.date_activite), 'EEEE d MMMM yyyy', {
                  locale: fr
                })}
                    </h3>
                  </div>

                  {hasActivities(day) ? <div className="grid gap-4 md:grid-cols-2">
                      {day.alimentation && day.alimentation.length > 0 && formatActivities(day.alimentation, 'alimentation')}
                      {day.qualite_eau && day.qualite_eau.length > 0 && formatActivities(day.qualite_eau, 'qualite_eau')}
                      {day.sante && day.sante.length > 0 && formatActivities(day.sante, 'sante')}
                      {day.ventes && day.ventes.length > 0 && formatActivities(day.ventes, 'ventes')}
                      {day.finance && day.finance.length > 0 && formatActivities(day.finance, 'finance')}
                    </div> : <p className="text-muted-foreground text-sm">
                      Aucune activité enregistrée ce jour-là.
                    </p>}
                </div>)}
            </div>}
        </ScrollArea>
      </DialogContent>
    </Dialog>;
};