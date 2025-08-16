
import { 
  Home, 
  Fish, 
  Coffee, 
  Droplets, 
  Heart, 
  Package, 
  ShoppingCart, 
  BarChart3,
  Euro,
  Users,
  Menu,
  LogOut,
  Brain,
  TrendingUp,
  Bell,
  FileText,
  LayoutDashboard,
  Bot,
  Zap
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const getMenuItems = (translate: (key: string) => string) => [
  { title: translate('dashboard'), url: "/", icon: Home },
  { title: translate('cages'), url: "/cages", icon: Fish },
  { title: translate('feeding'), url: "/feeding", icon: Coffee },
  { title: translate('water_quality'), url: "/water-quality", icon: Droplets },
  { title: translate('health'), url: "/health", icon: Heart },
  { title: translate('inventory'), url: "/inventory", icon: Package },
  { title: translate('sales'), url: "/sales", icon: ShoppingCart },
  { title: translate('finance'), url: "/finance", icon: Euro },
  { title: translate('crm'), url: "/crm", icon: Users },
];

const getAnalyticsItems = (translate: (key: string) => string) => [
  { title: translate('reports'), url: "/reports", icon: BarChart3 },
  { title: translate('advanced_analytics'), url: "/advanced-reports", icon: FileText },
  { title: translate('smart_notifications'), url: "/smart-notifications", icon: Bell },
  { title: translate('smart_recommendations'), url: "/smart-recommendations", icon: Brain },
  { title: translate('performance'), url: "/performance", icon: TrendingUp },
  { title: translate('analytics'), url: "/advanced-analytics", icon: Brain },
  { title: translate('alerts'), url: "/alerts", icon: Bell },
];

const getAutomationItems = (translate: (key: string) => string) => [
  { title: "Automatisation IA", url: "/intelligent-automation", icon: Bot },
  { title: "Analyse Rentabilité", url: "/profitability-analysis", icon: TrendingUp },
];

const getDashboardItems = (translate: (key: string) => string) => [
  { title: translate('dashboard'), url: "/custom-dashboards", icon: LayoutDashboard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut, user } = useAuth();
  const { t: translate } = useLanguage();
  
  const menuItems = getMenuItems(translate);
  const analyticsItems = getAnalyticsItems(translate);
  const dashboardItems = getDashboardItems(translate);
  const automationItems = getAutomationItems(translate);

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (path: string) =>
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium shadow-md" 
      : "hover:bg-accent hover:text-accent-foreground transition-colors";

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} border-r border-white/20 backdrop-blur-md bg-white/10`}>
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          {!collapsed && (
            <>
              <div className="p-2 bg-ocean-gradient rounded-lg">
                <Fish className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-white">PisciManager</h2>
                <p className="text-xs text-white/70">{translate('modern_farm')}</p>
              </div>
            </>
          )}
          {collapsed && (
            <div className="p-2 bg-ocean-gradient rounded-lg mx-auto">
              <Fish className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="px-2 py-4">
        {/* Navigation principale */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/80 font-medium px-2 mb-2">
            {!collapsed && translate('navigation')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${getNavClass(item.url)}`}
                    >
                      <item.icon className={`h-5 w-5 ${collapsed ? "mx-auto" : ""}`} />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/80 font-medium px-2 mb-2 mt-4">
            {!collapsed && translate('analytics')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${getNavClass(item.url)}`}
                    >
                      <item.icon className={`h-5 w-5 ${collapsed ? "mx-auto" : ""}`} />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section Dashboards */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/80 font-medium px-2 mb-2 mt-4">
            {!collapsed && translate('dashboard')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${getNavClass(item.url)}`}
                    >
                      <item.icon className={`h-5 w-5 ${collapsed ? "mx-auto" : ""}`} />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section Automatisation IA */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/80 font-medium px-2 mb-2 mt-4">
            {!collapsed && "Automatisation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {automationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${getNavClass(item.url)}`}
                    >
                      <item.icon className={`h-5 w-5 ${collapsed ? "mx-auto" : ""}`} />
                      {!collapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-4 border-t border-white/20 mt-auto space-y-2">
        {!collapsed && user && (
          <div className="text-xs text-white/70 px-2 truncate">
            {user.email}
          </div>
        )}
        <div className="flex gap-2">
          <SidebarTrigger className="flex-1 flex items-center justify-center p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <Menu className="h-4 w-4 text-white" />
          </SidebarTrigger>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className={`${collapsed ? "w-full" : "flex-1"} p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white hover:text-white`}
            title={translate('logout')}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-1 text-xs">{translate('logout')}</span>}
          </Button>
        </div>
      </div>
    </Sidebar>
  );
}
