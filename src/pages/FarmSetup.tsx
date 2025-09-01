import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/contexts/FarmContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Globe, DollarSign, Fish, Waves, UserPlus } from 'lucide-react';

const FarmSetup = () => {
  const { updateFarmSettings } = useFarm();
  const { t: translate, language } = useLanguage();
  const { updateLanguage } = useSyncedLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  const [formData, setFormData] = useState({
    farm_name: '',
    language: language,
    currency: 'fcfa' as 'fcfa' | 'eur' | 'usd',
    basin_types: [] as string[],
    fish_species: [] as string[],
    custom_species: ''
  });

  const basinOptions = [
    { value: 'cage_flottante', labelKey: 'floating' },
    { value: 'cage_fixe', labelKey: 'fixed' },
    { value: 'bassin_beton', labelKey: 'above_ground' },
    { value: 'etang', labelKey: 'earth_pond' }
  ];

  const speciesOptions = [
    { value: 'tilapia', labelKey: 'tilapia' },
    { value: 'silure', labelKey: 'catfish' },
    { value: 'carpe', labelKey: 'carp' }
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
    
    // Check if user is authenticated
    if (!user) {
      toast({
        title: translate('error'),
        description: 'Vous devez être connecté pour configurer votre ferme',
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    if (!formData.farm_name || formData.basin_types.length === 0 || formData.fish_species.length === 0) {
      toast({
        title: translate('error'),
        description: translate('fill_required_fields'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting farm setup with data:', formData);
      console.log('Current user:', user?.id);
      
      // Ensure arrays are never empty and have valid values
      const basinTypes = formData.basin_types.length > 0 ? formData.basin_types : ['cage_flottante'];
      const fishSpecies = formData.fish_species.length > 0 ? formData.fish_species : ['tilapia'];
      
      await updateFarmSettings({
        farm_name: formData.farm_name,
        language: formData.language,
        currency: formData.currency,
        basin_types: basinTypes,
        fish_species: fishSpecies,
        is_configured: true
      });

      toast({
        title: translate('config_saved'),
        description: translate('farm_configured_success'),
      });
      
      // Navigate to dashboard after successful configuration
      navigate('/');
      
    } catch (error) {
      console.error('Error during farm setup:', error);
      toast({
        title: translate('error'),
        description: error instanceof Error ? error.message : translate('config_save_error'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const goToUserManagement = () => {
    navigate('/user-management');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{backgroundColor: '#C8E9F6'}}>
      <Card className="w-full max-w-4xl bg-card/95 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            {translate('initial_setup')}
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            {translate('setup_description')}
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Nom de la ferme */}
            <div className="space-y-2">
              <Label htmlFor="farm_name" className="text-base font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {translate('farm_name')} *
              </Label>
              <Input
                id="farm_name"
                value={formData.farm_name}
                onChange={(e) => setFormData(prev => ({ ...prev, farm_name: e.target.value }))}
                placeholder={translate('farm_name_placeholder')}
                className="text-base"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Langue */}
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {translate('language')}
                </Label>
                <Select value={formData.language} onValueChange={(value: 'fr' | 'en') => {
                  setFormData(prev => ({ ...prev, language: value }));
                  updateLanguage(value); // Update language immediately
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">{translate('french')}</SelectItem>
                    <SelectItem value="en">{translate('english')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Devise */}
              <div className="space-y-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {translate('currency')}
                </Label>
                <Select value={formData.currency} onValueChange={(value: 'fcfa' | 'eur' | 'usd') => 
                  setFormData(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fcfa">{translate('fcfa')}</SelectItem>
                    <SelectItem value="eur">{translate('eur')}</SelectItem>
                    <SelectItem value="usd">{translate('usd')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Types de bassins */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Waves className="h-4 w-4" />
                {translate('basin_types')} *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {basinOptions.map((basin) => (
                  <div key={basin.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={basin.value}
                      checked={formData.basin_types.includes(basin.value)}
                      onCheckedChange={(checked) => handleBasinTypeChange(basin.value, checked as boolean)}
                    />
                    <Label htmlFor={basin.value} className="text-sm">
                      {translate(basin.labelKey)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Espèces élevées */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Fish className="h-4 w-4" />
                {translate('fish_species')} *
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {speciesOptions.map((species) => (
                  <div key={species.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={species.value}
                      checked={formData.fish_species.includes(species.value)}
                      onCheckedChange={(checked) => handleSpeciesChange(species.value, checked as boolean)}
                    />
                    <Label htmlFor={species.value} className="text-sm">
                      {translate(species.labelKey)}
                    </Label>
                  </div>
                ))}
              </div>
              
              {/* Ajouter espèce personnalisée */}
              <div className="flex gap-2">
                <Input
                  value={formData.custom_species}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_species: e.target.value }))}
                  placeholder={translate('other_species')}
                  className="flex-1"
                />
                <Button type="button" onClick={addCustomSpecies} variant="outline">
                  {translate('add')}
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

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1 text-lg py-6">
                {loading ? translate('configuring') : translate('validate_config')}
              </Button>
              <Button type="button" onClick={goToUserManagement} variant="outline" className="flex-1 text-lg py-6 flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                {translate('go_to_user_management')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmSetup;