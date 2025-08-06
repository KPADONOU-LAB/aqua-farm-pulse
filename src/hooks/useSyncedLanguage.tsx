import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFarm } from '@/contexts/FarmContext';

/**
 * Hook to synchronize language between LanguageContext and FarmContext
 * This prioritizes LanguageContext as the source of truth for UI
 */
export const useSyncedLanguage = () => {
  const { language, setLanguage } = useLanguage();
  const { farmSettings, updateFarmSettings, loading } = useFarm();

  // Update farm settings when language context changes
  useEffect(() => {
    if (!loading && farmSettings && farmSettings.language !== language) {
      console.log('Updating farm settings language to match UI:', language);
      updateFarmSettings({ language }).catch(error => {
        console.error('Error updating farm language settings:', error);
      });
    }
  }, [language, farmSettings?.language, updateFarmSettings, loading]);

  // Function to update language in both contexts
  const updateLanguage = async (newLanguage: 'fr' | 'en') => {
    // Update language context immediately for UI responsiveness
    setLanguage(newLanguage);
    
    // Farm settings will be updated through the useEffect above
  };

  return {
    language,
    updateLanguage,
    isLoading: loading
  };
};