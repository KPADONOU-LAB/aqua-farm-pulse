import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Heart } from "lucide-react";

interface NewHealthObservationModalProps {
  trigger?: React.ReactNode;
}

const NewHealthObservationModal = ({ trigger }: NewHealthObservationModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cages, setCages] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    cage: "",
    mortalite: "",
    causePresumee: "",
    observations: "",
    traitements: [] as string[],
    veterinaire: false
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const traitementOptions = [
    "Probiotiques",
    "Antibiotique",
    "Vitamines",
    "Anti-parasitaire",
    "Désinfectant",
    "Autre"
  ];

  useEffect(() => {
    if (user) {
      loadCages();
    }
  }, [user]);

  const loadCages = async () => {
    const { data } = await supabase
      .from('cages')
      .select('id, nom')
      .eq('user_id', user?.id);
    setCages(data || []);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    try {
      const mortalite = parseInt(formData.mortalite);
      let statut = "normal";
      if (mortalite > 0 && mortalite <= 5) statut = "surveillance";
      if (mortalite > 5) statut = "alerte";

      const { error } = await supabase.from('health_observations').insert({
        user_id: user.id,
        cage_id: formData.cage,
        mortalite,
        cause_presumee: formData.causePresumee || null,
        traitements: formData.traitements,
        statut,
        observations: formData.observations
      });

      if (error) throw error;

      toast({
        title: "Observation sanitaire enregistrée !",
        description: `${mortalite} décès - Statut: ${statut}`,
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
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'observation. Veuillez réessayer.",
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
                  {cages.map((cage) => (
                    <SelectItem key={cage.id} value={cage.id}>
                      {cage.nom}
                    </SelectItem>
                  ))}
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
            <Button type="submit" disabled={loading} className="bg-aqua-gradient hover:bg-aqua-600">
              {loading ? "Enregistrement..." : "Enregistrer l'observation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewHealthObservationModal;