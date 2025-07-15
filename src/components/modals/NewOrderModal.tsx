import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface NewOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Client {
  id: string;
  nom_entreprise: string;
}

export const NewOrderModal = ({ open, onOpenChange, onSuccess }: NewOrderModalProps) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    client_id: "",
    numero_commande: "",
    quantite_kg: "",
    prix_kg: "",
    type_poisson: "",
    date_livraison_prevue: "",
    notes: ""
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      loadClients();
      generateOrderNumber();
    }
  }, [open, user]);

  const loadClients = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('clients')
        .select('id, nom_entreprise')
        .eq('user_id', user.id)
        .eq('statut', 'actif')
        .order('nom_entreprise');

      setClients(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  const generateOrderNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.getTime().toString().slice(-4);
    
    setFormData(prev => ({
      ...prev,
      numero_commande: `CMD${year}${month}${day}${time}`
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const quantite = parseFloat(formData.quantite_kg);
      const prix = parseFloat(formData.prix_kg);
      const montantTotal = quantite * prix;

      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          client_id: formData.client_id,
          numero_commande: formData.numero_commande,
          statut: 'en_attente',
          date_commande: new Date().toISOString().split('T')[0],
          date_livraison_prevue: formData.date_livraison_prevue || null,
          montant_total: montantTotal,
          quantite_kg: quantite,
          prix_kg: prix,
          type_poisson: formData.type_poisson,
          notes: formData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Commande créée avec succès",
      });

      // Reset form
      setFormData({
        client_id: "",
        numero_commande: "",
        quantite_kg: "",
        prix_kg: "",
        type_poisson: "",
        date_livraison_prevue: "",
        notes: ""
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création de la commande",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fishTypes = [
    "Saumon",
    "Truite",
    "Bar",
    "Daurade",
    "Turbot",
    "Cabillaud",
    "Sole",
    "Loup de mer"
  ];

  const montantTotal = formData.quantite_kg && formData.prix_kg 
    ? (parseFloat(formData.quantite_kg) * parseFloat(formData.prix_kg)).toFixed(2)
    : '0.00';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle Commande</DialogTitle>
          <DialogDescription>
            Créer une nouvelle commande client
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">Client *</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => setFormData({ ...formData, client_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.nom_entreprise}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero_commande">Numéro de commande</Label>
            <div className="flex gap-2">
              <Input
                id="numero_commande"
                value={formData.numero_commande}
                onChange={(e) => setFormData({ ...formData, numero_commande: e.target.value })}
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateOrderNumber}
              >
                Générer
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type_poisson">Type de poisson *</Label>
            <Select
              value={formData.type_poisson}
              onValueChange={(value) => setFormData({ ...formData, type_poisson: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                {fishTypes.map((fish) => (
                  <SelectItem key={fish} value={fish}>
                    {fish}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantite_kg">Quantité (kg) *</Label>
              <Input
                id="quantite_kg"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.quantite_kg}
                onChange={(e) => setFormData({ ...formData, quantite_kg: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prix_kg">Prix/kg (€) *</Label>
              <Input
                id="prix_kg"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.prix_kg}
                onChange={(e) => setFormData({ ...formData, prix_kg: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Montant total:</span>
              <span className="text-lg font-bold">{montantTotal} €</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_livraison_prevue">Date de livraison prévue</Label>
            <Input
              id="date_livraison_prevue"
              type="date"
              value={formData.date_livraison_prevue}
              onChange={(e) => setFormData({ ...formData, date_livraison_prevue: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Instructions particulières..."
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
            <Button type="submit" disabled={loading || !formData.client_id}>
              {loading ? "Création..." : "Créer Commande"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};