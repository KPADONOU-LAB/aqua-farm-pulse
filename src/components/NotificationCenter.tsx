import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  AlertTriangle,
  Settings,
  TestTube
} from 'lucide-react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { toast } from 'sonner';

export const NotificationCenter = () => {
  const { 
    requestNotificationPermission, 
    updatePreferences, 
    testNotification,
    preferences 
  } = useRealtimeNotifications();
  
  const [isRequesting, setIsRequesting] = useState(false);

  const handlePermissionRequest = async () => {
    setIsRequesting(true);
    const granted = await requestNotificationPermission();
    
    if (granted) {
      toast.success('Notifications activées avec succès !');
      updatePreferences({ browser: true });
    } else {
      toast.error('Permissions refusées. Activez-les manuellement dans les paramètres du navigateur.');
    }
    
    setIsRequesting(false);
  };

  const getNotificationStatus = () => {
    if (!("Notification" in window)) {
      return { status: 'unsupported', text: 'Non supporté', color: 'destructive' };
    }
    
    switch (Notification.permission) {
      case 'granted':
        return { status: 'granted', text: 'Activées', color: 'success' };
      case 'denied':
        return { status: 'denied', text: 'Refusées', color: 'destructive' };
      default:
        return { status: 'default', text: 'En attente', color: 'warning' };
    }
  };

  const notificationStatus = getNotificationStatus();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Centre de notifications
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configurez vos notifications en temps réel pour ne jamais manquer une alerte critique.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Statut des permissions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="font-medium">Notifications navigateur</span>
            </div>
            <Badge 
              variant={notificationStatus.status === 'granted' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {notificationStatus.text}
            </Badge>
          </div>
          
          {notificationStatus.status !== 'granted' && (
            <Button 
              onClick={handlePermissionRequest}
              disabled={isRequesting || notificationStatus.status === 'unsupported'}
              className="w-full"
              variant="outline"
            >
              {isRequesting ? 'Demande en cours...' : 'Activer les notifications'}
            </Button>
          )}
        </div>

        <Separator />

        {/* Préférences de notification */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Préférences
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Notifications navigateur</p>
                  <p className="text-xs text-muted-foreground">
                    Afficher des pop-ups pour les alertes importantes
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.browser}
                onCheckedChange={(checked) => updatePreferences({ browser: checked })}
                disabled={notificationStatus.status !== 'granted'}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Sons d'alerte</p>
                  <p className="text-xs text-muted-foreground">
                    Jouer des sons selon la criticité
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.sound}
                onCheckedChange={(checked) => updatePreferences({ sound: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Vibrations</p>
                  <p className="text-xs text-muted-foreground">
                    Vibrer sur mobile pour les alertes
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.vibration}
                onCheckedChange={(checked) => updatePreferences({ vibration: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Alertes critiques uniquement</p>
                  <p className="text-xs text-muted-foreground">
                    Ne notifier que pour les situations d'urgence
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.criticalOnly}
                onCheckedChange={(checked) => updatePreferences({ criticalOnly: checked })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Test de notification */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Test
          </h3>
          
          <Button 
            onClick={testNotification}
            variant="outline"
            className="w-full"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Tester les notifications
          </Button>
        </div>

        {/* Informations sur les types d'alertes */}
        <div className="space-y-3">
          <h3 className="font-medium">Types d'alertes en temps réel</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="font-medium text-red-400">🚨 Critique</p>
              <p className="text-muted-foreground">Température extrême, mortalité élevée</p>
            </div>
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="font-medium text-orange-400">⚠️ Élevée</p>
              <p className="text-muted-foreground">pH anormal, stock faible</p>
            </div>
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="font-medium text-yellow-400">📢 Moyenne</p>
              <p className="text-muted-foreground">Appétit faible, maintenance</p>
            </div>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="font-medium text-blue-400">ℹ️ Info</p>
              <p className="text-muted-foreground">Rappels, mises à jour</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};