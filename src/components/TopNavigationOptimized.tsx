import { Home, Fish, Coffee, Droplets, Heart, Package, ShoppingCart, BarChart3, Euro, Users, Menu, LogOut, Brain, Bell, LayoutDashboard, Settings, ChevronDown, Target, TrendingUp } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFarm } from "@/contexts/FarmContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSyncedLanguage } from "@/hooks/useSyncedLanguage";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";

// Navigation principale optimisée - seulement les fonctions essentielles
const getPrimaryMenuItems = (t: (key: string) => string) => [{
  title: t("dashboard_title"),
  url: "/",
  icon: Home
}, {
  title: t("cages_title"),
  url: "/cages",
  icon: Fish
}, {
  title: t("feeding_title"),
  url: "/feeding",
  icon: Coffee
}, {
  title: t("health_title"),
  url: "/health",
  icon: Heart
}, {
  title: t("sales_title"),
  url: "/sales",
  icon: ShoppingCart
}];

// Menus secondaires regroupés par thématique
const getQualityMenuItems = (t: (key: string) => string) => [{
  title: t("water_quality_title"),
  url: "/water-quality",
  icon: Droplets
}, {
  title: t("inventory_title"),
  url: "/inventory",
  icon: Package
}];
const getAnalyticsMenuItems = (t: (key: string) => string) => [{
  title: t("reports_title"),
  url: "/reports",
  icon: BarChart3
}, {
  title: t("performance_title"),
  url: "/performance",
  icon: TrendingUp
}, {
  title: t("predictions_ai_title"),
  url: "/predictions",
  icon: Brain
}];
const getManagementMenuItems = (t: (key: string) => string) => [{
  title: t("finance_title"),
  url: "/finance",
  icon: Euro
}, {
  title: t("crm_title"),
  url: "/crm",
  icon: Users
}, {
  title: t("alerts_title"),
  url: "/alerts",
  icon: Bell
}];
const getAdvancedMenuItems = (t: (key: string) => string) => [{
  title: t("custom_dashboards_title"),
  url: "/custom-dashboards",
  icon: LayoutDashboard
}, {
  title: t("smart_recommendations_title"),
  url: "/smart-recommendations",
  icon: Brain
}, {
  title: t("smart_notifications_title"),
  url: "/smart-notifications",
  icon: Bell
}, {
  title: t("advanced_reports_title"),
  url: "/advanced-reports",
  icon: BarChart3
}, {
  title: t("advanced_analytics_title"),
  url: "/advanced-analytics",
  icon: Brain
}, {
  title: t("smart_alerts_title"),
  url: "/smart-alerts",
  icon: Bell
}];
export function TopNavigationOptimized() {
  const location = useLocation();
  const currentPath = location.pathname;
  const {
    signOut,
    user
  } = useAuth();
  const {
    farmSettings
  } = useFarm();
  const {
    t
  } = useLanguage();
  useSyncedLanguage(); // Ensure language synchronization
  const {
    toggleSidebar
  } = useSidebar();

  // Get translated menu items
  const primaryMenuItems = getPrimaryMenuItems(t);
  const qualityMenuItems = getQualityMenuItems(t);
  const analyticsMenuItems = getAnalyticsMenuItems(t);
  const managementMenuItems = getManagementMenuItems(t);
  const advancedMenuItems = getAdvancedMenuItems(t);
  const isActive = (path: string) => currentPath === path;
  const isActiveGroup = (items: typeof primaryMenuItems) => items.some(item => currentPath === item.url);
  const getNavClass = (path: string) => isActive(path) ? "bg-white/20 text-white font-medium border-b-2 border-white" : "text-white/80 hover:text-white hover:bg-white/10 transition-colors";
  const getDropdownClass = (items: typeof primaryMenuItems) => isActiveGroup(items) ? "bg-white/20 text-white font-medium border-b-2 border-white" : "text-white/80 hover:text-white hover:bg-white/10 transition-colors";
  return <header className="bg-ocean-gradient border-b border-white/20 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3 bg-ocean-700">
        {/* Logo et menu burger */}
        <div className="flex items-center gap-4 bg-sky-700">
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="p-2 text-white hover:bg-white/20">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Fish className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">
                {farmSettings?.farm_name || 'PisciManager'}
              </h1>
              <p className="text-xs text-white/70">{t('smart_management')}</p>
            </div>
          </div>
        </div>

        {/* Navigation principale optimisée */}
        <nav className="hidden lg:flex items-center space-x-1">
          {/* Navigation principale */}
          {primaryMenuItems.map(item => <NavLink key={item.title} to={item.url} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${getNavClass(item.url)}`}>
              <item.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.title}</span>
            </NavLink>)}

          {/* Menu déroulant Qualité & Stocks */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${getDropdownClass(qualityMenuItems)}`}>
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">{t('quality_group')}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {qualityMenuItems.map(item => <DropdownMenuItem key={item.title} asChild>
                  <NavLink to={item.url} className="flex items-center gap-2 w-full">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menu déroulant Analytics */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${getDropdownClass(analyticsMenuItems)}`}>
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-medium">{t('analytics_group')}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {analyticsMenuItems.map(item => <DropdownMenuItem key={item.title} asChild>
                  <NavLink to={item.url} className="flex items-center gap-2 w-full">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menu déroulant Gestion */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${getDropdownClass(managementMenuItems)}`}>
                <Euro className="h-4 w-4" />
                <span className="text-sm font-medium">{t('management_group')}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {managementMenuItems.map(item => <DropdownMenuItem key={item.title} asChild>
                  <NavLink to={item.url} className="flex items-center gap-2 w-full">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menu déroulant Avancé */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${getDropdownClass(advancedMenuItems)}`}>
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">{t('advanced_group')}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {advancedMenuItems.map(item => <DropdownMenuItem key={item.title} asChild>
                  <NavLink to={item.url} className="flex items-center gap-2 w-full">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Navigation mobile améliorée */}
        <nav className="lg:hidden flex items-center space-x-1">
          {primaryMenuItems.slice(0, 3).map(item => <NavLink key={item.title} to={item.url} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px] ${getNavClass(item.url)}`}>
              <item.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{item.title.split(' ')[0]}</span>
            </NavLink>)}
          
          {/* Menu "Plus" pour mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px] text-white/80 hover:text-white hover:bg-white/10">
                <Menu className="h-4 w-4" />
                <span className="text-xs font-medium">{t('more_menu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              {primaryMenuItems.slice(3).map(item => <DropdownMenuItem key={item.title} asChild>
                  <NavLink to={item.url} className="flex items-center gap-2 w-full">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </DropdownMenuItem>)}
              <DropdownMenuSeparator />
              {[...qualityMenuItems, ...analyticsMenuItems, ...managementMenuItems].map(item => <DropdownMenuItem key={item.title} asChild>
                  <NavLink to={item.url} className="flex items-center gap-2 w-full">
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Utilisateur et déconnexion */}
        <div className="flex items-center gap-3">
          {user && <span className="hidden sm:block text-xs text-white/70 max-w-[120px] truncate">
              {user.email}
            </span>}
          <Button variant="ghost" size="sm" onClick={signOut} className="p-2 text-white hover:bg-white/20" title={t('logout_title')}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>;
}