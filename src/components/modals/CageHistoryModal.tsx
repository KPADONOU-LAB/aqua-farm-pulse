import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface CageHistoryModalProps {
  cage: any;
}

interface HistoryRecord {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  change_type: string;
  created_at: string;
}

const fieldLabels: { [key: string]: string } = {
  nom: "Nom",
  espece: "Espèce",
  nombre_poissons: "Nombre de poissons",
  poids_moyen: "Poids moyen (kg)",
  statut: "Statut",
  date_introduction: "Date d'introduction",
  fcr: "FCR",
  croissance: "Croissance",
  creation: "Création",
  vente: "Vente/Récolte",
  fin_cycle: "Fin de cycle",
  metrics_finales: "Métriques finales",
  rentabilite: "Rentabilité calculée",
  cycle_complet: "Cycle terminé"
};

const CageHistoryModal = ({ cage }: CageHistoryModalProps) => {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cage_history')
        .select('*')
        .eq('cage_id', cage.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement de l'historique.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open]);

  const exportToExcel = () => {
    const exportData = history.map(record => ({
      'Date': new Date(record.created_at).toLocaleString('fr-FR'),
      'Champ modifié': fieldLabels[record.field_name] || record.field_name,
      'Ancienne valeur': record.old_value || 'N/A',
      'Nouvelle valeur': record.new_value || 'N/A',
      'Type de modification': record.change_type === 'create' ? 'Création' : 
                         record.change_type === 'sale' ? 'Vente/Récolte' :
                         record.change_type === 'end_cycle' ? 'Fin de cycle' :
                         'Modification'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historique');
    
    // Ajuster la largeur des colonnes
    const colWidths = [
      { wch: 20 }, // Date
      { wch: 20 }, // Champ modifié
      { wch: 15 }, // Ancienne valeur
      { wch: 15 }, // Nouvelle valeur
      { wch: 18 }  // Type de modification
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `Historique_${cage.nom}_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Export réussi",
      description: "L'historique a été exporté en Excel."
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full sm:w-auto justify-center gap-1"
        >
          <History className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Historique</span>
          <span className="sr-only sm:hidden">Historique</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Historique - {cage.nom}</span>
            <Button
              onClick={exportToExcel}
              variant="outline"
              size="sm"
              disabled={history.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter Excel
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Chargement de l'historique...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune modification enregistrée pour cette cage.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Champ modifié</TableHead>
                  <TableHead>Ancienne valeur</TableHead>
                  <TableHead>Nouvelle valeur</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(record.created_at).toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {fieldLabels[record.field_name] || record.field_name}
                    </TableCell>
                    <TableCell className="text-red-600">
                      {record.old_value || 'N/A'}
                    </TableCell>
                    <TableCell className="text-green-600">
                      {record.new_value || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.change_type === 'create' 
                          ? 'bg-blue-100 text-blue-800' 
                          : record.change_type === 'sale'
                          ? 'bg-green-100 text-green-800'
                          : record.change_type === 'end_cycle'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.change_type === 'create' ? 'Création' : 
                         record.change_type === 'sale' ? 'Vente/Récolte' :
                         record.change_type === 'end_cycle' ? 'Fin de cycle' :
                         'Modification'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CageHistoryModal;