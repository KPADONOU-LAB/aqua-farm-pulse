import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface NewFinancialEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const NewFinancialEntryModal = ({ open, onOpenChange, onSuccess }: NewFinancialEntryModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type_transaction: "",
    categorie: "",
    montant: "",
    description: "",
    date_transaction: new Date().toISOString().split('T')[0],
    reference_document: "",
    cage_id: ""
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('financial_data')
        .insert({
          user_id: user.id,
          type_transaction: formData.type_transaction,
          categorie: formData.categorie,
          montant: parseFloat(formData.montant),
          description: formData.description || null,
          date_transaction: formData.date_transaction,
          reference_document: formData.reference_document || null,
          cage_id: formData.cage_id || null
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Transaction financière enregistrée avec succès",
      });

      // Reset form
      setFormData({
        type_transaction: "",
        categorie: "",
        montant: "",
        description: "",
        date_transaction: new Date().toISOString().split('T')[0],
        reference_document: "",
        cage_id: ""
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'enregistrement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const transactionTypes = [
    { value: "income", label: "Revenu" },
    { value: "expense", label: "Dépense" },
    { value: "investment", label: "Investissement" }
  ];

  const categories = [
    { value: "food", label: "Alimentation" },
    { value: "medicine", label: "Médicaments" },
    { value: "equipment", label: "Équipements" },
    { value: "labor", label: "Personnel" },
    { value: "maintenance", label: "Maintenance" },
    { value: "sales", label: "Ventes" },
    { value: "utilities", label: "Services publics" },
    { value: "transport", label: "Transport" },
    { value: "certification", label: "Certifications" },
    { value: "insurance", label: "Assurances" },
    { value: "other", label: "Autre" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle Transaction</DialogTitle>
          <DialogDescription>
            Enregistrer une nouvelle transaction financière
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type_transaction">Type de transaction</Label>
            <Select
              value={formData.type_transaction}
              onValueChange={(value) => setFormData({ ...formData, type_transaction: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categorie">Catégorie</Label>
            <Select
              value={formData.categorie}
              onValueChange={(value) => setFormData({ ...formData, categorie: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner la catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="montant">Montant (€)</Label>
            <Input
              id="montant"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.montant}
              onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_transaction">Date</Label>
            <Input
              id="date_transaction"
              type="date"
              value={formData.date_transaction}
              onChange={(e) => setFormData({ ...formData, date_transaction: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description de la transaction..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_document">Référence document</Label>
            <Input
              id="reference_document"
              placeholder="Numéro de facture, reçu..."
              value={formData.reference_document}
              onChange={(e) => setFormData({ ...formData, reference_document: e.target.value })}
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
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};