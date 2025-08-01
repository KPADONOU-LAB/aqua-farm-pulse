import { 
  Home, 
  Fish, 
  Coffee, 
  Heart, 
  ShoppingCart, 
  Package,
  Droplets,
  BarChart3,
  Euro,
  Users,
  Menu,
  LogOut,
  Brain,
  Bell,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Zap,
  Target
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

// Navigation principale - workflow quotidien
const coreOperations = [
  { title: "Tableau de bord", url: "/", icon: Home },
  { title: "Cages", url: "/cages", icon: Fish },
  { title: "Historique Cages", url: "/cage-history", icon: BarChart3 },
  { title: "Alimentation", url: "/feeding", icon: Coffee },
  { title: "Santé", url: "/health", icon: Heart },
  { title: "Ventes", url: "/sales", icon: ShoppingCart },
];

// Gestion & Qualité
const managementItems = [
  { title: "Qualité eau", url: "/water-quality", icon: Droplets },
  { title: "Stocks", url: "/inventory", icon: Package },
  { title: "Finance", url: "/finance", icon: Euro },
  { title: "CRM", url: "/crm", icon: Users },
  { title: "Paramètres", url: "/settings", icon: Settings },
];

// Analytics & Intelligence
const analyticsItems = [
  { title: "Rapports", url: "/reports", icon: BarChart3 },
  { title: "Performance", url: "/performance", icon: TrendingUp },
  { title: "Prédictions IA", url: "/predictions", icon: Brain },
  { title: "Alertes", url: "/alerts", icon: Bell },
];

// Outils avancés - regroupés
const advancedTools = [
  { title: "Dashboards Personnalisés", url: "/custom-dashboards", icon: LayoutDashboard },
  { title: "Recommandations IA", url: "/smart-recommendations", icon: Zap },
  { title: "Notifications IA", url: "/smart-notifications", icon: Bell },
  { title: "Rapports Avancés", url: "/advanced-reports", icon: BarChart3 },
  { title: "Analytics IA", url: "/advanced-analytics", icon: Brain },
  { title: "Alertes IA", url: "/smart-alerts", icon: Target },
];

export function AppSidebarOptimized() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut, user } = useAuth();
  
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const isActive = (path: string) => currentPath === path;
  const isActiveGroup = (items: typeof coreOperations) => 
    items.some(item => currentPath === item.url);
  
  const getNavClass = (path: string) =>
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium shadow-md" 
      : "hover:bg-accent hover:text-accent-foreground transition-colors";

  const getGroupClass = (items: typeof coreOperations) =>
    isActiveGroup(items)
      ? "bg-primary/10 text-primary font-medium"
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
                <p className="text-xs text-white/70">Gestion intelligente</p>
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
        {/* Opérations quotidiennes - toujours visibles */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/90 font-semibold px-2 mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            {!collapsed && "Opérations"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {coreOperations.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11">
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

        {/* Gestion - section intermédiaire */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/90 font-semibold px-2 mb-3 mt-6 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {!collapsed && "Gestion"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${getNavClass(item.url)}`}
                    >
                      <item.icon className={`h-4 w-4 ${collapsed ? "mx-auto" : ""}`} />
                      {!collapsed && (
                        <span className="text-sm">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics - collapsible */}
        {!collapsed && (
          <SidebarGroup>
            <Collapsible open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className={`text-white/90 font-semibold px-2 mb-2 mt-6 flex items-center gap-2 cursor-pointer rounded-lg p-2 transition-colors ${getGroupClass(analyticsItems)}`}>
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                  <div className="ml-auto">
                    {analyticsOpen ? "−" : "+"}
                  </div>
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {analyticsItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className="h-9">
                          <NavLink
                            to={item.url}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${getNavClass(item.url)}`}
                          >
                            <item.icon className="h-4 w-4" />
                            <span className="text-sm">{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* Outils avancés - collapsible */}
        {!collapsed && (
          <SidebarGroup>
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className={`text-white/90 font-semibold px-2 mb-2 mt-4 flex items-center gap-2 cursor-pointer rounded-lg p-2 transition-colors ${getGroupClass(advancedTools)}`}>
                  <Brain className="h-4 w-4" />
                  <span>Outils Avancés</span>
                  <div className="ml-auto">
                    {advancedOpen ? "−" : "+"}
                  </div>
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {advancedTools.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className="h-9">
                          <NavLink
                            to={item.url}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${getNavClass(item.url)}`}
                          >
                            <item.icon className="h-4 w-4" />
                            <span className="text-xs">{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* Mode collapsed - icônes seulement */}
        {collapsed && (
          <>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {[...managementItems, ...analyticsItems].slice(0, 6).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="h-10">
                        <NavLink
                          to={item.url}
                          className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${getNavClass(item.url)}`}
                          title={item.title}
                        >
                          <item.icon className="h-4 w-4" />
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
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
            title="Déconnexion"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-1 text-xs">Déconnexion</span>}
          </Button>
        </div>
      </div>
    </Sidebar>
  );
}