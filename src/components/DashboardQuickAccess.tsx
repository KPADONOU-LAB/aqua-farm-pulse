import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fish, Coffee, Heart, ShoppingCart, Home } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import { NavLink } from 'react-router-dom';

export const DashboardQuickAccess = () => {
  const { t } = useLanguage();

  const quickAccessItems = [
    {
      title: t('cages_title'),
      url: '/cages',
      icon: Fish,
      className: 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200'
    },
    {
      title: t('feeding_title'),
      url: '/feeding',
      icon: Coffee,
      className: 'bg-green-100 hover:bg-green-200 text-green-700 border-green-200'
    },
    {
      title: t('health_title'),
      url: '/health',
      icon: Heart,
      className: 'bg-red-100 hover:bg-red-200 text-red-700 border-red-200'
    },
    {
      title: t('sales_title'),
      url: '/sales',
      icon: ShoppingCart,
      className: 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200'
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Home className="h-5 w-5 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-800">{t('quick_access')}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickAccessItems.map((item) => (
          <NavLink key={item.title} to={item.url}>
            <Card className={`${item.className} transition-all duration-200 cursor-pointer hover:shadow-md`}>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <item.icon className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium text-center">{item.title}</span>
              </CardContent>
            </Card>
          </NavLink>
        ))}
      </div>
    </div>
  );
};