import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Bell, BellOff, CheckCircle, Droplets, Package, Heart, Coffee, Download, Search, Filter } from "lucide-react";
import { useAlerts } from "@/hooks/useAlerts";
import * as XLSX from "xlsx";

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

const Alerts = () => {
  const { alerts, acknowledgeAlert } = useAlerts();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || alert.type === filterType;
    const matchesSeverity = filterSeverity === "all" || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "acknowledged" && alert.acknowledged) ||
                         (filterStatus === "unacknowledged" && !alert.acknowledged);
    
    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

  const exportToExcel = () => {
    const exportData = filteredAlerts.map(alert => ({
      'ID': alert.id,
      'Type': alert.type,
      'Sévérité': alert.severity,
      'Titre': alert.title,
      'Description': alert.description,
      'Cage': alert.cage_name || 'N/A',
      'Statut': alert.acknowledged ? 'Lu' : 'Non lu',
      'Date de création': new Date(alert.created_at).toLocaleString('fr-FR')
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alertes");
    
    const fileName = `alertes_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Toutes les alertes</h1>
        <p className="text-muted-foreground">Gérez et exportez vos alertes</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres et recherche
            </span>
            <Button onClick={exportToExcel} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exporter en Excel
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher dans les alertes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="water">Qualité eau</SelectItem>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="health">Santé</SelectItem>
                <SelectItem value="feeding">Alimentation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Sévérité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="unacknowledged">Non lues</SelectItem>
                <SelectItem value="acknowledged">Lues</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertes ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8">
                <BellOff className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">Aucune alerte trouvée</p>
                <p className="text-muted-foreground/80 text-sm">Ajustez vos filtres pour voir plus d'alertes</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const IconComponent = getAlertIcon(alert.type);
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getSeverityBgColor(alert.severity)} ${
                      alert.acknowledged ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-foreground font-medium">{alert.title}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="outline" className="text-xs">
                              Lu
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-3">{alert.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground/80">
                            <span>Type: {alert.type}</span>
                            {alert.cage_name && <span>📍 {alert.cage_name}</span>}
                            <span>{new Date(alert.created_at).toLocaleString('fr-FR')}</span>
                          </div>
                          
                          {!alert.acknowledged && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="h-8 px-3 text-xs bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Alerts;