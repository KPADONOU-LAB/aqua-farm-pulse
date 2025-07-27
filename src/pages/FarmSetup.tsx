import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/contexts/FarmContext';
import { Building2, Globe, DollarSign, Fish, Waves } from 'lucide-react';

const FarmSetup = () => {
  const { updateFarmSettings } = useFarm();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    farm_name: '',
    language: 'fr' as 'fr' | 'en',
    currency: 'eur' as 'fcfa' | 'eur' | 'usd',
    basin_types: [] as string[],
    fish_species: [] as string[],
    custom_species: ''
  });

  const basinOptions = [
    'cage_flottante',
    'etang',
    'bac_hors_sol',
    'bassin_beton',
    'raceway'
  ];

  const speciesOptions = [
    'tilapia',
    'silure',
    'carpe',
    'truite',
    'saumon',
    'bar',
    'daurade'
  ];

  const handleBasinTypeChange = (basinType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      basin_types: checked 
        ? [...prev.basin_types, basinType]
        : prev.basin_types.filter(t => t !== basinType)
    }));
  };

  const handleSpeciesChange = (species: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      fish_species: checked 
        ? [...prev.fish_species, species]
        : prev.fish_species.filter(s => s !== species)
    }));
  };

  const addCustomSpecies = () => {
    if (formData.custom_species && !formData.fish_species.includes(formData.custom_species)) {
      setFormData(prev => ({
        ...prev,
        fish_species: [...prev.fish_species, prev.custom_species],
        custom_species: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.farm_name || formData.basin_types.length === 0 || formData.fish_species.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await updateFarmSettings({
        farm_name: formData.farm_name,
        language: formData.language,
        currency: formData.currency,
        basin_types: formData.basin_types,
        fish_species: formData.fish_species,
        is_configured: true
      });

      toast({
        title: "Configuration sauvegardée",
        description: "Votre ferme a été configurée avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de la configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{backgroundColor: '#C8E9F6'}}>
      <Card className="w-full max-w-4xl bg-card/95 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Configuration initiale
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Configurez votre ferme piscicole pour commencer
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Nom de la ferme */}
            <div className="space-y-2">
              <Label htmlFor="farm_name" className="text-base font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Nom de la ferme ou société piscicole *
              </Label>
              <Input
                id="farm_name"
                value={formData.farm_name}
                onChange={(e) => setFormData(prev => ({ ...prev, farm_name: e.target.value }))}
                placeholder="Ex: Ferme Aquacole des Palmiers"
                className="text-base"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Langue */}
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Langue préférée
                </Label>
                <Select value={formData.language} onValueChange={(value: 'fr' | 'en') => 
                  setFormData(prev => ({ ...prev, language: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Devise */}
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Devise
                </Label>
                <Select value={formData.currency} onValueChange={(value: 'fcfa' | 'eur' | 'usd') => 
                  setFormData(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fcfa">FCFA</SelectItem>
                    <SelectItem value="eur">Euro (€)</SelectItem>
                    <SelectItem value="usd">Dollar ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Types de bassins */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Waves className="h-4 w-4" />
                Types de bassins utilisés *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {basinOptions.map((basin) => (
                  <div key={basin} className="flex items-center space-x-2">
                    <Checkbox
                      id={basin}
                      checked={formData.basin_types.includes(basin)}
                      onCheckedChange={(checked) => handleBasinTypeChange(basin, checked as boolean)}
                    />
                    <Label htmlFor={basin} className="text-sm">
                      {basin.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Espèces élevées */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Fish className="h-4 w-4" />
                Espèces élevées *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {speciesOptions.map((species) => (
                  <div key={species} className="flex items-center space-x-2">
                    <Checkbox
                      id={species}
                      checked={formData.fish_species.includes(species)}
                      onCheckedChange={(checked) => handleSpeciesChange(species, checked as boolean)}
                    />
                    <Label htmlFor={species} className="text-sm capitalize">
                      {species}
                    </Label>
                  </div>
                ))}
              </div>
              
              {/* Ajouter espèce personnalisée */}
              <div className="flex gap-2">
                <Input
                  value={formData.custom_species}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_species: e.target.value }))}
                  placeholder="Autre espèce..."
                  className="flex-1"
                />
                <Button type="button" onClick={addCustomSpecies} variant="outline">
                  Ajouter
                </Button>
              </div>
              
              {/* Espèces sélectionnées */}
              {formData.fish_species.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.fish_species.map((species) => (
                    <span key={species} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                      {species}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full text-lg py-6">
              {loading ? 'Configuration en cours...' : 'Configurer ma ferme'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmSetup;