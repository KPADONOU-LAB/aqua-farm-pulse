
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Fish, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-6">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Fish className="h-24 w-24 text-primary-foreground/60 mx-auto mb-4" />
          <h1 className="text-6xl font-bold text-primary-foreground mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-primary-foreground mb-2">Page introuvable</h2>
          <p className="text-primary-foreground/80 text-lg mb-6">
            Cette page semble avoir pris la fuite comme un poisson ! 🐟
          </p>
        </div>
        
        <Button 
          onClick={() => window.location.href = '/'} 
          variant="secondary"
          className="shadow-lg"
        >
          <Home className="mr-2 h-4 w-4" />
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
