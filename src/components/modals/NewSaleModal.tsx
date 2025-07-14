import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, ShoppingCart } from "lucide-react";

interface NewSaleModalProps {
  trigger?: React.ReactNode;
}

const NewSaleModal = ({ trigger }: NewSaleModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    cage: "",
    client: "",
    espece: "",
    quantite: "",
    nombrePoissons: "",
    prixUnitaire: "",
    notes: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const montantTotal = parseFloat(formData.quantite) * parseFloat(formData.prixUnitaire);
    
    toast({
      title: "Vente enregistrée !",
      description: `${formData.quantite}kg vendus à ${formData.client} pour €${montantTotal.toFixed(2)}`,
    });
    
    setFormData({
      cage: "",
      client: "",
      espece: "",
      quantite: "",
      nombrePoissons: "",
      prixUnitaire: "",
      notes: ""
    });
    setOpen(false);
  };

  const montantTotal = parseFloat(formData.quantite || "0") * parseFloat(formData.prixUnitaire || "0");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-aqua-gradient hover:bg-aqua-600 text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle vente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <ShoppingCart className="h-5 w-5" />
            Nouvelle vente
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cage">Cage d'origine</Label>
              <Select 
                value={formData.cage} 
                onValueChange={(value) => setFormData({ ...formData, cage: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cage001">Cage #001 (Tilapia)</SelectItem>
                  <SelectItem value="cage002">Cage #002 (Bar)</SelectItem>
                  <SelectItem value="cage003">Cage #003 (Dorade)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="espece">Espèce</Label>
              <Select 
                value={formData.espece} 
                onValueChange={(value) => setFormData({ ...formData, espece: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tilapia">Tilapia</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="dorade">Dorade</SelectItem>
                  <SelectItem value="saumon">Saumon</SelectItem>
                  <SelectItem value="truite">Truite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
              placeholder="Restaurant Le Neptune"
              required
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantite">Quantité (kg)</Label>
              <Input
                id="quantite"
                type="number"
                step="0.1"
                value={formData.quantite}
                onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                placeholder="85.5"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="nombrePoissons">Nombre de poissons</Label>
              <Input
                id="nombrePoissons"
                type="number"
                value={formData.nombrePoissons}
                onChange={(e) => setFormData({ ...formData, nombrePoissons: e.target.value })}
                placeholder="95"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="prixUnitaire">Prix/kg (€)</Label>
              <Input
                id="prixUnitaire"
                type="number"
                step="0.01"
                value={formData.prixUnitaire}
                onChange={(e) => setFormData({ ...formData, prixUnitaire: e.target.value })}
                placeholder="8.50"
                required
              />
            </div>
          </div>
          
          {montantTotal > 0 && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-green-800">Montant total:</span>
                <span className="text-xl font-bold text-green-900">€{montantTotal.toFixed(2)}</span>
              </div>
              {formData.quantite && formData.nombrePoissons && (
                <div className="text-sm text-green-700 mt-1">
                  Poids moyen: {(parseFloat(formData.quantite) / parseFloat(formData.nombrePoissons)).toFixed(2)}kg/poisson
                </div>
              )}
            </div>
          )}
          
          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Conditions de livraison, remarques..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-aqua-gradient hover:bg-aqua-600">
              Enregistrer la vente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewSaleModal;