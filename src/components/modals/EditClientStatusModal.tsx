import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  nom_entreprise: string;
  statut: string;
}

interface EditClientStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  client: Client | null;
}

export const EditClientStatusModal = ({ open, onOpenChange, onSuccess, client }: EditClientStatusModalProps) => {
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState(client?.statut || "");
  const { toast } = useToast();

  const statusOptions = [
    { value: "prospect", label: "Prospect" },
    { value: "actif", label: "Actif" },
    { value: "inactif", label: "Inactif" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('clients')
        .update({ statut: newStatus })
        .eq('id', client.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Statut du client modifié avec succès",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la modification du statut",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour le statut quand le client change
  if (client && newStatus !== client.statut) {
    setNewStatus(client.statut);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le statut du client</DialogTitle>
          <DialogDescription>
            Changez le statut pour "{client?.nom_entreprise}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="statut">Nouveau statut</Label>
            <Select
              value={newStatus}
              onValueChange={setNewStatus}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading || newStatus === client?.statut}>
              {loading ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};