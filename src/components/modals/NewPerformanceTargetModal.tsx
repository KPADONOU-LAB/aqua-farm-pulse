import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Target, Plus } from "lucide-react";
import { usePerformanceTargets } from "@/hooks/usePerformanceTargets";
import { useCageMetrics } from "@/hooks/useCageMetrics";

interface NewPerformanceTargetModalProps {
  cageId?: string;
  onTargetCreated?: () => void;
}

export function NewPerformanceTargetModal({ cageId, onTargetCreated }: NewPerformanceTargetModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    cage_id: cageId || '',
    fcr_cible: '1.8',
    taux_survie_cible: '95',
    poids_moyen_cible: '0.8',
    duree_cycle_jours: '180',
    cout_revient_kg_cible: '4.0',
    marge_beneficiaire_cible: '25',
    notes: ''
  });

  const { createTarget } = usePerformanceTargets();
  const { cages } = useCageMetrics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cage_id) {
      return;
    }

    try {
      const targetData = {
        cage_id: formData.cage_id,
        fcr_cible: parseFloat(formData.fcr_cible),
        taux_survie_cible: parseFloat(formData.taux_survie_cible),
        poids_moyen_cible: parseFloat(formData.poids_moyen_cible),
        duree_cycle_jours: parseInt(formData.duree_cycle_jours),
        cout_revient_kg_cible: parseFloat(formData.cout_revient_kg_cible),
        marge_beneficiaire_cible: parseFloat(formData.marge_beneficiaire_cible),
        date_creation: new Date().toISOString().split('T')[0],
        statut: 'actif',
        notes: formData.notes || null
      };

      await createTarget(targetData);
      
      setFormData({
        cage_id: cageId || '',
        fcr_cible: '1.8',
        taux_survie_cible: '95',
        poids_moyen_cible: '0.8',
        duree_cycle_jours: '180',
        cout_revient_kg_cible: '4.0',
        marge_beneficiaire_cible: '25',
        notes: ''
      });
      
      setOpen(false);
      onTargetCreated?.();
    } catch (error) {
      console.error('Erreur lors de la création de l\'objectif:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nouvel objectif
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Définir un objectif de performance
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!cageId && (
            <div className="space-y-2">
              <Label htmlFor="cage_id">Cage</Label>
              <Select
                value={formData.cage_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, cage_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une cage" />
                </SelectTrigger>
                <SelectContent>
                  {cages.map((cage) => (
                    <SelectItem key={cage.id} value={cage.id}>
                      {cage.nom} - {cage.espece}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fcr_cible">FCR Cible</Label>
              <Input
                id="fcr_cible"
                type="number"
                step="0.1"
                value={formData.fcr_cible}
                onChange={(e) => setFormData(prev => ({ ...prev, fcr_cible: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Objectif: 1.5-2.0 (optimal)</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taux_survie_cible">Taux de survie cible (%)</Label>
              <Input
                id="taux_survie_cible"
                type="number"
                step="0.1"
                value={formData.taux_survie_cible}
                onChange={(e) => setFormData(prev => ({ ...prev, taux_survie_cible: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Objectif: 90-98%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="poids_moyen_cible">Poids moyen cible (kg)</Label>
              <Input
                id="poids_moyen_cible"
                type="number"
                step="0.1"
                value={formData.poids_moyen_cible}
                onChange={(e) => setFormData(prev => ({ ...prev, poids_moyen_cible: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Poids de récolte souhaité</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duree_cycle_jours">Durée du cycle (jours)</Label>
              <Input
                id="duree_cycle_jours"
                type="number"
                value={formData.duree_cycle_jours}
                onChange={(e) => setFormData(prev => ({ ...prev, duree_cycle_jours: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Durée prévue du cycle</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cout_revient_kg_cible">Coût de revient cible (€/kg)</Label>
              <Input
                id="cout_revient_kg_cible"
                type="number"
                step="0.1"
                value={formData.cout_revient_kg_cible}
                onChange={(e) => setFormData(prev => ({ ...prev, cout_revient_kg_cible: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Objectif: 3.5-4.5€/kg</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="marge_beneficiaire_cible">Marge bénéficiaire cible (%)</Label>
              <Input
                id="marge_beneficiaire_cible"
                type="number"
                step="0.1"
                value={formData.marge_beneficiaire_cible}
                onChange={(e) => setFormData(prev => ({ ...prev, marge_beneficiaire_cible: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Marge souhaitée</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes et objectifs spécifiques</Label>
            <Textarea
              id="notes"
              placeholder="Objectifs particuliers, contexte, stratégie..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">
              Créer l'objectif
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}