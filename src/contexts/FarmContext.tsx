import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FarmSettings {
  id: string;
  farm_name: string;
  language: 'fr' | 'en' | 'ar';
  currency: 'fcfa' | 'eur' | 'usd' | 'mad' | 'dza' | 'tnd';
  basin_types: string[];
  fish_species: string[];
  is_configured: boolean;
}

interface FarmContextType {
  farmSettings: FarmSettings | null;
  loading: boolean;
  updateFarmSettings: (settings: Partial<FarmSettings>) => Promise<void>;
  isConfigured: boolean;
  formatCurrency: (amount: number) => string;
  translate: (key: string) => string;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const translations = {
  fr: {
    // Navigation
    'dashboard': 'Tableau de bord',
    'cages': 'Cages',
    'feeding': 'Alimentation', 
    'health': 'Santé',
    'water_quality': 'Qualité eau',
    'sales': 'Ventes',
    'inventory': 'Inventaire',
    'finance': 'Finance',
    'settings': 'Paramètres',
    
    // Common
    'save': 'Enregistrer',
    'cancel': 'Annuler',
    'edit': 'Modifier',
    'delete': 'Supprimer',
    'add': 'Ajouter',
    'close': 'Fermer',
    'loading': 'Chargement...',
    'error': 'Erreur',
    'success': 'Succès',
    
    // Reports
    'reports': 'Rapports & Performance',
    'reports_description': 'Analyses et indicateurs de performance de votre ferme',
    
    // Farm setup
    'farm_name': 'Nom de la ferme',
    'language': 'Langue',
    'currency': 'Devise',
    'basin_types': 'Types de bassins',
    'fish_species': 'Espèces élevées',
    'initial_setup': 'Configuration initiale',
    'setup_description': 'Configurez votre ferme piscicole pour commencer',
    
    // Dashboard
    'overview': 'Vue d\'ensemble de votre ferme piscicole',
    'active_cages': 'Cages actives',
    'total_fish': 'Total poissons',
    'alerts': 'Alertes',
    'daily_sales': 'Ventes du jour',
    'avg_growth': 'Croissance moy.',
  },
  en: {
    // Navigation  
    'dashboard': 'Dashboard',
    'cages': 'Cages',
    'feeding': 'Feeding',
    'health': 'Health', 
    'water_quality': 'Water Quality',
    'sales': 'Sales',
    'inventory': 'Inventory',
    'finance': 'Finance',
    'settings': 'Settings',
    
    // Common
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'delete': 'Delete',
    'add': 'Add',
    'close': 'Close',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    
    // Reports  
    'reports': 'Reports & Performance',
    'reports_description': 'Analyses and performance indicators for your farm',
    
    // Farm setup
    'farm_name': 'Farm Name',
    'language': 'Language',
    'currency': 'Currency',
    'basin_types': 'Basin Types',
    'fish_species': 'Fish Species',
    'initial_setup': 'Initial Setup',
    'setup_description': 'Configure your fish farm to get started',
    
    // Dashboard
    'overview': 'Overview of your fish farm',
    'active_cages': 'Active cages',
    'total_fish': 'Total fish',
    'alerts': 'Alerts',
    'daily_sales': 'Daily sales',
    'avg_growth': 'Avg. growth',
  }
};

export const FarmProvider = ({ children }: { children: React.ReactNode }) => {
  const [farmSettings, setFarmSettings] = useState<FarmSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFarmSettings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadFarmSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('farm_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading farm settings:', error);
        return;
      }

      setFarmSettings(data as FarmSettings);
    } catch (error) {
      console.error('Error loading farm settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFarmSettings = async (settings: Partial<FarmSettings>) => {
    if (!user) return;

    console.log('FarmContext updateFarmSettings called with:', settings);

    try {
      // Check if farm settings exist first
      const { data: existingSettings } = await supabase
        .from('farm_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let data, error;

      if (existingSettings) {
        // Update existing settings
        const result = await supabase
          .from('farm_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      } else {
        // Insert new settings
        const insertData = {
          user_id: user.id,
          farm_name: settings.farm_name || 'Nouvelle ferme',
          language: settings.language || 'fr',
          currency: settings.currency || 'eur',
          basin_types: settings.basin_types || [],
          fish_species: settings.fish_species || [],
          is_configured: settings.is_configured || false,
          updated_at: new Date().toISOString()
        };
        
        const result = await supabase
          .from('farm_settings')
          .insert(insertData)
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      console.log('Farm settings updated successfully:', data);
      setFarmSettings(data as FarmSettings);
      
      // Reload to ensure we have the latest data
      await loadFarmSettings();
    } catch (error) {
      console.error('Error updating farm settings:', error);
      throw error;
    }
  };

  const formatCurrency = (amount: number): string => {
    const currency = farmSettings?.currency || 'eur';
    
    switch (currency) {
      case 'fcfa':
        return `${amount.toLocaleString()} FCFA`;
      case 'usd':
        return `$${amount.toLocaleString()}`;
      case 'mad':
        return `${amount.toLocaleString()} MAD`;
      case 'dza':
        return `${amount.toLocaleString()} DZD`;
      case 'tnd':
        return `${amount.toLocaleString()} TND`;
      case 'eur':
      default:
        return `€${amount.toLocaleString()}`;
    }
  };

  const translate = (key: string): string => {
    const language = farmSettings?.language || 'fr';
    return translations[language][key] || key;
  };

  const isConfigured = farmSettings?.is_configured || false;

  return (
    <FarmContext.Provider value={{
      farmSettings,
      loading,
      updateFarmSettings,
      isConfigured,
      formatCurrency,
      translate
    }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};