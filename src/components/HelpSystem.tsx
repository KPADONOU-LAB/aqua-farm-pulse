import React, { useState } from "react";
import { HelpCircle, Book, Users, Wallet, BarChart3, Package, ShoppingCart, Heart, Droplets, Utensils, Grid3X3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const helpContent = {
  dashboard: {
    title: "Tableau de bord",
    icon: Grid3X3,
    description: "Vue d'ensemble de votre exploitation",
    sections: [
      {
        title: "KPIs principaux",
        content: "Consultez vos indicateurs clés : nombre de cages, production totale, revenus du mois."
      },
      {
        title: "Alertes importantes",
        content: "Surveillez les alertes en temps réel : stock faible, problèmes de santé, dates d'expiration."
      },
      {
        title: "Graphiques de performance",
        content: "Analysez l'évolution de votre production et vos ventes sur les derniers mois."
      }
    ]
  },
  cages: {
    title: "Gestion des cages",
    icon: Grid3X3,
    description: "Gérez vos bassins de production",
    sections: [
      {
        title: "Créer une cage",
        content: "Cliquez sur 'Nouvelle cage' pour ajouter un bassin. Renseignez l'espèce, le nombre de poissons et le statut."
      },
      {
        title: "Suivi des performances",
        content: "Consultez le poids moyen, le FCR (indice de conversion alimentaire) et la croissance de chaque cage."
      },
      {
        title: "Historique des modifications",
        content: "Accédez à l'historique complet des changements pour chaque cage via le bouton d'historique."
      }
    ]
  },
  feeding: {
    title: "Alimentation",
    icon: Utensils,
    description: "Enregistrez les sessions de nourrissage",
    sections: [
      {
        title: "Nouvelle session",
        content: "Créez une session en sélectionnant la cage, l'heure, la quantité et le type d'aliment distribué."
      },
      {
        title: "Évaluation de l'appétit",
        content: "Notez l'appétit des poissons (faible, normal, bon) pour détecter d'éventuels problèmes."
      },
      {
        title: "Observations",
        content: "Ajoutez des notes sur le comportement alimentaire ou toute observation particulière."
      }
    ]
  },
  waterQuality: {
    title: "Qualité de l'eau",
    icon: Droplets,
    description: "Surveillez les paramètres environnementaux",
    sections: [
      {
        title: "Mesures essentielles",
        content: "Enregistrez pH, température, oxygène dissous et turbidité pour chaque cage."
      },
      {
        title: "Seuils d'alerte",
        content: "Le système détecte automatiquement les valeurs anormales et génère des alertes."
      },
      {
        title: "Tendances",
        content: "Consultez l'évolution des paramètres dans le temps via les graphiques."
      }
    ]
  },
  health: {
    title: "Santé des poissons",
    icon: Heart,
    description: "Monitoring sanitaire du cheptel",
    sections: [
      {
        title: "Observations sanitaires",
        content: "Enregistrez toute observation de santé : comportement, mortalité, signes de maladie."
      },
      {
        title: "Traitements",
        content: "Documentez les traitements appliqués et suivez leur efficacité."
      },
      {
        title: "Prévention",
        content: "Utilisez les données pour identifier les facteurs de risque et prévenir les problèmes."
      }
    ]
  },
  inventory: {
    title: "Gestion des stocks",
    icon: Package,
    description: "Gérez votre inventaire",
    sections: [
      {
        title: "Suivi des stocks",
        content: "Contrôlez les niveaux d'aliments, médicaments et équipements en temps réel."
      },
      {
        title: "Alertes automatiques",
        content: "Recevez des notifications quand les stocks atteignent le minimum ou expirent."
      },
      {
        title: "Gestion des fournisseurs",
        content: "Organisez vos achats en associant chaque produit à son fournisseur."
      }
    ]
  },
  sales: {
    title: "Ventes",
    icon: ShoppingCart,
    description: "Enregistrez vos ventes de poissons",
    sections: [
      {
        title: "Nouvelle vente",
        content: "Sélectionnez la cage, le client, la quantité et le prix pour enregistrer une vente."
      },
      {
        title: "Types de vente",
        content: "Différenciez vente directe, grossiste, restaurant selon votre clientèle."
      },
      {
        title: "Analyse des revenus",
        content: "Suivez votre chiffre d'affaires et analysez la rentabilité par cage."
      }
    ]
  },
  finance: {
    title: "Finance",
    icon: Wallet,
    description: "Gestion financière complète",
    sections: [
      {
        title: "Transactions",
        content: "Enregistrez tous vos revenus et dépenses avec catégorisation automatique."
      },
      {
        title: "Budgets",
        content: "Créez et suivez vos budgets par catégorie : aliments, équipement, personnel, etc."
      },
      {
        title: "Analyses financières",
        content: "Consultez rentabilité, marge, ROI et autres KPIs financiers clés."
      }
    ]
  },
  crm: {
    title: "CRM - Relation client",
    icon: Users,
    description: "Gérez votre portefeuille client",
    sections: [
      {
        title: "Fiches clients",
        content: "Créez des profils détaillés avec coordonnées, historique et préférences."
      },
      {
        title: "Commandes",
        content: "Gérez le cycle complet : commande, préparation, livraison, facturation."
      },
      {
        title: "Suivi commercial",
        content: "Analysez le CA par client, fréquence d'achat et opportunités de développement."
      }
    ]
  },
  reports: {
    title: "Rapports et analyses",
    icon: BarChart3,
    description: "Analyses et statistiques avancées",
    sections: [
      {
        title: "Tableaux de bord",
        content: "Consultez des vues synthétiques par activité : production, commercial, financier."
      },
      {
        title: "Rapports périodiques",
        content: "Générez des rapports mensuels, trimestriels pour le suivi de performance."
      },
      {
        title: "Analyses prédictives",
        content: "Utilisez les tendances pour anticiper les besoins et optimiser la production."
      }
    ]
  }
};

const quickTips = [
  {
    title: "Saisie quotidienne",
    tip: "Enregistrez alimentation et qualité eau chaque jour pour un suivi optimal."
  },
  {
    title: "Alertes prioritaires",
    tip: "Traitez immédiatement les alertes de santé et de stock faible."
  },
  {
    title: "Analyses mensuelles",
    tip: "Consultez vos rapports chaque mois pour identifier les améliorations possibles."
  },
  {
    title: "Backup des données",
    tip: "Vos données sont automatiquement sauvegardées, mais exportez régulièrement vos rapports."
  }
];

interface HelpSystemProps {
  currentModule?: string;
}

export function HelpSystem({ currentModule }: HelpSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(currentModule || "dashboard");

  const handleOpen = () => {
    setIsOpen(true);
    if (currentModule && helpContent[currentModule as keyof typeof helpContent]) {
      setActiveTab(currentModule);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full p-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Guide d'utilisation AquaManager
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full mb-6">
              <TabsTrigger value="dashboard" className="text-xs">Accueil</TabsTrigger>
              <TabsTrigger value="production" className="text-xs">Production</TabsTrigger>
              <TabsTrigger value="commercial" className="text-xs">Commercial</TabsTrigger>
              <TabsTrigger value="gestion" className="text-xs">Gestion</TabsTrigger>
              <TabsTrigger value="tips" className="text-xs">Conseils</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Grid3X3 className="h-5 w-5" />
                      {helpContent.dashboard.title}
                    </CardTitle>
                    <CardDescription>{helpContent.dashboard.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {helpContent.dashboard.sections.map((section, index) => (
                      <div key={index} className="border-l-2 border-primary/20 pl-4">
                        <h4 className="font-medium text-sm">{section.title}</h4>
                        <p className="text-sm text-muted-foreground">{section.content}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="production" className="space-y-4">
              <div className="grid gap-4">
                {[helpContent.cages, helpContent.feeding, helpContent.waterQuality, helpContent.health].map((module, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <module.icon className="h-5 w-5" />
                        {module.title}
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {module.sections.map((section, sIndex) => (
                        <div key={sIndex} className="border-l-2 border-primary/20 pl-4">
                          <h4 className="font-medium text-sm">{section.title}</h4>
                          <p className="text-sm text-muted-foreground">{section.content}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="commercial" className="space-y-4">
              <div className="grid gap-4">
                {[helpContent.sales, helpContent.crm].map((module, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <module.icon className="h-5 w-5" />
                        {module.title}
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {module.sections.map((section, sIndex) => (
                        <div key={sIndex} className="border-l-2 border-primary/20 pl-4">
                          <h4 className="font-medium text-sm">{section.title}</h4>
                          <p className="text-sm text-muted-foreground">{section.content}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gestion" className="space-y-4">
              <div className="grid gap-4">
                {[helpContent.inventory, helpContent.finance, helpContent.reports].map((module, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <module.icon className="h-5 w-5" />
                        {module.title}
                      </CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {module.sections.map((section, sIndex) => (
                        <div key={sIndex} className="border-l-2 border-primary/20 pl-4">
                          <h4 className="font-medium text-sm">{section.title}</h4>
                          <p className="text-sm text-muted-foreground">{section.content}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Conseils d'utilisation</CardTitle>
                  <CardDescription>Bonnes pratiques pour optimiser votre utilisation d'AquaManager</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {quickTips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Badge variant="secondary" className="mt-0.5">{index + 1}</Badge>
                        <div>
                          <h4 className="font-medium text-sm">{tip.title}</h4>
                          <p className="text-sm text-muted-foreground">{tip.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Flux de travail recommandé</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">🌅 Routine matinale</h4>
                      <p className="text-sm text-muted-foreground">Consultez le tableau de bord → Traitez les alertes → Planifiez les tâches du jour</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">🔄 Opérations quotidiennes</h4>
                      <p className="text-sm text-muted-foreground">Alimentation → Mesures qualité eau → Observations santé → Mise à jour stocks</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">📊 Suivi hebdomadaire</h4>
                      <p className="text-sm text-muted-foreground">Analyse des performances → Gestion des commandes → Planification des achats</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">📈 Bilan mensuel</h4>
                      <p className="text-sm text-muted-foreground">Rapports financiers → Analyse de croissance → Ajustement des budgets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default HelpSystem;