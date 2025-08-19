import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FarmSettings {
  id: string;
  user_id: string;
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
  isOwner: () => boolean;
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
    'analytics': 'Analytics',
    'reports': 'Rapports',
    'crm': 'CRM',
    'advanced_analytics': 'Analyses avancées',
    'predictions': 'Prédictions',
    
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
    'last_update': 'Dernière mise à jour',
    'view': 'Voir',
    'create': 'Créer',
    'update': 'Mettre à jour',
    'name': 'Nom',
    'status': 'Statut',
    'date': 'Date',
    'total': 'Total',
    'actions': 'Actions',
    
    // User Management
    'user_management': 'Gestion des utilisateurs',
    'users': 'Utilisateurs',
    'invite_user': 'Inviter un utilisateur',
    'first_name': 'Prénom',
    'last_name': 'Nom',
    'email': 'Email',
    'role': 'Rôle',
    'preferred_language': 'Langue préférée',
    'pending_invitations': 'Invitations en attente',
    'active_users': 'Utilisateurs actifs',
    'send_invitation': 'Envoyer l\'invitation',
    'invitation_sent': 'Invitation envoyée',
    'invitation_error': 'Erreur lors de l\'envoi',
    'admin': 'Administrateur',
    'manager': 'Gestionnaire',
    'technician': 'Technicien',
    'supervisor': 'Superviseur',
    'viewer': 'Observateur',
    
    // Reports
    'reports_description': 'Analyses et indicateurs de performance de votre ferme',
    
    // Farm setup
    'farm_name': 'Nom de la ferme',
    'language': 'Langue',
    'currency': 'Devise',
    'basin_types': 'Types de bassins',
    'fish_species': 'Espèces élevées',
    'initial_setup': 'Configuration initiale',
    'setup_description': 'Configurez votre ferme piscicole pour commencer',
    'general_settings': 'Paramètres généraux',
    'basic_information': 'Informations de base',
    'regional_settings': 'Paramètres régionaux',
    
    // Basin types
    'floating': 'Flottante',
    'fixed': 'Fixe',
    'above_ground': 'Hors-sol',
    'floating_cage': 'Cage flottante',
    'fixed_cage': 'Cage fixe',
    'concrete_basin': 'Bassin béton',
    'earth_pond': 'Étang',
    'raceway': 'Raceway',
    'reservoir': 'Réservoir',
    'offshore_basin': 'Bac hors-sol',
    'greenhouse': 'Serre aquacole',
    
    // Fish species
    'tilapia': 'Tilapia',
    'catfish': 'Silure',
    'carp': 'Carpe',
    'trout': 'Truite',
    'bass': 'Bar',
    'salmon': 'Saumon',
    'other': 'Autre',
    
    // Languages
    'french': 'Français',
    'english': 'Anglais',
    'arabic': 'Arabe',
    
    // Currencies
    'fcfa': 'Franc CFA (FCFA)',
    'usd': 'Dollar américain ($)',
    'eur': 'Euro (€)',
    'mad': 'Dirham marocain (MAD)',
    'dza': 'Dinar algérien (DZD)',
    'tnd': 'Dinar tunisien (TND)',
    
    // Dashboard
    'overview': 'Vue d\'ensemble de votre ferme piscicole',
    'active_cages': 'Cages actives',
    'total_fish': 'Total poissons',
    'alerts': 'Alertes',
    'daily_sales': 'Ventes du jour',
    'avg_growth': 'Croissance moy.',
    
    // Configuration
    'fill_required_fields': 'Veuillez remplir tous les champs obligatoires',
    'config_saved': 'Configuration sauvegardée',
    'farm_configured_success': 'Votre ferme a été configurée avec succès',
    'config_save_error': 'Erreur lors de la sauvegarde de la configuration',
    'farm_name_placeholder': 'Ex: Ferme Aquacole des Palmiers',
    'other_species': 'Autre espèce...',
    'configuring': 'Configuration en cours...',
    'validate_config': 'Configurer ma ferme',
    'go_to_user_management': 'Passer à l\'ajout des utilisateurs',
    'navigation': 'Navigation',
    'smart_notifications': 'Notifications IA',
    'smart_recommendations': 'Recommandations IA',
    'performance': 'Performance',
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
    'analytics': 'Analytics',
    'reports': 'Reports',
    'crm': 'CRM',
    'advanced_analytics': 'Advanced Analytics',
    'predictions': 'Predictions',
    
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
    'last_update': 'Last update',
    'view': 'View',
    'create': 'Create',
    'update': 'Update',
    'name': 'Name',
    'status': 'Status',
    'date': 'Date',
    'total': 'Total',
    'actions': 'Actions',
    
    // User Management
    'user_management': 'User Management',
    'users': 'Users',
    'invite_user': 'Invite User',
    'first_name': 'First Name',
    'last_name': 'Last Name',
    'email': 'Email',
    'role': 'Role',
    'preferred_language': 'Preferred Language',
    'pending_invitations': 'Pending Invitations',
    'active_users': 'Active Users',
    'send_invitation': 'Send Invitation',
    'invitation_sent': 'Invitation sent',
    'invitation_error': 'Invitation error',
    'admin': 'Administrator',
    'manager': 'Manager',
    'technician': 'Technician',
    'supervisor': 'Supervisor',
    'viewer': 'Viewer',
    
    // Reports  
    'reports_description': 'Analyses and performance indicators for your farm',
    
    // Farm setup
    'farm_name': 'Farm Name',
    'language': 'Language',
    'currency': 'Currency',
    'basin_types': 'Basin Types',
    'fish_species': 'Fish Species',
    'initial_setup': 'Initial Setup',
    'setup_description': 'Configure your fish farm to get started',
    'general_settings': 'General Settings',
    'basic_information': 'Basic Information',
    'regional_settings': 'Regional Settings',
    
    // Basin types
    'floating': 'Floating',
    'fixed': 'Fixed',
    'above_ground': 'Above ground',
    'floating_cage': 'Floating Cage',
    'fixed_cage': 'Fixed Cage',
    'concrete_basin': 'Concrete Basin',
    'earth_pond': 'Earth Pond',
    'raceway': 'Raceway',
    'reservoir': 'Reservoir',
    'offshore_basin': 'Offshore Basin',
    'greenhouse': 'Greenhouse',
    
    // Fish species
    'tilapia': 'Tilapia',
    'catfish': 'Catfish',
    'carp': 'Carp',
    'trout': 'Trout',
    'bass': 'Bass',
    'salmon': 'Salmon',
    'other': 'Other',
    
    // Languages
    'french': 'French',
    'english': 'English',
    'arabic': 'Arabic',
    
    // Currencies
    'fcfa': 'CFA Franc (FCFA)',
    'usd': 'US Dollar ($)',
    'eur': 'Euro (€)',
    'mad': 'Moroccan Dirham (MAD)',
    'dza': 'Algerian Dinar (DZD)',
    'tnd': 'Tunisian Dinar (TND)',
    
    // Dashboard
    'overview': 'Overview of your fish farm',
    'active_cages': 'Active cages',
    'total_fish': 'Total fish',
    'alerts': 'Alerts',
    'daily_sales': 'Daily sales',
    'avg_growth': 'Avg. growth',
    
    // Configuration
    'fill_required_fields': 'Please fill all required fields',
    'config_saved': 'Configuration saved',
    'farm_configured_success': 'Your farm has been configured successfully',
    'config_save_error': 'Error saving configuration',
    'farm_name_placeholder': 'Ex: Palm Tree Aquaculture Farm',
    'other_species': 'Other species...',
    'configuring': 'Configuring...',
    'validate_config': 'Configure my farm',
    'go_to_user_management': 'Go to user management',
    'navigation': 'Navigation',
    'smart_notifications': 'AI Notifications',
    'smart_recommendations': 'AI Recommendations',
    'performance': 'Performance',
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

  const updateFarmSettings = async (settings: Partial<FarmSettings>): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('FarmContext updateFarmSettings called with:', settings);

    try {
      // Use upsert to handle both insert and update cases
      const upsertData = {
        user_id: user.id,
        farm_name: settings.farm_name || farmSettings?.farm_name || 'Nouvelle ferme',
        language: settings.language || farmSettings?.language || 'fr',
        currency: settings.currency || farmSettings?.currency || 'fcfa',
        basin_types: settings.basin_types || farmSettings?.basin_types || [],
        fish_species: settings.fish_species || farmSettings?.fish_species || [],
        is_configured: settings.is_configured !== undefined ? settings.is_configured : (farmSettings?.is_configured || false)
      };
      
      console.log('Upserting farm settings:', upsertData);
      
      const { data, error } = await supabase
        .from('farm_settings')
        .upsert(upsertData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase upsert error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Farm settings updated successfully:', data);
      setFarmSettings(data as FarmSettings);
      
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

  const isOwner = () => {
    return farmSettings?.user_id === user?.id;
  };

  return (
    <FarmContext.Provider value={{
      farmSettings,
      loading,
      updateFarmSettings,
      isConfigured,
      formatCurrency,
      translate,
      isOwner
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