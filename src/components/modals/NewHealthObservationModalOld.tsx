import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Heart } from "lucide-react";

interface NewHealthObservationModalProps {
  trigger?: React.ReactNode;
}

const NewHealthObservationModal = ({ trigger }: NewHealthObservationModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    cage: "",
    mortalite: "",
    causePresumee: "",
    observations: "",
    traitements: [] as string[],
    veterinaire: false
  });
  const { toast } = useToast();

  const traitementOptions = [
    "Probiotiques",
    "Antibiotique",
    "Vitamines",
    "Anti-parasitaire",
    "Désinfectant",
    "Autre"
  ];

  const handleTraitementChange = (traitement: string, checked: boolean) => {
    if (checked) {
      setFormData({ 
        ...formData, 
        traitements: [...formData.traitements, traitement] 
      });
    } else {
      setFormData({ 
        ...formData, 
        traitements: formData.traitements.filter(t => t !== traitement) 
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mortalite = parseInt(formData.mortalite);
    let statut = "normal";
    if (mortalite > 0 && mortalite <= 5) statut = "surveillance";
    if (mortalite > 5) statut = "alerte";
    
    toast({
      title: "Observation sanitaire enregistrée !",
      description: `${formData.cage}: ${mortalite} décès - Statut: ${statut}`,
      variant: statut === "alerte" ? "destructive" : "default"
    });
    
    setFormData({
      cage: "",
      mortalite: "",
      causePresumee: "",
      observations: "",
      traitements: [],
      veterinaire: false
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-aqua-gradient hover:bg-aqua-600 text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle observation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <Heart className="h-5 w-5" />
            Nouvelle observation sanitaire
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
              <Label htmlFor="mortalite">Nombre de décès</Label>
              <Input
                id="mortalite"
                type="number"
                min="0"
                value={formData.mortalite}
                onChange={(e) => setFormData({ ...formData, mortalite: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="causePresumee">Cause présumée (si mortalité)</Label>
            <Select 
              value={formData.causePresumee} 
              onValueChange={(value) => setFormData({ ...formData, causePresumee: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stress_thermique">Stress thermique</SelectItem>
                <SelectItem value="maladie_bacterienne">Maladie bactérienne</SelectItem>
                <SelectItem value="maladie_virale">Maladie virale</SelectItem>
                <SelectItem value="parasites">Parasites</SelectItem>
                <SelectItem value="qualite_eau">Qualité de l'eau</SelectItem>
                <SelectItem value="predation">Prédation</SelectItem>
                <SelectItem value="inconnue">Cause inconnue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Traitements appliqués</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {traitementOptions.map((traitement) => (
                <div key={traitement} className="flex items-center space-x-2">
                  <Checkbox
                    id={traitement}
                    checked={formData.traitements.includes(traitement)}
                    onCheckedChange={(checked) => 
                      handleTraitementChange(traitement, checked as boolean)
                    }
                  />
                  <Label htmlFor={traitement} className="text-sm">
                    {traitement}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="veterinaire"
              checked={formData.veterinaire}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, veterinaire: checked as boolean })
              }
            />
            <Label htmlFor="veterinaire">
              Intervention vétérinaire requise
            </Label>
          </div>
          
          <div>
            <Label htmlFor="observations">Observations détaillées</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Comportement des poissons, symptômes observés, actions entreprises..."
              rows={4}
              required
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-aqua-gradient hover:bg-aqua-600">
              Enregistrer l'observation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewHealthObservationModal;