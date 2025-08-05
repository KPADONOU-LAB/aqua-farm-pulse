import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFarm } from '@/contexts/FarmContext';

/**
 * Hook to synchronize language between LanguageContext and FarmContext
 * This ensures that when farm settings change the language, it's reflected everywhere
 */
export const useSyncedLanguage = () => {
  const { language, setLanguage } = useLanguage();
  const { farmSettings, updateFarmSettings, loading } = useFarm();

  // Sync language from farm settings to language context
  useEffect(() => {
    if (!loading && farmSettings?.language && farmSettings.language !== language) {
      console.log('Syncing language from farm settings:', farmSettings.language);
      setLanguage(farmSettings.language as 'fr' | 'en');
    }
  }, [farmSettings?.language, language, setLanguage, loading]);

  // Function to update language in both contexts
  const updateLanguage = async (newLanguage: 'fr' | 'en') => {
    // Update language context immediately for UI responsiveness
    setLanguage(newLanguage);
    
    // Update farm settings if available
    if (farmSettings && updateFarmSettings) {
      try {
        await updateFarmSettings({ language: newLanguage });
      } catch (error) {
        console.error('Error updating farm language settings:', error);
        // Revert language context if farm update fails
        setLanguage(language);
      }
    }
  };

  return {
    language: farmSettings?.language || language,
    updateLanguage,
    isLoading: loading
  };
};