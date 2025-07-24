import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  LayoutDashboard, 
  Save, 
  X, 
  Star,
  Copy,
  Grid,
  Palette
} from 'lucide-react';
import { useCustomDashboard, DashboardLayout } from '@/hooks/useCustomDashboard';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';
import { useToast } from '@/hooks/use-toast';
import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const CustomDashboards = () => {
  const { toast } = useToast();
  const {
    dashboards,
    currentDashboard,
    selectedDashboard,
    dashboardWidgets,
    availableWidgets,
    editMode,
    setEditMode,
    setSelectedDashboard,
    createDashboard,
    updateDashboard,
    deleteDashboard,
    addWidgetToDashboard,
    removeWidgetFromDashboard,
    updateWidgetLayout,
    setAsDefault,
    isLoading,
    isUpdating,
    isCreating,
  } = useCustomDashboard();

  const [newDashboardDialog, setNewDashboardDialog] = useState(false);
  const [editDashboardDialog, setEditDashboardDialog] = useState(false);
  const [addWidgetDialog, setAddWidgetDialog] = useState(false);
  const [dashboardForm, setDashboardForm] = useState({
    nom_dashboard: '',
    description: '',
    icone: 'layout-dashboard',
    couleur: '#3b82f6'
  });

  const handleLayoutChange = (layouts: any[]) => {
    if (!editMode || !currentDashboard) return;

    const updatedLayouts: DashboardLayout[] = layouts.map(layout => ({
      id: layout.i,
      widgetId: currentDashboard.configuration.find(c => c.id === layout.i)?.widgetId || '',
      position: {
        x: layout.x,
        y: layout.y,
        w: layout.w,
        h: layout.h
      }
    }));

    updateWidgetLayout(updatedLayouts);
  };

  const handleAddWidget = (widgetId: string) => {
    addWidgetToDashboard(widgetId);
    setAddWidgetDialog(false);
  };

  const handleCreateDashboard = () => {
    createDashboard(dashboardForm);
    setNewDashboardDialog(false);
    setDashboardForm({
      nom_dashboard: '',
      description: '',
      icone: 'layout-dashboard',
      couleur: '#3b82f6'
    });
  };

  const handleEditDashboard = () => {
    if (!currentDashboard) return;
    updateDashboard({
      id: currentDashboard.id,
      updates: dashboardForm
    });
    setEditDashboardDialog(false);
  };

  const openEditDialog = () => {
    if (currentDashboard) {
      setDashboardForm({
        nom_dashboard: currentDashboard.nom_dashboard,
        description: currentDashboard.description || '',
        icone: currentDashboard.icone || 'layout-dashboard',
        couleur: currentDashboard.couleur || '#3b82f6'
      });
      setEditDashboardDialog(true);
    }
  };

  const duplicateDashboard = () => {
    if (!currentDashboard) return;
    createDashboard({
      nom_dashboard: `${currentDashboard.nom_dashboard} (Copie)`,
      description: currentDashboard.description,
      configuration: currentDashboard.configuration,
      icone: currentDashboard.icone,
      couleur: currentDashboard.couleur
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const gridLayouts = currentDashboard?.configuration.map(layout => ({
    i: layout.id,
    x: layout.position.x,
    y: layout.position.y,
    w: layout.position.w,
    h: layout.position.h,
    minW: 2,
    minH: 2
  })) || [];

  const iconOptions = [
    { value: 'layout-dashboard', label: 'Dashboard' },
    { value: 'grid', label: 'Grille' },
    { value: 'chart-line', label: 'Graphique' },
    { value: 'fish', label: 'Poisson' },
    { value: 'activity', label: 'Activité' },
    { value: 'bar-chart', label: 'Barres' }
  ];

  const colorOptions = [
    { value: '#3b82f6', label: 'Bleu' },
    { value: '#10b981', label: 'Vert' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#ef4444', label: 'Rouge' },
    { value: '#8b5cf6', label: 'Violet' },
    { value: '#06b6d4', label: 'Cyan' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableaux de Bord</h1>
          <p className="text-muted-foreground">
            Créez et personnalisez vos tableaux de bord avec des widgets configurables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={editMode ? "default" : "outline"}
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2"
          >
            {editMode ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            {editMode ? 'Sauvegarder' : 'Modifier'}
          </Button>
          <Dialog open={newDashboardDialog} onOpenChange={setNewDashboardDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouveau Dashboard
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau dashboard</DialogTitle>
                <DialogDescription>
                  Configurez votre nouveau tableau de bord personnalisé
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nom">Nom du dashboard</Label>
                  <Input
                    id="nom"
                    value={dashboardForm.nom_dashboard}
                    onChange={(e) => setDashboardForm(prev => ({ ...prev, nom_dashboard: e.target.value }))}
                    placeholder="Mon tableau de bord"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={dashboardForm.description}
                    onChange={(e) => setDashboardForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du dashboard..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icone">Icône</Label>
                    <Select value={dashboardForm.icone} onValueChange={(value) => setDashboardForm(prev => ({ ...prev, icone: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="couleur">Couleur</Label>
                    <Select value={dashboardForm.couleur} onValueChange={(value) => setDashboardForm(prev => ({ ...prev, couleur: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: option.value }}
                              />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setNewDashboardDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateDashboard} disabled={isCreating}>
                    Créer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar des dashboards */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Mes Dashboards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {dashboards?.map(dashboard => (
                    <div
                      key={dashboard.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedDashboard === dashboard.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedDashboard(dashboard.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: dashboard.couleur }}
                          />
                          <span className="font-medium truncate">
                            {dashboard.nom_dashboard}
                          </span>
                          {dashboard.est_par_defaut && (
                            <Star className="h-3 w-3 fill-current" />
                          )}
                        </div>
                        {selectedDashboard === dashboard.id && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog();
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateDashboard();
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            {!dashboard.est_par_defaut && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Supprimer le dashboard</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer ce dashboard ? Cette action est irréversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteDashboard(dashboard.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        )}
                      </div>
                      {dashboard.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {dashboard.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {editMode && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Ajouter un Widget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={addWidgetDialog} onOpenChange={setAddWidgetDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      Parcourir les widgets
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Ajouter un widget</DialogTitle>
                      <DialogDescription>
                        Choisissez un widget à ajouter à votre dashboard
                      </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="all" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">Tous</TabsTrigger>
                        <TabsTrigger value="metrics">Métriques</TabsTrigger>
                        <TabsTrigger value="charts">Graphiques</TabsTrigger>
                        <TabsTrigger value="tables">Tableaux</TabsTrigger>
                      </TabsList>
                      <TabsContent value="all" className="mt-4">
                        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                          {availableWidgets?.map(widget => (
                            <Card 
                              key={widget.id} 
                              className="cursor-pointer hover:border-primary transition-colors"
                              onClick={() => handleAddWidget(widget.id)}
                            >
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">{widget.nom_widget}</CardTitle>
                                <div className="flex gap-2">
                                  <Badge variant="secondary">{widget.type_widget}</Badge>
                                  {widget.categories?.map(cat => (
                                    <Badge key={cat} variant="outline" className="text-xs">
                                      {cat}
                                    </Badge>
                                  ))}
                                </div>
                              </CardHeader>
                              <CardContent>
                                <p className="text-xs text-muted-foreground">
                                  {widget.description}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="metrics">
                        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                          {availableWidgets?.filter(w => w.type_widget === 'metric').map(widget => (
                            <Card 
                              key={widget.id} 
                              className="cursor-pointer hover:border-primary transition-colors"
                              onClick={() => handleAddWidget(widget.id)}
                            >
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">{widget.nom_widget}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-xs text-muted-foreground">
                                  {widget.description}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="charts">
                        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                          {availableWidgets?.filter(w => w.type_widget === 'chart').map(widget => (
                            <Card 
                              key={widget.id} 
                              className="cursor-pointer hover:border-primary transition-colors"
                              onClick={() => handleAddWidget(widget.id)}
                            >
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">{widget.nom_widget}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-xs text-muted-foreground">
                                  {widget.description}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="tables">
                        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                          {availableWidgets?.filter(w => w.type_widget === 'table').map(widget => (
                            <Card 
                              key={widget.id} 
                              className="cursor-pointer hover:border-primary transition-colors"
                              onClick={() => handleAddWidget(widget.id)}
                            >
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">{widget.nom_widget}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-xs text-muted-foreground">
                                  {widget.description}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Zone principale du dashboard */}
        <div className="col-span-9">
          {currentDashboard ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: currentDashboard.couleur }}
                    />
                    {currentDashboard.nom_dashboard}
                    {currentDashboard.est_par_defaut && (
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                    )}
                  </h2>
                  {currentDashboard.description && (
                    <p className="text-muted-foreground">{currentDashboard.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {!currentDashboard.est_par_defaut && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAsDefault(currentDashboard.id)}
                      className="flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Définir par défaut
                    </Button>
                  )}
                </div>
              </div>

              {dashboardWidgets.length > 0 ? (
                <ResponsiveGridLayout
                  className="layout"
                  layouts={{ lg: gridLayouts }}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                  rowHeight={60}
                  onLayoutChange={handleLayoutChange}
                  isDraggable={editMode}
                  isResizable={editMode}
                  margin={[16, 16]}
                >
                  {dashboardWidgets.map((widget) => (
                    <div key={widget.layout.id}>
                      <WidgetRenderer
                        widget={widget}
                        editMode={editMode}
                        onRemove={() => removeWidgetFromDashboard(widget.layout.id)}
                      />
                    </div>
                  ))}
                </ResponsiveGridLayout>
              ) : (
                <Card className="p-12 text-center">
                  <Grid className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Dashboard vide</h3>
                  <p className="text-muted-foreground mb-4">
                    Commencez par ajouter des widgets à votre dashboard
                  </p>
                  {editMode && (
                    <Button onClick={() => setAddWidgetDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un widget
                    </Button>
                  )}
                </Card>
              )}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Aucun dashboard sélectionné</h3>
              <p className="text-muted-foreground mb-4">
                Sélectionnez un dashboard dans la sidebar ou créez-en un nouveau
              </p>
              <Button onClick={() => setNewDashboardDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un dashboard
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog d'édition de dashboard */}
      <Dialog open={editDashboardDialog} onOpenChange={setEditDashboardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le dashboard</DialogTitle>
            <DialogDescription>
              Modifiez les propriétés de votre dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nom">Nom du dashboard</Label>
              <Input
                id="edit-nom"
                value={dashboardForm.nom_dashboard}
                onChange={(e) => setDashboardForm(prev => ({ ...prev, nom_dashboard: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={dashboardForm.description}
                onChange={(e) => setDashboardForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-icone">Icône</Label>
                <Select value={dashboardForm.icone} onValueChange={(value) => setDashboardForm(prev => ({ ...prev, icone: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-couleur">Couleur</Label>
                <Select value={dashboardForm.couleur} onValueChange={(value) => setDashboardForm(prev => ({ ...prev, couleur: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: option.value }}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDashboardDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleEditDashboard} disabled={isUpdating}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomDashboards;