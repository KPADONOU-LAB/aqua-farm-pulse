import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useWeighings } from '@/hooks/useWeighings';
import { Camera, Upload } from 'lucide-react';

interface Cage {
  id: string;
  nom: string;
  espece: string;
  nombre_poissons: number;
}

interface NewWeighingModalProps {
  isOpen: boolean;
  onClose: () => void;
  cages: Cage[];
}

export function NewWeighingModal({ isOpen, onClose, cages }: NewWeighingModalProps) {
  const { createWeighing, uploadWeighingPhoto } = useWeighings();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    cage_id: '',
    date_pesee: new Date().toISOString().split('T')[0],
    nombre_echantillons: 10,
    poids_moyen_echantillon: 0,
    observations: ''
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [estimatedBiomass, setEstimatedBiomass] = useState(0);

  const handleCageChange = (cageId: string) => {
    setFormData(prev => ({ ...prev, cage_id: cageId }));
    calculateBiomass(cageId, formData.poids_moyen_echantillon);
  };

  const handleWeightChange = (weight: number) => {
    setFormData(prev => ({ ...prev, poids_moyen_echantillon: weight }));
    calculateBiomass(formData.cage_id, weight);
  };

  const calculateBiomass = (cageId: string, weight: number) => {
    const selectedCage = cages.find(c => c.id === cageId);
    if (selectedCage && weight > 0) {
      const biomass = (selectedCage.nombre_poissons * weight) / 1000; // en kg
      setEstimatedBiomass(biomass);
    } else {
      setEstimatedBiomass(0);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Créer la pesée
      const weighing = await createWeighing({
        ...formData,
        poids_estime_total: estimatedBiomass,
        biomasse_totale: estimatedBiomass,
        taux_croissance_semaine: 0, // Calculé automatiquement dans le hook
        photos: []
      });

      if (!weighing) {
        throw new Error('Erreur lors de la création de la pesée');
      }

      // Upload des photos si présentes
      const photoUrls: string[] = [];
      for (const photo of photos) {
        try {
          const url = await uploadWeighingPhoto(photo, weighing.id);
          photoUrls.push(url);
        } catch (photoError) {
          console.error('Erreur upload photo:', photoError);
        }
      }

      toast({
        title: "Pesée enregistrée",
        description: `Pesée hebdomadaire enregistrée avec succès. Biomasse estimée: ${estimatedBiomass.toFixed(2)} kg`,
      });

      onClose();
      setFormData({
        cage_id: '',
        date_pesee: new Date().toISOString().split('T')[0],
        nombre_echantillons: 10,
        poids_moyen_echantillon: 0,
        observations: ''
      });
      setPhotos([]);
      setEstimatedBiomass(0);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la pesée.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Pesée Hebdomadaire</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cage">Cage</Label>
              <Select onValueChange={handleCageChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une cage" />
                </SelectTrigger>
                <SelectContent>
                  {cages.map((cage) => (
                    <SelectItem key={cage.id} value={cage.id}>
                      {cage.nom} - {cage.espece} ({cage.nombre_poissons} poissons)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date de pesée</Label>
              <Input
                id="date"
                type="date"
                value={formData.date_pesee}
                onChange={(e) => setFormData(prev => ({ ...prev, date_pesee: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="samples">Nombre d'échantillons</Label>
              <Input
                id="samples"
                type="number"
                min="5"
                max="50"
                value={formData.nombre_echantillons}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre_echantillons: Number(e.target.value) }))}
                required
              />
              <p className="text-xs text-muted-foreground">
                Recommandé: 10-20 poissons
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Poids moyen (g)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={formData.poids_moyen_echantillon}
                onChange={(e) => handleWeightChange(Number(e.target.value))}
                required
              />
            </div>
          </div>

          {estimatedBiomass > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Estimations calculées:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-700">Biomasse totale: <span className="font-medium">{estimatedBiomass.toFixed(2)} kg</span></p>
                </div>
                <div>
                  <p className="text-green-700">Poids total estimé: <span className="font-medium">{estimatedBiomass.toFixed(2)} kg</span></p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Photos (optionnel)</Label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Ajouter des photos
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
              
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 p-0"
                        onClick={() => removePhoto(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observations</Label>
            <Textarea
              id="observations"
              placeholder="Observations sur l'état des poissons, conditions de pesée..."
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer la Pesée'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}