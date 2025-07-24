import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  nom_entreprise: string;
  contact_principal?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  type_client: string;
  statut: string;
  notes?: string;
  chiffre_affaires_annuel: number;
}

interface EditClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  client: Client | null;
}

export const EditClientModal = ({ open, onOpenChange, onSuccess, client }: EditClientModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom_entreprise: "",
    contact_principal: "",
    email: "",
    telephone: "",
    adresse: "",
    type_client: "standard",
    statut: "prospect",
    notes: "",
    chiffre_affaires_annuel: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (client) {
      setFormData({
        nom_entreprise: client.nom_entreprise,
        contact_principal: client.contact_principal || "",
        email: client.email || "",
        telephone: client.telephone || "",
        adresse: client.adresse || "",
        type_client: client.type_client,
        statut: client.statut,
        notes: client.notes || "",
        chiffre_affaires_annuel: client.chiffre_affaires_annuel
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('clients')
        .update({
          nom_entreprise: formData.nom_entreprise,
          contact_principal: formData.contact_principal || null,
          email: formData.email || null,
          telephone: formData.telephone || null,
          adresse: formData.adresse || null,
          type_client: formData.type_client,
          statut: formData.statut,
          notes: formData.notes || null,
          chiffre_affaires_annuel: formData.chiffre_affaires_annuel
        })
        .eq('id', client.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Client modifié avec succès",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la modification du client",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clientTypes = [
    { value: "standard", label: "Standard" },
    { value: "premium", label: "Premium" },
    { value: "occasional", label: "Occasionnel" }
  ];

  const statusOptions = [
    { value: "prospect", label: "Prospect" },
    { value: "actif", label: "Actif" },
    { value: "inactif", label: "Inactif" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
          <DialogDescription>
            Modifiez les informations de "{client?.nom_entreprise}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom_entreprise">Nom de l'entreprise *</Label>
            <Input
              id="nom_entreprise"
              placeholder="Ex: Restaurant Le Gourmet"
              value={formData.nom_entreprise}
              onChange={(e) => setFormData({ ...formData, nom_entreprise: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_principal">Contact principal</Label>
            <Input
              id="contact_principal"
              placeholder="Nom du responsable"
              value={formData.contact_principal}
              onChange={(e) => setFormData({ ...formData, contact_principal: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@entreprise.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              placeholder="01 23 45 67 89"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Textarea
              id="adresse"
              placeholder="Adresse complète..."
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type_client">Type de client</Label>
              <Select
                value={formData.type_client}
                onValueChange={(value) => setFormData({ ...formData, type_client: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clientTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select
                value={formData.statut}
                onValueChange={(value) => setFormData({ ...formData, statut: value })}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="chiffre_affaires_annuel">Chiffre d'affaires annuel (€)</Label>
            <Input
              id="chiffre_affaires_annuel"
              type="number"
              placeholder="0"
              value={formData.chiffre_affaires_annuel}
              onChange={(e) => setFormData({ ...formData, chiffre_affaires_annuel: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Informations complémentaires..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Modification..." : "Modifier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};