import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  Thermometer, 
  Droplets, 
  Wind, 
  Gauge,
  AlertTriangle,
  CheckCircle,
  Camera,
  Zap,
  Signal
} from 'lucide-react';

interface IoTDevice {
  id: string;
  name: string;
  type: string;
  cage_id: string;
  status: 'online' | 'offline' | 'warning';
  battery_level: number;
  last_data: any;
  signal_strength: number;
}

export const IoTDashboardWidget = () => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler des données IoT
    setDevices([
      {
        id: 'sensor-001',
        name: 'Capteur Eau Multi-Paramètres',
        type: 'water_quality',
        cage_id: 'cage-001',
        status: 'online',
        battery_level: 87,
        last_data: { temperature: 24.5, ph: 7.2, oxygen: 8.1 },
        signal_strength: 95
      },
      {
        id: 'camera-001',
        name: 'Caméra IA Comportementale',
        type: 'ai_camera',
        cage_id: 'cage-001',
        status: 'online',
        battery_level: 92,
        last_data: { fish_activity: 'normal', anomalies: 0 },
        signal_strength: 88
      },
      {
        id: 'sensor-002',
        name: 'Station Météo Locale',
        type: 'weather',
        cage_id: 'general',
        status: 'warning',
        battery_level: 34,
        last_data: { temperature: 26.8, humidity: 78, wind: 12 },
        signal_strength: 67
      }
    ]);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'offline': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'water_quality': return Droplets;
      case 'ai_camera': return Camera;
      case 'weather': return Wind;
      default: return Gauge;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Capteurs IoT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Capteurs IoT
          </div>
          <Badge variant="outline">
            {devices.filter(d => d.status === 'online').length}/{devices.length} en ligne
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {devices.map((device) => {
          const DeviceIcon = getDeviceIcon(device.type);
          return (
            <div key={device.id} className="flex items-center gap-3 p-2 rounded border">
              <DeviceIcon className="h-4 w-4 text-muted-foreground" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{device.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Signal className="h-3 w-3" />
                  <span>{device.signal_strength}%</span>
                  <span>•</span>
                  <span>Batterie: {device.battery_level}%</span>
                </div>
              </div>
              
              <Badge variant="outline" className={getStatusColor(device.status)}>
                {device.status === 'online' ? 'En ligne' : 
                 device.status === 'warning' ? 'Attention' : 'Hors ligne'}
              </Badge>
            </div>
          );
        })}
        
        <Button size="sm" variant="outline" className="w-full mt-3">
          <Zap className="h-4 w-4 mr-2" />
          Gérer les capteurs
        </Button>
      </CardContent>
    </Card>
  );
};