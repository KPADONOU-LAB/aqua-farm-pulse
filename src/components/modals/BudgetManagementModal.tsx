import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface BudgetManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BudgetManagementModal = ({ open, onOpenChange, onSuccess }: BudgetManagementModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom_budget: "",
    periode_debut: "",
    periode_fin: "",
    budget_aliments: "",
    budget_medicaments: "",
    budget_equipements: "",
    budget_personnel: "",
    budget_maintenance: "",
    objectif_chiffre_affaires: "",
    objectif_marge: ""
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          nom_budget: formData.nom_budget,
          periode_debut: formData.periode_debut,
          periode_fin: formData.periode_fin,
          budget_aliments: parseFloat(formData.budget_aliments) || 0,
          budget_medicaments: parseFloat(formData.budget_medicaments) || 0,
          budget_equipements: parseFloat(formData.budget_equipements) || 0,
          budget_personnel: parseFloat(formData.budget_personnel) || 0,
          budget_maintenance: parseFloat(formData.budget_maintenance) || 0,
          objectif_chiffre_affaires: parseFloat(formData.objectif_chiffre_affaires) || 0,
          objectif_marge: parseFloat(formData.objectif_marge) || 0,
          statut: 'actif'
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Budget créé avec succès",
      });

      // Reset form
      setFormData({
        nom_budget: "",
        periode_debut: "",
        periode_fin: "",
        budget_aliments: "",
        budget_medicaments: "",
        budget_equipements: "",
        budget_personnel: "",
        budget_maintenance: "",
        objectif_chiffre_affaires: "",
        objectif_marge: ""
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création du budget",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set default dates for current quarter
  const setCurrentQuarter = () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const startMonth = quarter * 3;
    const endMonth = startMonth + 2;
    
    const start = new Date(now.getFullYear(), startMonth, 1);
    const end = new Date(now.getFullYear(), endMonth + 1, 0);
    
    setFormData({
      ...formData,
      periode_debut: start.toISOString().split('T')[0],
      periode_fin: end.toISOString().split('T')[0]
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un Nouveau Budget</DialogTitle>
          <DialogDescription>
            Définir les objectifs financiers et budgets par catégorie
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations générales</h3>
            
            <div className="space-y-2">
              <Label htmlFor="nom_budget">Nom du budget</Label>
              <Input
                id="nom_budget"
                placeholder="Ex: Budget Q1 2024"
                value={formData.nom_budget}
                onChange={(e) => setFormData({ ...formData, nom_budget: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="periode_debut">Date de début</Label>
                <Input
                  id="periode_debut"
                  type="date"
                  value={formData.periode_debut}
                  onChange={(e) => setFormData({ ...formData, periode_debut: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periode_fin">Date de fin</Label>
                <Input
                  id="periode_fin"
                  type="date"
                  value={formData.periode_fin}
                  onChange={(e) => setFormData({ ...formData, periode_fin: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button type="button" variant="outline" onClick={setCurrentQuarter}>
              Utiliser le trimestre actuel
            </Button>
          </div>

          {/* Budgets par catégorie */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Budgets par catégorie (€)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget_aliments">Alimentation</Label>
                <Input
                  id="budget_aliments"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.budget_aliments}
                  onChange={(e) => setFormData({ ...formData, budget_aliments: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_medicaments">Médicaments</Label>
                <Input
                  id="budget_medicaments"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.budget_medicaments}
                  onChange={(e) => setFormData({ ...formData, budget_medicaments: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_equipements">Équipements</Label>
                <Input
                  id="budget_equipements"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.budget_equipements}
                  onChange={(e) => setFormData({ ...formData, budget_equipements: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_personnel">Personnel</Label>
                <Input
                  id="budget_personnel"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.budget_personnel}
                  onChange={(e) => setFormData({ ...formData, budget_personnel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_maintenance">Maintenance</Label>
                <Input
                  id="budget_maintenance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.budget_maintenance}
                  onChange={(e) => setFormData({ ...formData, budget_maintenance: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Objectifs */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Objectifs</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="objectif_chiffre_affaires">Chiffre d'affaires cible (€)</Label>
                <Input
                  id="objectif_chiffre_affaires"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.objectif_chiffre_affaires}
                  onChange={(e) => setFormData({ ...formData, objectif_chiffre_affaires: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="objectif_marge">Marge cible (%)</Label>
                <Input
                  id="objectif_marge"
                  type="number"
                  step="0.1"
                  placeholder="25.0"
                  value={formData.objectif_marge}
                  onChange={(e) => setFormData({ ...formData, objectif_marge: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer Budget"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};