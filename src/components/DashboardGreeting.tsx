import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardGreetingProps {
  userName?: string;
}

export const DashboardGreeting = ({ userName }: DashboardGreetingProps) => {
  const { t } = useLanguage();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return t('good_night');
    if (hour < 12) return t('good_morning');
    if (hour < 18) return t('good_afternoon');
    return t('good_evening');
  };

  const extractFirstName = (email?: string) => {
    if (!email) return '';
    // Extract name from email (everything before @)
    const nameFromEmail = email.split('@')[0];
    // Remove numbers and special characters, capitalize first letter
    const cleanName = nameFromEmail.replace(/[0-9]/g, '').replace(/[^a-zA-Z]/g, '');
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  };

  const displayName = userName ? extractFirstName(userName) : '';

  return (
    <div className="mb-6">
      <h1 className="text-4xl font-bold text-black mb-2">
        {getGreeting()}{displayName ? `, ${displayName}` : ''}
      </h1>
      <p className="text-black/80 text-lg">
        {t('recommended_actions')}
      </p>
    </div>
  );
};