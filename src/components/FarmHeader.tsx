import React from 'react';
import { useFarm } from '@/contexts/FarmContext';

interface FarmHeaderProps {
  title?: string;
  subtitle?: string;
}

export const FarmHeader = ({ title, subtitle }: FarmHeaderProps) => {
  const { farmSettings, translate } = useFarm();

  return (
    <div className="mb-8">
      {farmSettings?.farm_name && (
        <div className="mb-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <h2 className="text-lg font-semibold text-primary">
            {farmSettings.farm_name}
          </h2>
        </div>
      )}
      {title && (
        <h1 className="text-4xl font-bold text-black mb-2">
          {translate(title) || title}
        </h1>
      )}
      {subtitle && (
        <p className="text-black/80 text-lg">
          {translate(subtitle) || subtitle}
        </p>
      )}
      <div className="flex items-center gap-2 mt-2 text-white/60">
        <div className="w-2 h-2 bg-aqua-400 rounded-full animate-pulse"></div>
        <span className="text-sm">{translate('last_update')}: temps réel</span>
      </div>
    </div>
  );
};