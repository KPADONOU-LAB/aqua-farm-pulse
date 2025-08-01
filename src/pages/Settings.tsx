import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/contexts/FarmContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Globe, DollarSign, Fish, Waves, Users, Settings as SettingsIcon } from 'lucide-react';
import UserManagement from './UserManagement';

const Settings = () => {
  const { farmSettings, updateFarmSettings, translate } = useFarm();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    farm_name: '',
    language: 'fr' as 'fr' | 'en' | 'ar',
    currency: 'eur' as 'fcfa' | 'eur' | 'usd' | 'mad' | 'dza' | 'tnd',
    basin_types: [] as string[],
    fish_species: [] as string[],
    custom_species: ''
  });

  // Options étendues pour les types de bassins
  const basinOptions = [
    { value: 'cage_flottante', label: 'Cage flottante' },
    { value: 'cage_fixe', label: 'Cage fixe' },
    { value: 'etang', label: 'Étang' },
    { value: 'bac_hors_sol', label: 'Bac hors-sol' },
    { value: 'bassin_beton', label: 'Bassin béton' },
    { value: 'raceway', label: 'Raceway' },
    { value: 'reservoir', label: 'Réservoir' },
    { value: 'serre_aquacole', label: 'Serre aquacole' }
  ];

  // Options étendues pour les espèces
  const speciesOptions = [
    { value: 'tilapia', label: 'Tilapia' },
    { value: 'silure', label: 'Silure africain' },
    { value: 'carpe', label: 'Carpe' },
    { value: 'truite', label: 'Truite' },
    { value: 'saumon', label: 'Saumon' },
    { value: 'bar', label: 'Bar (Loup de mer)' },
    { value: 'daurade', label: 'Daurade' },
    { value: 'brochet', label: 'Brochet' },
    { value: 'perche', label: 'Perche' },
    { value: 'anguille', label: 'Anguille' },
    { value: 'pangasius', label: 'Pangasius' },
    { value: 'poisson_chat', label: 'Poisson-chat' }
  ];

  // Options de devises étendues
  const currencyOptions = [
    { value: 'fcfa', label: 'FCFA (Franc CFA)', symbol: 'FCFA' },
    { value: 'eur', label: 'Euro', symbol: '€' },
    { value: 'usd', label: 'Dollar américain', symbol: '$' },
    { value: 'mad', label: 'Dirham marocain', symbol: 'MAD' },
    { value: 'dza', label: 'Dinar algérien', symbol: 'DZD' },
    { value: 'tnd', label: 'Dinar tunisien', symbol: 'TND' }
  ];

  // Options de langues étendues
  const languageOptions = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' }
  ];

  useEffect(() => {
    if (farmSettings) {
      setFormData({
        farm_name: farmSettings.farm_name || '',
        language: farmSettings.language || 'fr',
        currency: farmSettings.currency || 'eur',
        basin_types: farmSettings.basin_types || [],
        fish_species: farmSettings.fish_species || [],
        custom_species: ''
      });
    }
  }, [farmSettings]);

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

  const removeSpecies = (species: string) => {
    setFormData(prev => ({
      ...prev,
      fish_species: prev.fish_species.filter(s => s !== species)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.farm_name) {
      toast({
        title: "Erreur",
        description: "Le nom de la ferme est obligatoire",
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
        fish_species: formData.fish_species
      });

      toast({
        title: "Paramètres mis à jour",
        description: "Vos paramètres ont été sauvegardés avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde des paramètres",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{translate('settings')}</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Paramètres généraux
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gestion des utilisateurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informations de base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="farm_name" className="text-base font-semibold">
                    {translate('farm_name')} *
                  </Label>
                  <Input
                    id="farm_name"
                    value={formData.farm_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, farm_name: e.target.value }))}
                    placeholder="Ex: Ferme Aquacole des Palmiers"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Paramètres régionaux */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Paramètres régionaux
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {translate('language')}
                    </Label>
                    <Select value={formData.language} onValueChange={(value: 'fr' | 'en' | 'ar') => 
                      setFormData(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {translate('currency')}
                    </Label>
                    <Select value={formData.currency} onValueChange={(value: 'fcfa' | 'eur' | 'usd' | 'mad' | 'dza' | 'tnd') => 
                      setFormData(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label} ({currency.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Types de bassins */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="h-5 w-5" />
                  {translate('basin_types')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {basinOptions.map((basin) => (
                    <div key={basin.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={basin.value}
                        checked={formData.basin_types.includes(basin.value)}
                        onCheckedChange={(checked) => handleBasinTypeChange(basin.value, checked as boolean)}
                      />
                      <Label htmlFor={basin.value} className="text-sm">
                        {basin.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Espèces élevées */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fish className="h-5 w-5" />
                  {translate('fish_species')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {speciesOptions.map((species) => (
                    <div key={species.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={species.value}
                        checked={formData.fish_species.includes(species.value)}
                        onCheckedChange={(checked) => handleSpeciesChange(species.value, checked as boolean)}
                      />
                      <Label htmlFor={species.value} className="text-sm">
                        {species.label}
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Espèces sélectionnées :</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.fish_species.map((species) => (
                        <span 
                          key={species} 
                          className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm flex items-center gap-2"
                        >
                          {speciesOptions.find(s => s.value === species)?.label || species}
                          <button
                            type="button"
                            onClick={() => removeSpecies(species)}
                            className="text-primary hover:text-primary/70 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? 'Sauvegarde en cours...' : 'Sauvegarder les paramètres'}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;