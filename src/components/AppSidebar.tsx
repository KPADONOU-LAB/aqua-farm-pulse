
import { 
  Home, 
  Fish, 
  Coffee, 
  Droplets, 
  Heart, 
  Package, 
  ShoppingCart, 
  BarChart3,
  Menu,
  LogOut
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

const menuItems = [
  { title: "Tableau de bord", url: "/", icon: Home },
  { title: "Cages", url: "/cages", icon: Fish },
  { title: "Alimentation", url: "/feeding", icon: Coffee },
  { title: "Qualité eau", url: "/water-quality", icon: Droplets },
  { title: "Santé", url: "/health", icon: Heart },
  { title: "Stocks", url: "/inventory", icon: Package },
  { title: "Ventes", url: "/sales", icon: ShoppingCart },
  { title: "Rapports", url: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut, user } = useAuth();

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
                <p className="text-xs text-white/70">Ferme moderne</p>
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
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/80 font-medium px-2 mb-2">
            {!collapsed && "Navigation"}
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
