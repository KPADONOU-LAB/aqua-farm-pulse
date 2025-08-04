import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const authTranslations = {
  fr: {
    // Auth page
    'app_title': 'PisciManager',
    'app_description': 'Gestion intelligente de votre ferme piscicole',
    'signin': 'Connexion',
    'signup': 'Inscription',
    'email': 'Email',
    'password': 'Mot de passe',
    'signin_button': 'Se connecter',
    'signup_button': 'S\'inscrire',
    'forgot_password': 'Mot de passe oublié ?',
    'signing_in': 'Connexion...',
    'signing_up': 'Inscription...',
    'reset_password_title': 'Récupération du mot de passe',
    'reset_password_description': 'Entrez votre email pour recevoir un lien de récupération',
    'send_reset_link': 'Envoyer le lien',
    'sending': 'Envoi...',
    'back_to_signin': 'Retour à la connexion',
    'email_placeholder': 'votre@email.com',
    'password_placeholder': '••••••••',
    
    // Messages
    'signin_error': 'Erreur de connexion',
    'signup_error': 'Erreur d\'inscription',
    'signin_success': 'Connexion réussie',
    'signup_success': 'Inscription réussie',
    'welcome_message': 'Bienvenue dans PisciManager !',
    'account_created': 'Votre compte a été créé avec succès !',
    'invalid_credentials': 'Email ou mot de passe incorrect',
    'user_already_exists': 'Cet email est déjà utilisé',
    'reset_email_sent': 'Email envoyé',
    'reset_link_sent': 'Un lien de récupération a été envoyé à votre adresse email',
    'reset_error': 'Impossible d\'envoyer l\'email de récupération',
    'generic_error': 'Une erreur est survenue',
    
    // Language selector
    'language_selector': 'Langue',
    'french': 'Français',
    'english': 'Anglais',
    
    // Farm Setup
    'initial_setup': 'Configuration initiale',
    'setup_description': 'Configurez votre ferme piscicole pour commencer',
    'farm_name': 'Nom de la ferme',
    'farm_name_placeholder': 'Ex: Ferme Aquacole des Palmiers',
    'language': 'Langue',
    'currency': 'Devise',
    'basin_types': 'Types de bassins',
    'fish_species': 'Espèces élevées',
    'other_species': 'Autre espèce...',
    'add': 'Ajouter',
    'validate_config': 'Configurer ma ferme',
    'go_to_user_management': 'Passer à l\'ajout des utilisateurs',
    'configuring': 'Configuration...',
    'fcfa': 'FCFA',
    'eur': 'Euro (€)',
    'usd': 'Dollar américain ($)',
    'error': 'Erreur',
    'fill_required_fields': 'Veuillez remplir tous les champs obligatoires',
    'config_saved': 'Configuration sauvegardée',
    'farm_configured_success': 'Votre ferme a été configurée avec succès',
    'config_save_error': 'Erreur lors de la sauvegarde de la configuration',
    // Basin types
    'floating': 'Flottante',
    'fixed': 'Fixe',
    'above_ground': 'Hors-sol',
    // Fish species
    'tilapia': 'Tilapia',
    'catfish': 'Silure',
    'carp': 'Carpe',
    
    // Dashboard and navigation
    'dashboard': 'Tableau de bord',
    'overview': 'Vue d\'ensemble',
    'active_cages': 'Cages actives',
    'empty_cages': 'vides',
    'total_fish': 'Total poissons',
    'avg_weight': 'Poids moy',
    'consumed_feed': 'Aliment consommé',
    'today_dashboard': 'Aujourd\'hui',
    'alerts_dashboard': 'Alertes',
    'attention_required': 'Attention requise',
    'avg_growth': 'Croissance moy.',
    'avg_weight_full': 'Poids moyen',
    'sales_today': 'Ventes aujourd\'hui',
    'revenue': 'revenus',
    'avg_growth_6months': 'Croissance moyenne (6 mois)',
    'weekly_sales_tons': 'Ventes hebdomadaires (tonnes)',
    'recent_alerts': 'Alertes récentes',
    
    // Navigation menu
    'navigation': 'Navigation',
    'cages': 'Cages',
    'feeding': 'Alimentation',
    'water_quality': 'Qualité eau',
    'health': 'Santé',
    'inventory': 'Stocks',
    'sales': 'Ventes',
    'finance': 'Finance',
    'crm': 'CRM',
    'reports': 'Rapports',
    'advanced_analytics': 'Analytics avancées',
    'smart_notifications': 'Notifications intelligentes',
    'smart_recommendations': 'Recommandations intelligentes',
    'performance': 'Performance',
    'analytics': 'Analytics',
    'logout': 'Déconnexion',
    'modern_farm': 'Ferme moderne',
    
    // Chart data
    'month': 'Mois',
    'weight': 'Poids',
    'day': 'Jour',
    'sales_chart': 'Ventes',
    
    // Common terms
    'kg': 'kg',
    'tons': 'tonnes',
    'today_common': 'Aujourd\'hui',
    'attention': 'Attention',
    'required': 'requise',
    'last_update': 'Dernière mise à jour',
    'real_time': 'temps réel',
    
    // Sidebar navigation
    'operations': 'Opérations',
    'management': 'Gestion',
    'cage_history': 'Historique Cages',
    'settings': 'Paramètres',
  },
  en: {
    // Auth page
    'app_title': 'PisciManager',
    'app_description': 'Smart management for your fish farm',
    'signin': 'Sign In',
    'signup': 'Sign Up',
    'email': 'Email',
    'password': 'Password',
    'signin_button': 'Sign In',
    'signup_button': 'Sign Up',
    'forgot_password': 'Forgot password?',
    'signing_in': 'Signing in...',
    'signing_up': 'Signing up...',
    'reset_password_title': 'Password Recovery',
    'reset_password_description': 'Enter your email to receive a recovery link',
    'send_reset_link': 'Send Link',
    'sending': 'Sending...',
    'back_to_signin': 'Back to Sign In',
    'email_placeholder': 'your@email.com',
    'password_placeholder': '••••••••',
    
    // Messages
    'signin_error': 'Sign In Error',
    'signup_error': 'Sign Up Error',
    'signin_success': 'Sign In Successful',
    'signup_success': 'Sign Up Successful',
    'welcome_message': 'Welcome to PisciManager!',
    'account_created': 'Your account has been created successfully!',
    'invalid_credentials': 'Invalid email or password',
    'user_already_exists': 'This email is already in use',
    'reset_email_sent': 'Email Sent',
    'reset_link_sent': 'A recovery link has been sent to your email address',
    'reset_error': 'Unable to send recovery email',
    'generic_error': 'An error occurred',
    
    // Language selector
    'language_selector': 'Language',
    'french': 'French',
    'english': 'English',
    
    // Farm Setup
    'initial_setup': 'Initial Setup',
    'setup_description': 'Configure your fish farm to get started',
    'farm_name': 'Farm Name',
    'farm_name_placeholder': 'Ex: Palmiers Fish Farm',
    'language': 'Language',
    'currency': 'Currency',
    'basin_types': 'Basin Types',
    'fish_species': 'Raised Species',
    'other_species': 'Other species...',
    'add': 'Add',
    'validate_config': 'Configure my farm',
    'go_to_user_management': 'Go to user management',
    'configuring': 'Configuring...',
    'fcfa': 'FCFA',
    'eur': 'Euro (€)',
    'usd': 'US Dollar ($)',
    'error': 'Error',
    'fill_required_fields': 'Please fill in all required fields',
    'config_saved': 'Configuration saved',
    'farm_configured_success': 'Your farm has been configured successfully',
    'config_save_error': 'Error saving configuration',
    // Basin types
    'floating': 'Floating',
    'fixed': 'Fixed',
    'above_ground': 'Above ground',
    // Fish species
    'tilapia': 'Tilapia',
    'catfish': 'Catfish',
    'carp': 'Carp',
    
    // Dashboard and navigation
    'dashboard': 'Dashboard',
    'overview': 'Overview',
    'active_cages': 'Active Cages',
    'empty_cages': 'empty',
    'total_fish': 'Total Fish',
    'avg_weight': 'Avg weight',
    'consumed_feed': 'Consumed Feed',
    'today_dashboard': 'Today',
    'alerts_dashboard': 'Alerts',
    'attention_required': 'Attention required',
    'avg_growth': 'Avg Growth',
    'avg_weight_full': 'Average weight',
    'sales_today': 'Sales Today',
    'revenue': 'revenue',
    'avg_growth_6months': 'Average Growth (6 months)',
    'weekly_sales_tons': 'Weekly Sales (tons)',
    'recent_alerts': 'Recent Alerts',
    
    // Navigation menu
    'navigation': 'Navigation',
    'cages': 'Cages',
    'feeding': 'Feeding',
    'water_quality': 'Water Quality',
    'health': 'Health',
    'inventory': 'Inventory',
    'sales': 'Sales',
    'finance': 'Finance',
    'crm': 'CRM',
    'reports': 'Reports',
    'advanced_analytics': 'Advanced Analytics',
    'smart_notifications': 'Smart Notifications',
    'smart_recommendations': 'Smart Recommendations',
    'performance': 'Performance',
    'analytics': 'Analytics',
    'logout': 'Logout',
    'modern_farm': 'Modern Farm',
    
    // Chart data
    'month': 'Month',
    'weight': 'Weight',
    'day': 'Day',
    'sales_chart': 'Sales',
    
    // Common terms
    'kg': 'kg',
    'tons': 'tons',
    'today_common': 'Today',
    'attention': 'Attention',
    'required': 'required',
    'last_update': 'Last update',
    'real_time': 'real-time',
    
    // Sidebar navigation
    'operations': 'Operations',
    'management': 'Management',
    'cage_history': 'Cage History',
    'settings': 'Settings',
  }
};

// Get browser language with fallback
const getBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  return (browserLang === 'en' || browserLang === 'fr') ? browserLang as Language : 'fr';
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize from localStorage or browser language
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('pisci_language');
    if (saved && (saved === 'fr' || saved === 'en')) {
      return saved as Language;
    }
    return getBrowserLanguage();
  });

  // Update localStorage when language changes
  const setLanguage = (lang: Language) => {
    localStorage.setItem('pisci_language', lang);
    setLanguageState(lang);
  };

  // Translation function
  const t = (key: string): string => {
    try {
      const translations = authTranslations[language];
      if (translations && translations[key]) {
        return translations[key];
      }
      return key;
    } catch (error) {
      console.error('Translation error for key:', key, error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};