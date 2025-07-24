import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Fish, AlertTriangle, DollarSign, Activity } from 'lucide-react';
import { DashboardWidget } from '@/hooks/useCustomDashboard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WidgetRendererProps {
  widget: DashboardWidget & { layout?: any };
  onRemove?: () => void;
  editMode?: boolean;
}

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: React.ComponentType<any> } = {
    'fish': Fish,
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    'alert-triangle': AlertTriangle,
    'dollar-sign': DollarSign,
    'activity': Activity,
  };
  return icons[iconName] || Activity;
};

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget, onRemove, editMode }) => {
  const config = typeof widget.configuration === 'string' 
    ? JSON.parse(widget.configuration) 
    : widget.configuration;

  // Récupérer les données pour le widget
  const { data: widgetData, isLoading } = useQuery({
    queryKey: ['widget-data', widget.id, config.source],
    queryFn: async () => {
      if (!config.source) return null;

      let query = supabase.from(config.source).select('*');
      
      // Appliquer les filtres
      if (config.filters) {
        Object.entries(config.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Appliquer l'ordre et la limite
      if (config.orderBy) {
        query = query.order(config.orderBy, { 
          ascending: config.orderDirection !== 'desc' 
        });
      }
      
      if (config.limit) {
        query = query.limit(config.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!config.source,
    refetchInterval: 30000, // Actualiser toutes les 30 secondes
  });

  const renderMetricWidget = () => {
    if (isLoading) return <div className="animate-pulse h-20 bg-muted rounded" />;
    
    let value = 0;
    if (widgetData) {
      switch (config.metric) {
        case 'count':
          value = widgetData.length;
          break;
        case 'sum':
          value = widgetData.reduce((sum: number, item: any) => sum + (item[config.field] || 0), 0);
          break;
        case 'average':
          value = widgetData.reduce((sum: number, item: any) => sum + (item[config.field] || 0), 0) / widgetData.length;
          break;
        default:
          value = widgetData.length;
      }
    }

    const IconComponent = getIconComponent(config.icon);
    const formattedValue = config.format === 'decimal' 
      ? value.toFixed(config.precision || 0)
      : Math.round(value).toLocaleString();

    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold" style={{ color: config.color }}>
            {formattedValue}
          </p>
          <p className="text-sm text-muted-foreground">{config.title}</p>
        </div>
        <IconComponent className="h-8 w-8" style={{ color: config.color }} />
      </div>
    );
  };

  const renderChartWidget = () => {
    if (isLoading) return <div className="animate-pulse h-48 bg-muted rounded" />;
    if (!widgetData || widgetData.length === 0) return <div className="h-48 flex items-center justify-center text-muted-foreground">Aucune donnée</div>;

    const chartData = widgetData.map((item: any) => ({
      ...item,
      [config.xField]: new Date(item[config.xField]).toLocaleDateString(),
    }));

    switch (config.chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xField} />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={config.yField} 
                stroke={config.color || '#3b82f6'} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xField} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={config.yField} fill={config.color || '#3b82f6'} />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return <div>Type de graphique non supporté</div>;
    }
  };

  const renderTableWidget = () => {
    if (isLoading) return <div className="animate-pulse h-32 bg-muted rounded" />;
    if (!widgetData || widgetData.length === 0) return <div className="text-center text-muted-foreground py-4">Aucune donnée</div>;

    const columns = config.columns || Object.keys(widgetData[0]);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column: string) => (
              <TableHead key={column} className="capitalize">
                {column.replace('_', ' ')}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {widgetData.slice(0, config.limit || 5).map((row: any, index: number) => (
            <TableRow key={index}>
              {columns.map((column: string) => (
                <TableCell key={column}>
                  {column === 'niveau_criticite' ? (
                    <Badge variant={row[column] === 'critique' ? 'destructive' : 'secondary'}>
                      {row[column]}
                    </Badge>
                  ) : column.includes('date') || column.includes('_at') ? (
                    new Date(row[column]).toLocaleDateString()
                  ) : (
                    row[column]
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderProgressWidget = () => {
    if (isLoading) return <div className="animate-pulse h-16 bg-muted rounded" />;
    
    let progress = 0;
    if (widgetData && widgetData.length > 0) {
      const value = Number(widgetData[0][config.metric]) || 0;
      const maxValue = Number(config.maxValue) || 1;
      progress = Math.min((value / maxValue) * 100, 100);
    }

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{config.title}</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <Progress value={progress} className="w-full" />
        {config.showPercentage && (
          <p className="text-xs text-muted-foreground text-center">
            {widgetData?.[0]?.[config.metric] || 0} / {config.maxValue}
          </p>
        )}
      </div>
    );
  };

  const renderAlertWidget = () => {
    if (isLoading) return <div className="animate-pulse h-24 bg-muted rounded" />;
    
    const alertCount = widgetData?.length || 0;
    const criticalAlerts = widgetData?.filter((alert: any) => alert.niveau_criticite === 'critique').length || 0;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Alertes actives</span>
          <Badge variant={criticalAlerts > 0 ? 'destructive' : 'secondary'}>
            {alertCount}
          </Badge>
        </div>
        {criticalAlerts > 0 && (
          <div className="flex items-center text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {criticalAlerts} critique{criticalAlerts > 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  };

  const renderWidgetContent = () => {
    switch (widget.type_widget) {
      case 'metric':
        return renderMetricWidget();
      case 'chart':
        return renderChartWidget();
      case 'table':
        return renderTableWidget();
      case 'progress':
        return renderProgressWidget();
      case 'alert':
        return renderAlertWidget();
      default:
        return <div>Type de widget non supporté</div>;
    }
  };

  return (
    <Card className="h-full relative">
      {editMode && onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition-colors"
        >
          ×
        </button>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{widget.nom_widget}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderWidgetContent()}
      </CardContent>
    </Card>
  );
};