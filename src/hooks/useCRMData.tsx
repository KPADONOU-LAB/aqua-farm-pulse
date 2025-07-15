import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Client {
  id: string;
  user_id: string;
  nom_entreprise: string;
  contact_principal?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  type_client: string;
  chiffre_affaires_annuel: number;
  derniere_commande?: string;
  notes?: string;
  statut: string;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  user_id: string;
  client_id: string;
  numero_commande: string;
  statut: string;
  date_commande: string;
  date_livraison_prevue?: string;
  date_livraison_reelle?: string;
  montant_total: number;
  quantite_kg: number;
  prix_kg: number;
  type_poisson: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  client?: Pick<Client, 'nom_entreprise'>;
}

interface CRMStats {
  totalClients: number;
  activeClients: number;
  monthlyOrders: number;
  ordersGrowth: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  clientRetentionRate: number;
}

export const useCRMData = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [crmStats, setCrmStats] = useState<CRMStats>({
    totalClients: 0,
    activeClients: 0,
    monthlyOrders: 0,
    ordersGrowth: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0,
    clientRetentionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCRMData();
    }
  }, [user]);

  const loadCRMData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load orders with client info
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('date_commande', { ascending: false });

      const processedOrders = ordersData || [];

      setClients((clientsData || []) as Client[]);
      setOrders(processedOrders as Order[]);

      // Calculate stats
      calculateCRMStats(clientsData || [], processedOrders);

    } catch (error) {
      console.error('Erreur lors du chargement des données CRM:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCRMStats = (clientsData: any[], ordersData: any[]) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Current month orders
    const currentMonthOrders = ordersData.filter(order => {
      const orderDate = new Date(order.date_commande);
      return orderDate.getMonth() === currentMonth && 
             orderDate.getFullYear() === currentYear;
    });

    // Last month orders
    const lastMonthOrders = ordersData.filter(order => {
      const orderDate = new Date(order.date_commande);
      return orderDate.getMonth() === lastMonth && 
             orderDate.getFullYear() === lastMonthYear;
    });

    const totalClients = clientsData.length;
    const activeClients = clientsData.filter(client => client.statut === 'actif').length;
    const monthlyOrders = currentMonthOrders.length;
    const monthlyRevenue = currentMonthOrders.reduce((sum, order) => sum + order.montant_total, 0);
    const averageOrderValue = monthlyOrders > 0 ? monthlyRevenue / monthlyOrders : 0;
    
    const ordersGrowth = lastMonthOrders.length > 0 
      ? ((monthlyOrders - lastMonthOrders.length) / lastMonthOrders.length) * 100 
      : 0;

    // Calculate client retention rate (simplified)
    const clientsWithRecentOrders = new Set(
      ordersData.filter(order => {
        const orderDate = new Date(order.date_commande);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return orderDate >= sixMonthsAgo;
      }).map(order => order.client_id)
    );

    const clientRetentionRate = totalClients > 0 
      ? (clientsWithRecentOrders.size / totalClients) * 100 
      : 0;

    setCrmStats({
      totalClients,
      activeClients,
      monthlyOrders,
      ordersGrowth,
      monthlyRevenue,
      averageOrderValue,
      clientRetentionRate
    });
  };

  const refreshData = () => {
    loadCRMData();
  };

  return {
    clients,
    orders,
    crmStats,
    loading,
    refreshData
  };
};