import React from 'react';
import { useFarm } from '@/contexts/FarmContext';
import { useAuth } from '@/hooks/useAuth';
import FarmSetup from '@/pages/FarmSetup';

interface FarmSetupWrapperProps {
  children: React.ReactNode;
}

export const FarmSetupWrapper = ({ children }: FarmSetupWrapperProps) => {
  const { isConfigured, loading } = useFarm();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-underwater-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté mais la ferme n'est pas configurée, afficher FarmSetup
  if (user && !isConfigured) {
    return <FarmSetup />;
  }

  // Si tout est configuré, afficher l'application normale
  return <>{children}</>;
};