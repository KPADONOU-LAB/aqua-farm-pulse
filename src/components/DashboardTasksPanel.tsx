import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Coffee, Heart, Lightbulb } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { Badge } from "@/components/ui/badge";

export const DashboardTasksPanel = () => {
  const { language } = useSyncedLanguage(); // Use synced language
  const { t } = useLanguage();

  const dailyTasks = [
    {
      title: t('daily_feeding'),
      description: t('feeding_management'),
      icon: Coffee,
      count: 6,
      color: 'bg-orange-100 text-orange-700 border-orange-200'
    },
    {
      title: t('health_monitoring'),
      description: t('health_record'),
      icon: Heart,
      count: null,
      color: 'bg-red-100 text-red-700 border-red-200'
    }
  ];

  const advancedTools = [
    {
      title: t('ai_recommendations'),
      description: t('optimization_recommendations'),
      icon: Lightbulb,
      count: 1,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tâches Quotidiennes */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            {t('daily_tasks')}
            <Badge variant="secondary" className="ml-auto">
              3
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dailyTasks.map((task, index) => (
            <div key={index} className={`p-4 rounded-lg border ${task.color} hover:shadow-sm transition-shadow cursor-pointer`}>
              <div className="flex items-start gap-3">
                <task.icon className="h-5 w-5 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{task.title}</h3>
                    {task.count && (
                      <Badge variant="outline" className="text-xs">
                        {task.count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm opacity-80 mt-1">{task.description}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Outils Avancés */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5" />
            {t('advanced_tools')}
            <Badge variant="secondary" className="ml-auto">
              1
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {advancedTools.map((tool, index) => (
            <div key={index} className={`p-4 rounded-lg border ${tool.color} hover:shadow-sm transition-shadow cursor-pointer`}>
              <div className="flex items-start gap-3">
                <tool.icon className="h-5 w-5 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{tool.title}</h3>
                    {tool.count && (
                      <Badge variant="outline" className="text-xs">
                        {tool.count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm opacity-80 mt-1">{tool.description}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};