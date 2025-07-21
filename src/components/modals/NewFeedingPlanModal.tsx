import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFeedingPlans } from '@/hooks/useFeedingPlans';

interface Cage {
  id: string;
  nom: string;
  espece: string;
  nombre_poissons: number;
  poids_moyen: number;
}

interface NewFeedingPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  cages: Cage[];
}

export function NewFeedingPlanModal({ isOpen, onClose, cages }: NewFeedingPlanModalProps) {
  const { createFeedingPlan } = useFeedingPlans();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    cage_id: '',
    pourcentage_poids_corporel: 3.0,
    frequence_par_jour: 3,
    notes: ''
  });

  const [estimatedQuantity, setEstimatedQuantity] = useState(0);

  const handleCageChange = (cageId: string) => {
    setFormData(prev => ({ ...prev, cage_id: cageId }));
    
    const selectedCage = cages.find(c => c.id === cageId);
    if (selectedCage) {
      const biomass = selectedCage.nombre_poissons * (selectedCage.poids_moyen / 1000); // en kg
      const quantity = (biomass * formData.pourcentage_poids_corporel) / 100;
      setEstimatedQuantity(quantity);
    }
  };

  const handlePercentageChange = (value: number) => {
    setFormData(prev => ({ ...prev, pourcentage_poids_corporel: value }));
    
    const selectedCage = cages.find(c => c.id === formData.cage_id);
    if (selectedCage) {
      const biomass = selectedCage.nombre_poissons * (selectedCage.poids_moyen / 1000);
      const quantity = (biomass * value) / 100;
      setEstimatedQuantity(quantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedCage = cages.find(c => c.id === formData.cage_id);
      if (!selectedCage) {
        throw new Error('Cage non trouvée');
      }

      const biomass = selectedCage.nombre_poissons * (selectedCage.poids_moyen / 1000);
      
      await createFeedingPlan({
        ...formData,
        poids_corporel_total: biomass,
        quantite_prevue_jour: estimatedQuantity,
        date_debut: new Date().toISOString().split('T')[0],
        statut: 'actif'
      });

      toast({
        title: "Plan d'alimentation créé",
        description: "Le plan d'alimentation automatique a été configuré avec succès.",
      });

      onClose();
      setFormData({
        cage_id: '',
        pourcentage_poids_corporel: 3.0,
        frequence_par_jour: 3,
        notes: ''
      });
      setEstimatedQuantity(0);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le plan d'alimentation.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouveau Plan d'Alimentation Automatique</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="percentage">% du poids corporel</Label>
              <Input
                id="percentage"
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={formData.pourcentage_poids_corporel}
                onChange={(e) => handlePercentageChange(Number(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">
                Recommandé: 2-4% pour tilapia adulte
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Fréquence/jour</Label>
              <Select 
                value={formData.frequence_par_jour.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, frequence_par_jour: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 fois/jour</SelectItem>
                  <SelectItem value="3">3 fois/jour</SelectItem>
                  <SelectItem value="4">4 fois/jour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {estimatedQuantity > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                Quantité journalière estimée: {estimatedQuantity.toFixed(2)} kg
              </p>
              <p className="text-xs text-blue-700">
                Soit {(estimatedQuantity / formData.frequence_par_jour).toFixed(2)} kg par repas
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Notes sur le plan d'alimentation..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer le Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}