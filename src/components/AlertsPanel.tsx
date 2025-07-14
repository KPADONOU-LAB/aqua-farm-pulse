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
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getSeverityBgColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-50/10 border-red-200/20';
    case 'high': return 'bg-orange-50/10 border-orange-200/20';
    case 'medium': return 'bg-yellow-50/10 border-yellow-200/20';
    case 'low': return 'bg-blue-50/10 border-blue-200/20';
    default: return 'bg-gray-50/10 border-gray-200/20';
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
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertes
            {unacknowledgedCount > 0 && (
              <Badge className="bg-red-500 text-white ml-2">
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
          <div className="text-red-400 text-sm font-medium">
            ⚠️ {criticalCount} alerte{criticalCount > 1 ? 's' : ''} critique{criticalCount > 1 ? 's' : ''} nécessite{criticalCount > 1 ? 'nt' : ''} une attention immédiate
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-4">
              <BellOff className="h-8 w-8 text-white/40 mx-auto mb-2" />
              <p className="text-white/70">
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
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium text-sm">{alert.title}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      
                      <p className="text-white/80 text-xs mb-2">{alert.description}</p>
                      
                      {alert.cage_name && (
                        <p className="text-white/60 text-xs mb-2">📍 {alert.cage_name}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-white/50 text-xs">
                          {new Date(alert.created_at).toLocaleString('fr-FR')}
                        </span>
                        
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="h-6 px-2 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
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
            <Button variant="outline" size="sm" className="text-white/80 border-white/20">
              Voir toutes les alertes ({alerts.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};