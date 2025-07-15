import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, BellOff, CheckCircle, Droplets, Package, Heart, Coffee } from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'water': return Droplets;
    case 'stock': return Package;
    case 'health': return Heart;
    case 'feeding': return Coffee;
    default: return AlertTriangle;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30';
    case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'low': return 'bg-primary/20 text-primary border-primary/30';
    default: return 'bg-muted/20 text-muted-foreground border-muted/30';
  }
};

const getSeverityBgColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-destructive/10 border-destructive/20 backdrop-blur-sm';
    case 'high': return 'bg-orange-500/10 border-orange-500/20 backdrop-blur-sm';
    case 'medium': return 'bg-yellow-500/10 border-yellow-500/20 backdrop-blur-sm';
    case 'low': return 'bg-primary/10 border-primary/20 backdrop-blur-sm';
    default: return 'bg-card/50 border-border backdrop-blur-sm';
  }
};

interface AlertsPanelProps {
  maxAlerts?: number;
  showAllTypes?: boolean;
}

export const AlertsPanel = ({ maxAlerts = 5, showAllTypes = true }: AlertsPanelProps) => {
  const { alerts, acknowledgeAlert, getUnacknowledgedCount, getCriticalCount } = useAlerts();
  const [filter, setFilter] = useState<'all' | 'unacknowledged'>('unacknowledged');
  
  const filteredAlerts = alerts
    .filter(alert => filter === 'all' || !alert.acknowledged)
    .slice(0, maxAlerts);

  const unacknowledgedCount = getUnacknowledgedCount();
  const criticalCount = getCriticalCount();

  return (
    <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertes
            {unacknowledgedCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground ml-2">
                {unacknowledgedCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex gap-2">
            <Button
              variant={filter === 'unacknowledged' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unacknowledged')}
              className="text-xs"
            >
              <Bell className="h-3 w-3 mr-1" />
              Non lues ({unacknowledgedCount})
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="text-xs"
            >
              Toutes
            </Button>
          </div>
        </div>
        
        {criticalCount > 0 && (
          <div className="text-destructive text-sm font-medium bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            ⚠️ {criticalCount} alerte{criticalCount > 1 ? 's' : ''} critique{criticalCount > 1 ? 's' : ''} nécessite{criticalCount > 1 ? 'nt' : ''} une attention immédiate
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-4">
              <BellOff className="h-8 w-8 text-muted-foreground/60 mx-auto mb-2" />
              <p className="text-muted-foreground">
                {filter === 'unacknowledged' ? 'Aucune nouvelle alerte' : 'Aucune alerte'}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const IconComponent = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getSeverityBgColor(alert.severity)} ${
                    alert.acknowledged ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-primary/20 rounded-lg">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-foreground font-medium text-sm">{alert.title}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground text-xs mb-2">{alert.description}</p>
                      
                      {alert.cage_name && (
                        <p className="text-muted-foreground/80 text-xs mb-2">📍 {alert.cage_name}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground/70 text-xs">
                          {new Date(alert.created_at).toLocaleString('fr-FR')}
                        </span>
                        
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="h-6 px-2 text-xs bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Marquer comme lu
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {alerts.length > maxAlerts && (
          <div className="text-center mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-muted-foreground border-border hover:bg-accent"
              onClick={() => window.location.href = '/alerts'}
            >
              Voir toutes les alertes ({alerts.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};