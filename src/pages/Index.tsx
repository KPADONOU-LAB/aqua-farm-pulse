
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fish, Droplets, TrendingUp, AlertTriangle, Package, ShoppingCart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertsPanel } from "@/components/AlertsPanel";
import { FarmHeader } from "@/components/FarmHeader";
import { useFarm } from "@/contexts/FarmContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { stats, croissanceData, ventesData, loading } = useDashboardData();
  const { formatCurrency } = useFarm();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen p-6 animate-fade-in">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in" style={{backgroundColor: '#C8E9F6'}}>
      <FarmHeader title="dashboard" subtitle="overview" />

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <Card className="stat-card ocean-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ocean-700">{t('active_cages')}</CardTitle>
            <Fish className="h-5 w-5 text-ocean-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-ocean-800">{stats.cagesActives}</div>
            <p className="text-xs text-ocean-600 mt-1">{stats.cagesVides} {t('empty_cages')}</p>
          </CardContent>
        </Card>

        <Card className="stat-card aqua-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-aqua-700">{t('total_fish')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-aqua-800">{stats.totalPoissons.toLocaleString()}</div>
            <p className="text-xs text-aqua-600 mt-1">{t('avg_weight')}: {stats.croissanceMoyenne.toFixed(1)}kg</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">{t('consumed_feed')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.alimentConsommeJour.toFixed(1)}kg</div>
            <p className="text-xs text-amber-600 mt-1">{t('today_dashboard')}</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">{t('alerts_dashboard')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.alertes}</div>
            <p className="text-xs text-red-600 mt-1">{t('attention_required')}</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">{t('avg_growth')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.croissanceMoyenne.toFixed(1)}kg</div>
            <p className="text-xs text-green-600 mt-1">{t('avg_weight_full')}</p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-white/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">{t('sales_today')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.ventesJour.toFixed(1)}kg</div>
            <p className="text-xs text-blue-600 mt-1">{formatCurrency(stats.revenusJour)} {t('revenue')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('avg_growth_6months')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={croissanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mois" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="poids" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-md border-border/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t('weekly_sales_tons')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="jour" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }} 
                />
                <Bar dataKey="ventes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertes récentes */}
      <AlertsPanel maxAlerts={3} />
    </div>
  );
};

export default Index;
