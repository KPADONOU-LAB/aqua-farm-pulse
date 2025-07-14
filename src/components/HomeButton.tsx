import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export function HomeButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Ne pas afficher le bouton si on est déjà sur la page d'accueil
  if (location.pathname === "/") {
    return null;
  }

  return (
    <Button
      onClick={() => navigate("/")}
      variant="outline"
      size="sm"
      className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-all duration-200"
    >
      <Home className="h-4 w-4 mr-2" />
      Accueil
    </Button>
  );
}