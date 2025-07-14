import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface InventoryItem {
  id: string;
  nom: string;
  categorie: string;
  stock_actuel: number;
  unite: string;
  stock_min: number;
  prix_unitaire: number;
  fournisseur: string | null;
  date_expiration: string | null;
  statut: string;
  created_at: string;
}

interface ConsumptionData {
  mois: string;
  aliment: number;
  veterinaire: number;
  materiel: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export const useInventoryData = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [consumptionData, setConsumptionData] = useState<ConsumptionData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [stats, setStats] = useState({
    stocksCritiques: 0,
    stocksFaibles: 0,
    articlesTotal: 0,
    valeurTotale: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadInventoryData();
    }
  }, [user]);

  const loadInventoryData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Charger l'inventaire
      const { data: inventoryItems } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const inventory = inventoryItems || [];

      // Calculer les statistiques
      const stocksCritiques = inventory.filter(item => item.statut === 'critique').length;
      const stocksFaibles = inventory.filter(item => item.statut === 'faible').length;
      const valeurTotale = inventory.reduce((sum, item) => sum + (item.stock_actuel * item.prix_unitaire), 0);

      // Générer les données de consommation par mois (simulation basée sur les données)
      const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
      const consumptionData = mois.map(mois => {
        const alimentItems = inventory.filter(item => item.categorie === 'aliment');
        const vetItems = inventory.filter(item => item.categorie === 'veterinaire');
        const materielItems = inventory.filter(item => item.categorie === 'materiel');

        return {
          mois,
          aliment: alimentItems.reduce((sum, item) => sum + (item.stock_min * 0.3), 0), // Simulation
          veterinaire: vetItems.reduce((sum, item) => sum + (item.stock_min * 0.2), 0),
          materiel: materielItems.reduce((sum, item) => sum + (item.stock_min * 0.1), 0)
        };
      });

      // Générer les données par catégorie
      const categories = inventory.reduce((acc, item) => {
        const cat = item.categorie;
        if (!acc[cat]) {
          acc[cat] = { count: 0, value: 0 };
        }
        acc[cat].count += 1;
        acc[cat].value += item.stock_actuel * item.prix_unitaire;
        return acc;
      }, {} as Record<string, { count: number, value: number }>);

      const categoryData: CategoryData[] = [
        { name: 'Aliments', value: categories.aliment?.count || 0, color: '#10b981' },
        { name: 'Vétérinaire', value: categories.veterinaire?.count || 0, color: '#0ea5e9' },
        { name: 'Matériel', value: categories.materiel?.count || 0, color: '#f59e0b' },
      ].filter(cat => cat.value > 0);

      setInventory(inventory);
      setConsumptionData(consumptionData);
      setCategoryData(categoryData);
      setStats({
        stocksCritiques,
        stocksFaibles,
        articlesTotal: inventory.length,
        valeurTotale
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données d\'inventaire:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    inventory,
    consumptionData,
    categoryData,
    stats,
    loading,
    refreshData: loadInventoryData
  };
};