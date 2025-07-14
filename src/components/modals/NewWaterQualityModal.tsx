import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Droplets } from "lucide-react";

interface NewWaterQualityModalProps {
  trigger?: React.ReactNode;
}

const NewWaterQualityModal = ({ trigger }: NewWaterQualityModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    cage: "",
    temperature: "",
    ph: "",
    oxygeneDissous: "",
    turbidite: "",
    heure: "",
    observations: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Évaluation automatique du statut
    const temp = parseFloat(formData.temperature);
    const ph = parseFloat(formData.ph);
    const o2 = parseFloat(formData.oxygeneDissous);
    
    let statut = "optimal";
    if (temp < 22 || temp > 28 || ph < 6.5 || ph > 8.0 || o2 < 5.0) {
      statut = "attention";
    }
    if (temp < 20 || temp > 30 || ph < 6.0 || ph > 8.5 || o2 < 4.0) {
      statut = "critique";
    }
    
    toast({
      title: "Mesure enregistrée !",
      description: `Qualité de l'eau ${formData.cage}: ${statut}`,
      variant: statut === "critique" ? "destructive" : "default"
    });
    
    setFormData({
      cage: "",
      temperature: "",
      ph: "",
      oxygeneDissous: "",
      turbidite: "",
      heure: "",
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
            Nouvelle mesure
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800">
            <Droplets className="h-5 w-5" />
            Nouvelle mesure qualité eau
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
              <Label htmlFor="temperature">Température (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                placeholder="24.5"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Optimal: 22-28°C</p>
            </div>
            
            <div>
              <Label htmlFor="ph">pH</Label>
              <Input
                id="ph"
                type="number"
                step="0.1"
                value={formData.ph}
                onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                placeholder="7.2"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Optimal: 6.5-8.0</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="oxygeneDissous">Oxygène dissous (mg/L)</Label>
              <Input
                id="oxygeneDissous"
                type="number"
                step="0.1"
                value={formData.oxygeneDissous}
                onChange={(e) => setFormData({ ...formData, oxygeneDissous: e.target.value })}
                placeholder="8.1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Min: 5.0 mg/L</p>
            </div>
            
            <div>
              <Label htmlFor="turbidite">Turbidité (NTU)</Label>
              <Input
                id="turbidite"
                type="number"
                step="0.1"
                value={formData.turbidite}
                onChange={(e) => setFormData({ ...formData, turbidite: e.target.value })}
                placeholder="15"
              />
              <p className="text-xs text-gray-500 mt-1">Facultatif</p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="observations">Observations</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Conditions météo, particularités observées..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-aqua-gradient hover:bg-aqua-600">
              Enregistrer la mesure
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewWaterQualityModal;