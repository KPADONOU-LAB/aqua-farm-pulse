import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Coffee } from "lucide-react";

interface NewFeedingModalProps {
  trigger?: React.ReactNode;
}

const NewFeedingModal = ({ trigger }: NewFeedingModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    cage: "",
    quantite: "",
    typeAliment: "",
    heure: "",
    appetit: "",
    observations: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Session d'alimentation enregistrée !",
      description: `${formData.quantite}kg distribués à ${formData.cage}`,
    });
    
    setFormData({
      cage: "",
      quantite: "",
      typeAliment: "",
      heure: "",
      appetit: "",
      observations: ""
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-aqua-gradient hover:bg-aqua-600 text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle session
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <Coffee className="h-5 w-5" />
            Nouvelle session d'alimentation
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
                  <SelectItem value="cage001">Cage #001</SelectItem>
                  <SelectItem value="cage002">Cage #002</SelectItem>
                  <SelectItem value="cage003">Cage #003</SelectItem>
                  <SelectItem value="cage004">Cage #004</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="heure">Heure</Label>
              <Input
                id="heure"
                type="time"
                value={formData.heure}
                onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantite">Quantité (kg)</Label>
              <Input
                id="quantite"
                type="number"
                step="0.1"
                value={formData.quantite}
                onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                placeholder="45.5"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="typeAliment">Type d'aliment</Label>
              <Select 
                value={formData.typeAliment} 
                onValueChange={(value) => setFormData({ ...formData, typeAliment: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="granules_croissance">Granulés croissance</SelectItem>
                  <SelectItem value="granules_standard">Granulés standard</SelectItem>
                  <SelectItem value="granules_premium">Granulés premium</SelectItem>
                  <SelectItem value="aliment_special">Aliment spécial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="appetit">Appétit observé</Label>
            <Select 
              value={formData.appetit} 
              onValueChange={(value) => setFormData({ ...formData, appetit: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Évaluer l'appétit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="bon">Bon</SelectItem>
                <SelectItem value="moyen">Moyen</SelectItem>
                <SelectItem value="faible">Faible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="observations">Observations</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Comportement des poissons, conditions particulières..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-aqua-gradient hover:bg-aqua-600">
              Enregistrer la session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFeedingModal;