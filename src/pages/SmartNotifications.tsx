import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { toast } from '@/hooks/use-toast';
import { Bell, BellRing, Settings, Zap, TrendingUp, AlertTriangle, CheckCircle, Clock, Brain, Shield, Volume2, Smartphone, Mail, Eye, EyeOff, Play, Pause, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
const SmartNotifications = () => {
  const {
    alerts,
    alertConfigs,
    preferences,
    loading,
    permissionStatus,
    requestNotificationPermission,
    savePreferences,
    acknowledgeAlert,
    resolveAlert,
    generatePredictiveAlerts,
    updateAlertConfig,
    testNotification,
    refreshAlerts
  } = useSmartNotifications();
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const handlePermissionRequest = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      toast({
        title: "Permissions accordées",
        description: "Les notifications push sont maintenant activées."
      });
    } else {
      toast({
        title: "Permissions refusées",
        description: "Les notifications push ne pourront pas être affichées.",
        variant: "destructive"
      });
    }
  };
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'health':
        return <Shield className="h-4 w-4" />;
      case 'performance':
        return <TrendingUp className="h-4 w-4" />;
      case 'financial':
        return <AlertTriangle className="h-4 w-4" />;
      case 'predictive':
        return <Brain className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const predictiveAlerts = alerts.filter(alert => alert.type === 'predictive');
  return <div className="min-h-screen p-6 animate-fade-in bg-neutral-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-black">
            Notifications & Alertes Intelligentes
          </h1>
          <p className="text-lg text-black">
            Système avancé de surveillance et prédictions IA
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={generatePredictiveAlerts} className="bg-purple-gradient hover:bg-purple-600 text-white" disabled={loading}>
            <Brain className="mr-2 h-4 w-4" />
            Analyser IA
          </Button>
          <Button onClick={testNotification} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Play className="mr-2 h-4 w-4" />
            Test
          </Button>
        </div>
      </div>

      {/* Statut des permissions */}
      {permissionStatus !== 'granted' && <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellRing className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Notifications push désactivées</p>
                  <p className="text-sm text-orange-600">
                    Activez les notifications pour recevoir les alertes critiques
                  </p>
                </div>
              </div>
              <Button onClick={handlePermissionRequest} className="bg-orange-600 hover:bg-orange-700 text-white">
                Activer
              </Button>
            </div>
          </CardContent>
        </Card>}

      {/* KPIs Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stat-card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Actives</CardTitle>
            <AlertTriangle className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeAlerts.length}</div>
            <p className="text-xs opacity-80">{criticalAlerts.length} critiques</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prédictions IA</CardTitle>
            <Brain className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{predictiveAlerts.length}</div>
            <p className="text-xs opacity-80">Alertes prédictives</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{permissionStatus === 'granted' ? 'ON' : 'OFF'}</div>
            <p className="text-xs opacity-80">Push activées</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configurations</CardTitle>
            <Settings className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{alertConfigs.filter(c => c.enabled).length}</div>
            <p className="text-xs opacity-80">Règles actives</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-white/20 text-black">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Tableau de Bord
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-white/20 text-black">
            <Bell className="mr-2 h-4 w-4" />
            Alertes
          </TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-white/20 text-black">
            <Settings className="mr-2 h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-white/20 text-black">
            <Smartphone className="mr-2 h-4 w-4" />
            Préférences
          </TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alertes Critiques */}
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Alertes Critiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalAlerts.slice(0, 5).map(alert => <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-red-800">{alert.title}</p>
                          <p className="text-sm text-red-600">{alert.message}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(alert.createdAt), 'dd/MM/yyyy à HH:mm', {
                          locale: fr
                        })}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => acknowledgeAlert(alert.id)} className="text-red-600 hover:bg-red-100">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => resolveAlert(alert.id)} className="text-green-600 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>)}
                  {criticalAlerts.length === 0 && <p className="text-center text-gray-500 py-4">Aucune alerte critique</p>}
                </div>
              </CardContent>
            </Card>

            {/* Prédictions IA */}
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Brain className="h-5 w-5" />
                  Prédictions IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictiveAlerts.slice(0, 5).map(alert => <div key={alert.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-purple-800">{alert.title}</p>
                          <p className="text-sm text-purple-600">{alert.message}</p>
                          {alert.confidence && <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                Confiance: {(alert.confidence * 100).toFixed(0)}%
                              </Badge>
                            </div>}
                        </div>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>)}
                  {predictiveAlerts.length === 0 && <div className="text-center py-4">
                      <p className="text-gray-500 mb-3">Aucune prédiction disponible</p>
                      <Button onClick={generatePredictiveAlerts} className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Brain className="mr-2 h-4 w-4" />
                        Générer des prédictions
                      </Button>
                    </div>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activité récente */}
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activité Récente
                </CardTitle>
                <Button onClick={refreshAlerts} variant="ghost" size="sm" disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 10).map(alert => <div key={alert.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(alert.type)}
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <p className="text-sm text-gray-600 truncate max-w-md">{alert.message}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(alert.createdAt), 'dd/MM/yyyy à HH:mm', {
                        locale: fr
                      })}
                          {alert.cageName && ` • ${alert.cageName}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {alert.status === 'active' && <>
                          <Button size="sm" variant="ghost" onClick={() => acknowledgeAlert(alert.id)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => resolveAlert(alert.id)}>
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        </>}
                      {alert.status === 'resolved' && <Badge variant="outline" className="text-green-600">
                          Résolue
                        </Badge>}
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Liste des Alertes */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Toutes les Alertes</h2>
            <div className="flex gap-2">
              <Button onClick={() => {/* Filtrer par type */}} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Filtrer
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {alerts.map(alert => <Card key={alert.id} className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(alert.type)}
                      <div>
                        <h3 className="font-bold text-lg">{alert.title}</h3>
                        <p className="text-gray-600">{alert.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      {alert.confidence && <Badge variant="outline">
                          {(alert.confidence * 100).toFixed(0)}% confiance
                        </Badge>}
                    </div>
                  </div>

                  {alert.recommendations.length > 0 && <div className="mb-4">
                      <h4 className="font-medium mb-2">Recommandations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {alert.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                      </ul>
                    </div>}

                  {alert.prediction && <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-800 mb-2">Prédiction:</h4>
                      <p className="text-sm text-purple-600">
                        Probabilité: {alert.prediction.probability.toFixed(0)}% • 
                        Horizon: {alert.prediction.timeframe}
                      </p>
                    </div>}

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {format(new Date(alert.createdAt), 'dd/MM/yyyy à HH:mm', {
                    locale: fr
                  })}
                      {alert.cageName && ` • ${alert.cageName}`}
                      {alert.estimatedImpact && ` • Impact: ${alert.estimatedImpact.toFixed(0)}€`}
                    </div>
                    <div className="flex gap-2">
                      {alert.status === 'active' && <>
                          <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(alert.id)}>
                            Accusé réception
                          </Button>
                          <Button size="sm" onClick={() => resolveAlert(alert.id)}>
                            Résoudre
                          </Button>
                        </>}
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </TabsContent>

        {/* Configuration */}
        <TabsContent value="config" className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Configuration des Alertes</h2>
          
          <div className="grid gap-6">
            {alertConfigs.map(config => <Card key={config.id} className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="capitalize">{config.type} - {config.id.replace('_', ' ')}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Escalation: {config.escalationTime}min • 
                        Destinataires: {config.recipients.length}
                      </p>
                    </div>
                    <Switch checked={config.enabled} onCheckedChange={enabled => updateAlertConfig(config.id, {
                  enabled
                })} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Seuil d'alerte</Label>
                      <Input type="number" value={config.thresholds.warning} onChange={e => updateAlertConfig(config.id, {
                    thresholds: {
                      ...config.thresholds,
                      warning: Number(e.target.value)
                    }
                  })} />
                    </div>
                    <div>
                      <Label>Seuil critique</Label>
                      <Input type="number" value={config.thresholds.critical} onChange={e => updateAlertConfig(config.id, {
                    thresholds: {
                      ...config.thresholds,
                      critical: Number(e.target.value)
                    }
                  })} />
                    </div>
                    <div>
                      <Label>Escalation (min)</Label>
                      <Input type="number" value={config.escalationTime} onChange={e => updateAlertConfig(config.id, {
                    escalationTime: Number(e.target.value)
                  })} />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch checked={config.pushEnabled} onCheckedChange={pushEnabled => updateAlertConfig(config.id, {
                    pushEnabled
                  })} />
                      <Label>Push</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={config.emailEnabled} onCheckedChange={emailEnabled => updateAlertConfig(config.id, {
                    emailEnabled
                  })} />
                      <Label>Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={config.smsEnabled} onCheckedChange={smsEnabled => updateAlertConfig(config.id, {
                    smsEnabled
                  })} />
                      <Label>SMS</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </TabsContent>

        {/* Préférences */}
        <TabsContent value="preferences" className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Préférences de Notification</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Canaux de notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label>Notifications push</Label>
                  </div>
                  <Switch checked={preferences.pushEnabled} onCheckedChange={pushEnabled => savePreferences({
                  pushEnabled
                })} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label>Notifications email</Label>
                  </div>
                  <Switch checked={preferences.emailEnabled} onCheckedChange={emailEnabled => savePreferences({
                  emailEnabled
                })} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <Label>Sons d'alerte</Label>
                  </div>
                  <Switch checked={preferences.soundEnabled} onCheckedChange={soundEnabled => savePreferences({
                  soundEnabled
                })} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label>Vibrations</Label>
                  </div>
                  <Switch checked={preferences.vibrationEnabled} onCheckedChange={vibrationEnabled => savePreferences({
                  vibrationEnabled
                })} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle>Filtres et préférences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Alertes critiques uniquement</Label>
                  <Switch checked={preferences.criticalOnly} onCheckedChange={criticalOnly => savePreferences({
                  criticalOnly
                })} />
                </div>

                <div>
                  <Label>Heures de silence</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch checked={preferences.quietHours.enabled} onCheckedChange={enabled => savePreferences({
                      quietHours: {
                        ...preferences.quietHours,
                        enabled
                      }
                    })} />
                      <Label className="text-sm">Activer</Label>
                    </div>
                    {preferences.quietHours.enabled && <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Début</Label>
                          <Input type="time" value={preferences.quietHours.start} onChange={e => savePreferences({
                        quietHours: {
                          ...preferences.quietHours,
                          start: e.target.value
                        }
                      })} />
                        </div>
                        <div>
                          <Label className="text-xs">Fin</Label>
                          <Input type="time" value={preferences.quietHours.end} onChange={e => savePreferences({
                        quietHours: {
                          ...preferences.quietHours,
                          end: e.target.value
                        }
                      })} />
                        </div>
                      </div>}
                  </div>
                </div>

                <div>
                  <Label>Catégories d'alertes</Label>
                  <div className="mt-2 space-y-2">
                    {Object.entries(preferences.categories).map(([category, enabled]) => <div key={category} className="flex items-center justify-between">
                        <Label className="capitalize text-sm">{category}</Label>
                        <Switch checked={enabled} onCheckedChange={checked => savePreferences({
                      categories: {
                        ...preferences.categories,
                        [category]: checked
                      }
                    })} />
                      </div>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};
export default SmartNotifications;