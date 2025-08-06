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
    
    // TopNavigation - Menu items
    'dashboard_title': 'Tableau de bord',
    'cages_title': 'Cages',
    'feeding_title': 'Alimentation',
    'health_title': 'Santé',
    'sales_title': 'Ventes',
    'water_quality_title': 'Qualité eau',
    'inventory_title': 'Stocks',
    'reports_title': 'Rapports',
    'performance_title': 'Performance',
    'predictions_ai_title': 'Prédictions IA',
    'finance_title': 'Finance',
    'crm_title': 'CRM',
    'alerts_title': 'Alertes',
    'custom_dashboards_title': 'Dashboards',
    'smart_recommendations_title': 'Recommandations IA',
    'smart_notifications_title': 'Notifications IA',
    'advanced_reports_title': 'Rapports Avancés',
    'advanced_analytics_title': 'Analytics IA',
    'smart_alerts_title': 'Alertes IA',
    
    // Menu groups
    'quality_group': 'Qualité',
    'analytics_group': 'Analytics',
    'management_group': 'Gestion',
    'advanced_group': 'Avancé',
    'more_menu': 'Plus',
    
    // User section
    'logout_title': 'Déconnexion',
    'smart_management': 'Gestion intelligente',
    
    // Messages and greetings
    'good_evening': 'Bonsoir',
    'good_morning': 'Bonjour',
    'good_afternoon': 'Bonne après-midi',
    'good_night': 'Bonne nuit',
    'recommended_actions': 'Voici vos actions recommandées pour aujourd\'hui',
    'quick_access': 'Accès Rapide',
    'active_alerts': 'Alertes Actives',
    'ready_harvest': 'Prêt Récolte',
    
    // Advanced tools menu
    'advanced_tools': 'Outils Avancés',
    
    // Dashboard tasks and recommendations
    'daily_tasks': 'Tâches Quotidiennes',
    'daily_feeding': 'Alimentation Quotidienne',
    'feeding_management': 'Gérer l\'alimentation de 6 cages actives',
    'health_monitoring': 'Contrôle Santé',
    'health_record': 'Enregistrer les observations quotidiennes',
    'ai_recommendations': 'Recommandations IA',
    'optimization_recommendations': 'Optimisations personnalisées basées sur vos données',
    
    // Cages page
    'cage_management': 'Gestion des cages',
    'cage_management_description': 'Surveillez et gérez vos installations piscicoles en temps réel',
    'export_history': 'Exporter historique',
    'loading_cages': 'Chargement des cages...',
    'out_of_total': 'Sur {total} total',
    'fish_being_raised': 'Poissons en élevage',
    'weight_per_fish': 'Poids par poisson',
    'average_fcr': 'FCR moyen',
    'conversion_ratio': 'Ratio de conversion',
    'your_cages': 'Vos cages',
    'cage_count_total': '{count} cage{count > 1 ? \'s\' : \'\'} au total',
    'no_cages_created': 'Aucune cage créée',
    'create_first_cage_description': 'Commencez par créer votre première cage pour suivre vos installations piscicoles',
    'excellent_performance': 'Excellente',
    'good_performance': 'Bonne',
    'average_performance': 'Moyenne',
    'critical_performance': 'Critique',
    'survival': 'Survie',
    'estimated_revenue': 'Revenus estimés',
    'remaining_fish': 'Poissons restants',
    'out_of_initial': 'sur {initial} initial',
    'introduction_date': 'Date introduction',
    'cage_available': 'Cage disponible',
    'start_cycle': 'Démarrer cycle',
    'complete_history': 'Historique_Complet',
    'history_all_cages': 'Historique_Toutes_Cages',
    'export_success': 'Export réussi',
    'export_complete_description': 'L\'historique complet a été exporté en Excel.',
    'export_error_description': 'Erreur lors de l\'export de l\'historique.',
    'cage': 'Cage',
    'species': 'Espèce',
    'modified_field': 'Champ modifié',
    'old_value': 'Ancienne valeur',
    'new_value': 'Nouvelle valeur',
    'modification': 'Modification',
    'fish_count': 'Nombre de poissons',
    'average_weight_kg': 'Poids moyen (kg)',
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
    
    // TopNavigation - Menu items
    'dashboard_title': 'Dashboard',
    'cages_title': 'Cages',
    'feeding_title': 'Feeding',
    'health_title': 'Health',
    'sales_title': 'Sales',
    'water_quality_title': 'Water Quality',
    'inventory_title': 'Inventory',
    'reports_title': 'Reports',
    'performance_title': 'Performance',
    'predictions_ai_title': 'AI Predictions',
    'finance_title': 'Finance',
    'crm_title': 'CRM',
    'alerts_title': 'Alerts',
    'custom_dashboards_title': 'Dashboards',
    'smart_recommendations_title': 'AI Recommendations',
    'smart_notifications_title': 'AI Notifications',
    'advanced_reports_title': 'Advanced Reports',
    'advanced_analytics_title': 'AI Analytics',
    'smart_alerts_title': 'AI Alerts',
    
    // Menu groups
    'quality_group': 'Quality',
    'analytics_group': 'Analytics',
    'management_group': 'Management',
    'advanced_group': 'Advanced',
    'more_menu': 'More',
    
    // User section
    'logout_title': 'Logout',
    'smart_management': 'Smart management',
    
    // Messages and greetings
    'good_evening': 'Good evening',
    'good_morning': 'Good morning',
    'good_afternoon': 'Good afternoon',
    'good_night': 'Good night',
    'recommended_actions': 'Here are your recommended actions for today',
    'quick_access': 'Quick Access',
    'active_alerts': 'Active Alerts',
    'ready_harvest': 'Ready Harvest',
    
    // Advanced tools menu
    'advanced_tools': 'Advanced Tools',
    
    // Dashboard tasks and recommendations
    'daily_tasks': 'Daily Tasks',
    'daily_feeding': 'Daily Feeding',
    'feeding_management': 'Manage feeding for 6 active cages',
    'health_monitoring': 'Health Monitoring',
    'health_record': 'Record daily observations',
    'ai_recommendations': 'AI Recommendations',
    'optimization_recommendations': 'Personalized optimizations based on your data',
    
    // Cages page
    'cage_management': 'Cage Management',
    'cage_management_description': 'Monitor and manage your fish farming installations in real time',
    'export_history': 'Export History',
    'loading_cages': 'Loading cages...',
    'out_of_total': 'Out of {total} total',
    'fish_being_raised': 'Fish being raised',
    'weight_per_fish': 'Weight per fish',
    'average_fcr': 'Average FCR',
    'conversion_ratio': 'Conversion ratio',
    'your_cages': 'Your cages',
    'cage_count_total': '{count} cage{count > 1 ? \'s\' : \'\'} total',
    'no_cages_created': 'No cages created',
    'create_first_cage_description': 'Start by creating your first cage to track your fish farming installations',
    'excellent_performance': 'Excellent',
    'good_performance': 'Good',
    'average_performance': 'Average',
    'critical_performance': 'Critical',
    'survival': 'Survival',
    'estimated_revenue': 'Estimated revenue',
    'remaining_fish': 'Remaining fish',
    'out_of_initial': 'out of {initial} initial',
    'introduction_date': 'Introduction date',
    'cage_available': 'Cage available',
    'start_cycle': 'Start cycle',
    'complete_history': 'Complete_History',
    'history_all_cages': 'History_All_Cages',
    'export_success': 'Export successful',
    'export_complete_description': 'Complete history has been exported to Excel.',
    'export_error_description': 'Error exporting history.',
    'cage': 'Cage',
    'species': 'Species',
    'modified_field': 'Modified field',
    'old_value': 'Old value',
    'new_value': 'New value',
    'modification': 'Modification',
    'fish_count': 'Fish count',
    'average_weight_kg': 'Average weight (kg)',
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