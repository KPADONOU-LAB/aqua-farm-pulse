import { 
  Home, 
  Fish, 
  Coffee, 
  Droplets, 
  Heart, 
  Package, 
  ShoppingCart, 
  BarChart3,
  LogOut,
  Menu
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

const getMenuItems = (t: (key: string) => string) => [
  { title: t("dashboard"), url: "/", icon: Home },
  { title: t("cages"), url: "/cages", icon: Fish },
  { title: t("feeding"), url: "/feeding", icon: Coffee },
  { title: t("water_quality"), url: "/water-quality", icon: Droplets },
  { title: t("health"), url: "/health", icon: Heart },
  { title: t("inventory"), url: "/inventory", icon: Package },
  { title: t("sales"), url: "/sales", icon: ShoppingCart },
  { title: t("reports"), url: "/reports", icon: BarChart3 },
];

export function TopNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut, user } = useAuth();
  const { t } = useLanguage();
  const { toggleSidebar } = useSidebar();
  
  const menuItems = getMenuItems(t);

  const isActive = (path: string) => currentPath === path;
  const getNavClass = (path: string) =>
    isActive(path) 
      ? "bg-white/20 text-white font-medium border-b-2 border-white" 
      : "text-white/80 hover:text-white hover:bg-white/10 transition-colors";

  return (
    <header className="bg-ocean-gradient border-b border-white/20 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo et menu burger */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2 text-white hover:bg-white/20"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Fish className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">PisciManager</h1>
              <p className="text-xs text-white/70">{t('modern_farm')}</p>
            </div>
          </div>
        </div>

        {/* Navigation principale */}
        <nav className="hidden md:flex items-center space-x-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${getNavClass(item.url)}`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.title}</span>
            </NavLink>
          ))}
        </nav>

        {/* Menu mobile */}
        <nav className="md:hidden flex items-center space-x-1 overflow-x-auto">
          {menuItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px] ${getNavClass(item.url)}`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{item.title.split(' ')[0]}</span>
            </NavLink>
          ))}
        </nav>

        {/* Utilisateur et déconnexion */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden sm:block text-xs text-white/70 max-w-[120px] truncate">
              {user.email}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="p-2 text-white hover:bg-white/20"
            title={t('logout')}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}