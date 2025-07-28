import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFarm } from "@/contexts/FarmContext";
import { Plus, Fish } from "lucide-react";

interface NewCageModalProps {
  trigger?: React.ReactNode;
}

const NewCageModal = ({ trigger }: NewCageModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    espece: "",
    nombrePoissons: "",
    poidsMoyen: "",
    statut: "vide",
    dateIntroduction: "",
    notes: ""
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const { farmSettings, translate } = useFarm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from('cages').insert({
        user_id: user.id,
        nom: formData.nom,
        espece: formData.espece,
        nombre_poissons: parseInt(formData.nombrePoissons) || 0,
        poids_moyen: parseFloat(formData.poidsMoyen) || 0,
        date_introduction: formData.dateIntroduction || null,
        statut: formData.statut,
        notes: formData.notes || null
      });

      if (error) throw error;

      toast({
        title: "Cage créée avec succès !",
        description: `${formData.nom} avec ${formData.nombrePoissons} ${formData.espece} a été ajoutée.`,
      });
      
      setFormData({
        nom: "",
        espece: "",
        nombrePoissons: "",
        poidsMoyen: "",
        statut: "vide",
        dateIntroduction: "",
        notes: ""
      });
      setOpen(false);
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la cage. Veuillez réessayer.",
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
            Nouvelle cage
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <Fish className="h-5 w-5" />
            Nouvelle cage
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom">Nom de la cage</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Cage #005"
                required
              />
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
                  {farmSettings?.fish_species?.map((espece) => (
                    <SelectItem key={espece} value={espece.toLowerCase()}>
                      {espece}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombrePoissons">Nombre de poissons</Label>
              <Input
                id="nombrePoissons"
                type="number"
                value={formData.nombrePoissons}
                onChange={(e) => setFormData({ ...formData, nombrePoissons: e.target.value })}
                placeholder="2500"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="poidsMoyen">Poids moyen (kg)</Label>
              <Input
                id="poidsMoyen"
                type="number"
                step="0.1"
                value={formData.poidsMoyen}
                onChange={(e) => setFormData({ ...formData, poidsMoyen: e.target.value })}
                placeholder="1.2"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="statut">Statut de la cage</Label>
              <Select 
                value={formData.statut} 
                onValueChange={(value) => setFormData({ ...formData, statut: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vide">Vide</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dateIntroduction">Date d'introduction</Label>
              <Input
                id="dateIntroduction"
                type="date"
                value={formData.dateIntroduction}
                onChange={(e) => setFormData({ ...formData, dateIntroduction: e.target.value })}
                required={formData.statut === 'actif'}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Informations complémentaires..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="bg-aqua-gradient hover:bg-aqua-600">
              {loading ? "Création..." : "Créer la cage"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCageModal;