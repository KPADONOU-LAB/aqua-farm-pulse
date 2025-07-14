import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Package } from "lucide-react";

interface NewInventoryModalProps {
  trigger?: React.ReactNode;
}

const NewInventoryModal = ({ trigger }: NewInventoryModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    categorie: "",
    quantite: "",
    unite: "",
    stockMin: "",
    prixUnitaire: "",
    fournisseur: "",
    dateExpiration: "",
    notes: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Article ajouté au stock !",
      description: `${formData.nom}: ${formData.quantite} ${formData.unite} ajoutés`,
    });
    
    setFormData({
      nom: "",
      categorie: "",
      quantite: "",
      unite: "",
      stockMin: "",
      prixUnitaire: "",
      fournisseur: "",
      dateExpiration: "",
      notes: ""
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-aqua-gradient hover:bg-aqua-600 text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle entrée
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <Package className="h-5 w-5" />
            Nouvelle entrée de stock
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nom">Nom de l'article</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Granulés croissance premium"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categorie">Catégorie</Label>
              <Select 
                value={formData.categorie} 
                onValueChange={(value) => setFormData({ ...formData, categorie: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aliment">Aliment</SelectItem>
                  <SelectItem value="veterinaire">Produit vétérinaire</SelectItem>
                  <SelectItem value="materiel">Matériel</SelectItem>
                  <SelectItem value="equipement">Équipement</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="fournisseur">Fournisseur</Label>
              <Input
                id="fournisseur"
                value={formData.fournisseur}
                onChange={(e) => setFormData({ ...formData, fournisseur: e.target.value })}
                placeholder="AquaFeed Pro"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantite">Quantité</Label>
              <Input
                id="quantite"
                type="number"
                step="0.1"
                value={formData.quantite}
                onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                placeholder="2.5"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="unite">Unité</Label>
              <Select 
                value={formData.unite} 
                onValueChange={(value) => setFormData({ ...formData, unite: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="tonnes">tonnes</SelectItem>
                  <SelectItem value="litres">litres</SelectItem>
                  <SelectItem value="unités">unités</SelectItem>
                  <SelectItem value="flacons">flacons</SelectItem>
                  <SelectItem value="sachets">sachets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="stockMin">Stock minimum</Label>
              <Input
                id="stockMin"
                type="number"
                step="0.1"
                value={formData.stockMin}
                onChange={(e) => setFormData({ ...formData, stockMin: e.target.value })}
                placeholder="1.0"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prixUnitaire">Prix unitaire (€)</Label>
              <Input
                id="prixUnitaire"
                type="number"
                step="0.01"
                value={formData.prixUnitaire}
                onChange={(e) => setFormData({ ...formData, prixUnitaire: e.target.value })}
                placeholder="1200"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="dateExpiration">Date d'expiration</Label>
              <Input
                id="dateExpiration"
                type="date"
                value={formData.dateExpiration}
                onChange={(e) => setFormData({ ...formData, dateExpiration: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">Optionnel</p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informations complémentaires, conditions de stockage..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-aqua-gradient hover:bg-aqua-600">
              Ajouter au stock
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewInventoryModal;