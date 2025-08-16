import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart,
  AlertTriangle,
  Clock,
  Package
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MarketOpportunity {
  type: 'price' | 'supplier' | 'timing';
  title: string;
  description: string;
  potential_savings: number;
  urgency: 'low' | 'medium' | 'high';
  action_required: string;
}

export const MarketIntelligenceWidget = () => {
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadMarketData();
  }, [user]);

  const loadMarketData = async () => {
    if (!user) return;
    
    try {
      // Simuler des données d'intelligence de marché
      const mockOpportunities: MarketOpportunity[] = [
        {
          type: 'price',
          title: 'Prix de vente en hausse',
          description: 'Prix tilapia +12% cette semaine',
          potential_savings: 850,
          urgency: 'high',
          action_required: 'Planifier récolte dans 5-7 jours'
        },
        {
          type: 'supplier',
          title: 'Promotion aliment AquaFeed',
          description: 'Réduction 15% sur commande >500kg',
          potential_savings: 180,
          urgency: 'medium',
          action_required: 'Commander avant vendredi'
        },
        {
          type: 'timing',
          title: 'Demande élevée restaurants',
          description: 'Pic de demande prévu weekend',
          potential_savings: 320,
          urgency: 'medium',
          action_required: 'Contacter acheteurs premium'
        }
      ];

      setOpportunities(mockOpportunities);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'price': return TrendingUp;
      case 'supplier': return ShoppingCart;
      case 'timing': return Clock;
      default: return DollarSign;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Intelligence Marché</CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Intelligence Marché
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {opportunities.map((opportunity, index) => {
          const TypeIcon = getTypeIcon(opportunity.type);
          return (
            <div key={index} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{opportunity.title}</span>
                </div>
                <Badge variant="outline" className={getUrgencyColor(opportunity.urgency)}>
                  {opportunity.urgency === 'high' ? 'Urgent' : 
                   opportunity.urgency === 'medium' ? 'Important' : 'Info'}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground">{opportunity.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-400">
                  +{opportunity.potential_savings}€
                </span>
                <span className="text-xs text-muted-foreground">
                  {opportunity.action_required}
                </span>
              </div>
            </div>
          );
        })}
        
        <Button size="sm" variant="outline" className="w-full mt-3">
          <Package className="h-4 w-4 mr-2" />
          Voir toutes les opportunités
        </Button>
      </CardContent>
    </Card>
  );
};