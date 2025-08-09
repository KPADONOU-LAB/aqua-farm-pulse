import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, X, RefreshCw, Eye, Lightbulb, Euro } from "lucide-react";
import { useSmartAlerts } from "@/hooks/useSmartAlerts";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
const SmartAlerts = () => {
  const {
    alerts,
    loading,
    generateSmartAlerts,
    markAsRead,
    markAsResolved,
    dismissAlert,
    getActiveAlerts,
    getCriticalAlerts,
    getUnreadAlerts
  } = useSmartAlerts();
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const activeAlerts = getActiveAlerts();
  const criticalAlerts = getCriticalAlerts();
  const unreadAlerts = getUnreadAlerts();
  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'destructive';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  const getCriticalityIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };
  const handleResolve = async (alertId: string) => {
    const actions = resolutionNotes.split('\n').filter(line => line.trim());
    await markAsResolved(alertId, actions);
    setSelectedAlert(null);
    setResolutionNotes('');
  };
  if (loading) {
    return <div className="min-h-screen p-6 animate-fade-in">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({
          length: 6
        }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>;
  }
  return <div className="min-h-screen p-6 animate-fade-in bg-neutral-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-black">
          Alertes Intelligentes
        </h1>
        <p className="text-lg text-black">
          Surveillance automatique et recommandations
        </p>
        <div className="flex items-center gap-2 mt-2 text-white/60">
          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
          <span className="text-sm text-black">Surveillance en temps réel</span>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex gap-4 mb-6">
        <Button onClick={generateSmartAlerts} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <RefreshCw className="mr-2 h-4 w-4" />
          Analyser maintenant
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes actives</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une attention
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Action immédiate requise
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non lues</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Nouvelles alertes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact estimé</CardTitle>
            <Euro className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{activeAlerts.reduce((sum, alert) => sum + (alert.impact_estime || 0), 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Perte potentielle évitée
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des alertes */}
      <div className="grid grid-cols-1 gap-4">
        {alerts.map(alert => <Card key={alert.id} className={`bg-card/80 backdrop-blur-md border-border/20 shadow-lg hover:shadow-xl transition-all duration-200 ${alert.niveau_criticite === 'critical' ? 'border-destructive/50 bg-destructive/5' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getCriticalityIcon(alert.niveau_criticite)}
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {alert.titre}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {alert.cage?.nom && `Cage: ${alert.cage.nom} • `}
                      {new Date(alert.date_detection).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getCriticalityColor(alert.niveau_criticite) as any}>
                    {alert.niveau_criticite}
                  </Badge>
                  <Badge variant="outline">
                    {alert.statut}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">{alert.message}</p>
              
              {alert.impact_estime && <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-sm font-medium text-destructive">
                    Impact financier estimé: €{alert.impact_estime.toFixed(2)}
                  </p>
                </div>}

              {alert.recommandations.length > 0 && <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Recommandations:
                  </h4>
                  <ul className="space-y-1 ml-6">
                    {alert.recommandations.map((rec, index) => <li key={index} className="text-sm text-muted-foreground list-disc">
                        {rec}
                      </li>)}
                  </ul>
                </div>}

              {alert.statut === 'active' && <div className="flex gap-2 pt-4 border-t">
                  <Button size="sm" variant="outline" onClick={() => markAsRead(alert.id)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Marquer comme lu
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={() => setSelectedAlert(alert)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Résoudre
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Résoudre l'alerte</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">{alert.titre}</h4>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="resolution-notes">Actions effectuées</Label>
                          <Textarea id="resolution-notes" placeholder="Décrivez les actions que vous avez prises pour résoudre cette alerte..." value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} rows={4} />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                            Annuler
                          </Button>
                          <Button onClick={() => handleResolve(alert.id)}>
                            Marquer comme résolu
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button size="sm" variant="ghost" onClick={() => dismissAlert(alert.id)}>
                    <X className="mr-2 h-4 w-4" />
                    Ignorer
                  </Button>
                </div>}
            </CardContent>
          </Card>)}
      </div>

      {alerts.length === 0 && <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucune alerte active</h3>
            <p className="text-muted-foreground">
              Toutes vos opérations fonctionnent normalement. Excellent travail !
            </p>
          </CardContent>
        </Card>}
    </div>;
};
export default SmartAlerts;