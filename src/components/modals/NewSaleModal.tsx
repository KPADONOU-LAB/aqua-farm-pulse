import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, ShoppingCart } from "lucide-react";

interface NewSaleModalProps {
  trigger?: React.ReactNode;
}

const NewSaleModal = ({ trigger }: NewSaleModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cages, setCages] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    cage: "",
    quantiteKg: "",
    prixParKg: "",
    client: "",
    typeVente: "",
    notes: ""
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCages();
    }
  }, [user]);

  const loadCages = async () => {
    const { data } = await supabase
      .from('cages')
      .select('id, nom')
      .eq('user_id', user?.id)
      .eq('statut', 'actif');
    setCages(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    try {
      const quantite = parseFloat(formData.quantiteKg);
      const prix = parseFloat(formData.prixParKg);
      const total = quantite * prix;

      const { error } = await supabase.from('sales').insert({
        user_id: user.id,
        cage_id: formData.cage,
        quantite_kg: quantite,
        prix_par_kg: prix,
        prix_total: total,
        client: formData.client,
        type_vente: formData.typeVente,
        notes: formData.notes || null
      });

      if (error) throw error;

      toast({
        title: "Vente enregistrée !",
        description: `${formData.quantiteKg}kg vendus pour €${total.toFixed(2)}`,
      });
      
      setFormData({
        cage: "",
        quantiteKg: "",
        prixParKg: "",
        client: "",
        typeVente: "",
        notes: ""
      });
      setOpen(false);
      // Recharger la page pour actualiser les données
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la vente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <ShoppingCart className="h-5 w-5" />
            Nouvelle vente
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cage">Cage</Label>
              <Select 
                value={formData.cage} 
                onValueChange={(value) => setFormData({ ...formData, cage: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {cages.map((cage) => (
                    <SelectItem key={cage.id} value={cage.id}>
                      {cage.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="typeVente">Type de vente</Label>
              <Select 
                value={formData.typeVente} 
                onValueChange={(value) => setFormData({ ...formData, typeVente: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gros">Gros</SelectItem>
                  <SelectItem value="detail">Détail</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="marche">Marché</SelectItem>
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
              placeholder="Nom du client"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantiteKg">Quantité (kg)</Label>
              <Input
                id="quantiteKg"
                type="number"
                step="0.1"
                value={formData.quantiteKg}
                onChange={(e) => setFormData({ ...formData, quantiteKg: e.target.value })}
                placeholder="150.5"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="prixParKg">Prix/kg (€)</Label>
              <Input
                id="prixParKg"
                type="number"
                step="0.01"
                value={formData.prixParKg}
                onChange={(e) => setFormData({ ...formData, prixParKg: e.target.value })}
                placeholder="8.50"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informations complémentaires..."
              rows={2}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-aqua-gradient hover:bg-aqua-600">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewSaleModal;