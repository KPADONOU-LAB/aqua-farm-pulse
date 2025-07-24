import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X } from 'lucide-react';
import { useCustomDashboard } from '@/hooks/useCustomDashboard';

interface WidgetCreatorProps {
  onWidgetCreated?: () => void;
}

export const WidgetCreator: React.FC<WidgetCreatorProps> = ({ onWidgetCreated }) => {
  const { createWidget } = useCustomDashboard();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nom_widget: '',
    type_widget: 'metric',
    description: '',
    icone: 'activity',
    taille_defaut: 'medium',
    categories: [] as string[],
    configuration: {
      source: '',
      metric: 'count',
      title: '',
      color: '#3b82f6'
    }
  });
  const [newCategory, setNewCategory] = useState('');

  const widgetTypes = [
    { value: 'metric', label: 'Métrique' },
    { value: 'chart', label: 'Graphique' },
    { value: 'table', label: 'Tableau' },
    { value: 'progress', label: 'Progression' },
    { value: 'alert', label: 'Alerte' }
  ];

  const iconOptions = [
    { value: 'activity', label: 'Activité' },
    { value: 'bar-chart', label: 'Graphique en barres' },
    { value: 'pie-chart', label: 'Graphique circulaire' },
    { value: 'trending-up', label: 'Tendance montante' },
    { value: 'trending-down', label: 'Tendance descendante' },
    { value: 'fish', label: 'Poisson' },
    { value: 'dollar-sign', label: 'Dollar' },
    { value: 'alert-triangle', label: 'Alerte' }
  ];

  const sizeOptions = [
    { value: 'small', label: 'Petit' },
    { value: 'medium', label: 'Moyen' },
    { value: 'large', label: 'Grand' },
    { value: 'xl', label: 'Très grand' }
  ];

  const dataSourceOptions = [
    { value: 'cages', label: 'Cages' },
    { value: 'feeding_sessions', label: 'Sessions d\'alimentation' },
    { value: 'water_quality', label: 'Qualité de l\'eau' },
    { value: 'health_observations', label: 'Observations de santé' },
    { value: 'sales', label: 'Ventes' },
    { value: 'financial_data', label: 'Données financières' },
    { value: 'smart_alerts', label: 'Alertes intelligentes' },
    { value: 'inventory', label: 'Inventaire' }
  ];

  const metricOptions = [
    { value: 'count', label: 'Nombre' },
    { value: 'sum', label: 'Somme' },
    { value: 'average', label: 'Moyenne' }
  ];

  const addCategory = () => {
    if (newCategory && !formData.categories.includes(newCategory)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory]
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  const handleSubmit = () => {
    createWidget({
      nom_widget: formData.nom_widget,
      type_widget: formData.type_widget,
      description: formData.description,
      icone: formData.icone,
      taille_defaut: formData.taille_defaut,
      categories: formData.categories,
      configuration: formData.configuration
    });
    
    setOpen(false);
    onWidgetCreated?.();
    
    // Reset form
    setFormData({
      nom_widget: '',
      type_widget: 'metric',
      description: '',
      icone: 'activity',
      taille_defaut: 'medium',
      categories: [],
      configuration: {
        source: '',
        metric: 'count',
        title: '',
        color: '#3b82f6'
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Créer un widget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un widget personnalisé</DialogTitle>
          <DialogDescription>
            Créez votre propre widget avec des données et une configuration personnalisées
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations générales</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom_widget">Nom du widget</Label>
                <Input
                  id="nom_widget"
                  value={formData.nom_widget}
                  onChange={(e) => setFormData(prev => ({ ...prev, nom_widget: e.target.value }))}
                  placeholder="Mon widget personnalisé"
                />
              </div>
              <div>
                <Label htmlFor="type_widget">Type de widget</Label>
                <Select value={formData.type_widget} onValueChange={(value) => setFormData(prev => ({ ...prev, type_widget: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {widgetTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du widget..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icone">Icône</Label>
                <Select value={formData.icone} onValueChange={(value) => setFormData(prev => ({ ...prev, icone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(icon => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="taille">Taille par défaut</Label>
                <Select value={formData.taille_defaut} onValueChange={(value) => setFormData(prev => ({ ...prev, taille_defaut: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeOptions.map(size => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Catégories */}
            <div>
              <Label>Catégories</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nouvelle catégorie"
                  onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                />
                <Button type="button" onClick={addCategory} size="sm">
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.categories.map(category => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1">
                    {category}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeCategory(category)} 
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration du widget */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuration des données</h3>
            
            <Tabs value={formData.type_widget} className="w-full">
              <TabsContent value="metric">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Source de données</Label>
                      <Select 
                        value={formData.configuration.source} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          configuration: { ...prev.configuration, source: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une source" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataSourceOptions.map(source => (
                            <SelectItem key={source.value} value={source.value}>
                              {source.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Type de métrique</Label>
                      <Select 
                        value={formData.configuration.metric} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          configuration: { ...prev.configuration, metric: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {metricOptions.map(metric => (
                            <SelectItem key={metric.value} value={metric.value}>
                              {metric.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Titre d'affichage</Label>
                      <Input
                        value={formData.configuration.title}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          configuration: { ...prev.configuration, title: e.target.value }
                        }))}
                        placeholder="Titre du widget"
                      />
                    </div>
                    <div>
                      <Label>Couleur</Label>
                      <Input
                        type="color"
                        value={formData.configuration.color}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          configuration: { ...prev.configuration, color: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="chart">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configuration des graphiques disponible prochainement
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="table">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configuration des tableaux disponible prochainement
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="progress">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configuration des barres de progression disponible prochainement
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="alert">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configuration des alertes disponible prochainement
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.nom_widget || !formData.configuration.source}
            >
              Créer le widget
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};