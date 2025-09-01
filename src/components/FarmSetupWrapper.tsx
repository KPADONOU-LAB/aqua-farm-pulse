import React from 'react';
import { useFarm } from '@/contexts/FarmContext';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import FarmSetup from '@/pages/FarmSetup';

interface FarmSetupWrapperProps {
  children: React.ReactNode;
}

export const FarmSetupWrapper = ({ children }: FarmSetupWrapperProps) => {
  const { isConfigured, loading, farmSettings } = useFarm();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Debug logging
  console.log('FarmSetupWrapper Debug:', {
    loading,
    isConfigured,
    farmSettings,
    user: user?.id,
    userExists: !!user
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-underwater-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">{t('configuring')}</p>
        </div>
      </div>
    );
  }

  // Skip farm setup - always show main application
  console.log('Showing main application - farm setup bypassed');
  return <>{children}</>;
};