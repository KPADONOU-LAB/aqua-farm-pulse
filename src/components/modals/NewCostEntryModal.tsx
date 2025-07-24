import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Euro } from "lucide-react";
import { useCostTracking } from "@/hooks/useCostTracking";

interface NewCostEntryModalProps {
  cageId?: string;
  onCostAdded?: () => void;
}

const COST_CATEGORIES = [
  { value: 'aliments', label: 'Aliments' },
  { value: 'alevins', label: 'Alevins' },
  { value: 'medicaments', label: 'Médicaments' },
  { value: 'personnel', label: 'Personnel' },
  { value: 'equipement', label: 'Équipement' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'transport', label: 'Transport' },
  { value: 'energie', label: 'Énergie' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'autres', label: 'Autres' }
];

export function NewCostEntryModal({ cageId, onCostAdded }: NewCostEntryModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    cage_id: cageId || '',
    date_cout: new Date().toISOString().split('T')[0],
    categorie_cout: '',
    sous_categorie: '',
    montant: '',
    quantite: '',
    unite: '',
    description: '',
    reference_facture: '',
    fournisseur: ''
  });

  const { addCostEntry } = useCostTracking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cage_id || !formData.categorie_cout || !formData.montant) {
      return;
    }

    try {
      const costData = {
        cage_id: formData.cage_id,
        date_cout: formData.date_cout,
        categorie_cout: formData.categorie_cout,
        sous_categorie: formData.sous_categorie || null,
        montant: parseFloat(formData.montant),
        quantite: formData.quantite ? parseFloat(formData.quantite) : null,
        unite: formData.unite || null,
        cout_unitaire: formData.quantite && formData.montant ? 
          parseFloat(formData.montant) / parseFloat(formData.quantite) : null,
        description: formData.description || null,
        reference_facture: formData.reference_facture || null,
        fournisseur: formData.fournisseur || null
      };

      await addCostEntry(costData);
      
      setFormData({
        cage_id: cageId || '',
        date_cout: new Date().toISOString().split('T')[0],
        categorie_cout: '',
        sous_categorie: '',
        montant: '',
        quantite: '',
        unite: '',
        description: '',
        reference_facture: '',
        fournisseur: ''
      });
      
      setOpen(false);
      onCostAdded?.();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du coût:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nouveau coût
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Ajouter un coût
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_cout">Date</Label>
              <Input
                id="date_cout"
                type="date"
                value={formData.date_cout}
                onChange={(e) => setFormData(prev => ({ ...prev, date_cout: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="montant">Montant (€)</Label>
              <Input
                id="montant"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.montant}
                onChange={(e) => setFormData(prev => ({ ...prev, montant: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categorie_cout">Catégorie</Label>
            <Select
              value={formData.categorie_cout}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categorie_cout: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {COST_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sous_categorie">Sous-catégorie (optionnel)</Label>
            <Input
              id="sous_categorie"
              placeholder="Ex: Aliment croissance, Essence..."
              value={formData.sous_categorie}
              onChange={(e) => setFormData(prev => ({ ...prev, sous_categorie: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantite">Quantité (optionnel)</Label>
              <Input
                id="quantite"
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.quantite}
                onChange={(e) => setFormData(prev => ({ ...prev, quantite: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unite">Unité</Label>
              <Input
                id="unite"
                placeholder="kg, L, unité..."
                value={formData.unite}
                onChange={(e) => setFormData(prev => ({ ...prev, unite: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fournisseur">Fournisseur (optionnel)</Label>
            <Input
              id="fournisseur"
              placeholder="Nom du fournisseur"
              value={formData.fournisseur}
              onChange={(e) => setFormData(prev => ({ ...prev, fournisseur: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_facture">Référence facture (optionnel)</Label>
            <Input
              id="reference_facture"
              placeholder="Numéro de facture"
              value={formData.reference_facture}
              onChange={(e) => setFormData(prev => ({ ...prev, reference_facture: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description détaillée du coût..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Ajouter le coût
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}