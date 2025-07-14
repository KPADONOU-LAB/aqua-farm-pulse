import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface EditCageModalProps {
  cage: any;
  onCageUpdated: () => void;
}

const EditCageModal = ({ cage, onCageUpdated }: EditCageModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nom: cage.nom || "",
    espece: cage.espece || "",
    nombrePoissons: cage.nombre_poissons?.toString() || "",
    poidsMoyen: cage.poids_moyen?.toString() || "",
    statut: cage.statut || "vide",
    dateIntroduction: cage.date_introduction || "",
    fcr: cage.fcr?.toString() || "",
    croissance: cage.croissance || "",
    notes: cage.notes || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cages')
        .update({
          nom: formData.nom,
          espece: formData.espece,
          nombre_poissons: parseInt(formData.nombrePoissons) || 0,
          poids_moyen: parseFloat(formData.poidsMoyen) || 0,
          statut: formData.statut,
          date_introduction: formData.dateIntroduction || null,
          fcr: parseFloat(formData.fcr) || 0,
          croissance: formData.croissance,
          notes: formData.notes || null
        })
        .eq('id', cage.id);

      if (error) throw error;

      toast({
        title: "Cage mise à jour",
        description: "Les informations de la cage ont été modifiées avec succès."
      });

      setOpen(false);
      onCageUpdated();
    } catch (error) {
      console.error('Error updating cage:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de la cage.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs"
        >
          <Edit className="h-3 w-3 mr-1" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la cage - {cage.nom}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom">Nom de la cage *</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Cage-01"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="espece">Espèce *</Label>
              <Select 
                value={formData.espece} 
                onValueChange={(value) => setFormData({ ...formData, espece: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une espèce" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tilapia">Tilapia</SelectItem>
                  <SelectItem value="Carpe">Carpe</SelectItem>
                  <SelectItem value="Poisson-chat">Poisson-chat</SelectItem>
                  <SelectItem value="Saumon">Saumon</SelectItem>
                  <SelectItem value="Truite">Truite</SelectItem>
                  <SelectItem value="Bar">Bar</SelectItem>
                  <SelectItem value="Dorade">Dorade</SelectItem>
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
                min="0"
                value={formData.nombrePoissons}
                onChange={(e) => setFormData({ ...formData, nombrePoissons: e.target.value })}
                placeholder="1000"
              />
            </div>
            
            <div>
              <Label htmlFor="poidsMoyen">Poids moyen (kg)</Label>
              <Input
                id="poidsMoyen"
                type="number"
                step="0.1"
                min="0"
                value={formData.poidsMoyen}
                onChange={(e) => setFormData({ ...formData, poidsMoyen: e.target.value })}
                placeholder="1.2"
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
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fcr">FCR</Label>
              <Input
                id="fcr"
                type="number"
                step="0.1"
                min="0"
                value={formData.fcr}
                onChange={(e) => setFormData({ ...formData, fcr: e.target.value })}
                placeholder="1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="croissance">Croissance</Label>
              <Input
                id="croissance"
                value={formData.croissance}
                onChange={(e) => setFormData({ ...formData, croissance: e.target.value })}
                placeholder="15%"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observations particulières..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCageModal;