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