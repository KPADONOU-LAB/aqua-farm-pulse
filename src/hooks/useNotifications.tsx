import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Notification {
  id: string;
  type_notification: string;
  titre: string;
  message: string;
  priorite: string;
  statut: string;
  data_contexte?: any;
  envoye_push: boolean;
  envoye_email: boolean;
  date_envoi?: string;
  date_lu?: string;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => n.statut === 'non_lu').length || 0);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          statut: 'lu',
          date_lu: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchNotifications();
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          statut: 'lu',
          date_lu: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('statut', 'non_lu');

      if (error) throw error;
      
      await fetchNotifications();
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'statut' | 'envoye_push' | 'envoye_email'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notification,
          user_id: user.id,
          statut: 'non_lu',
          envoye_push: false,
          envoye_email: false
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchNotifications();
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  };

  const generateAutomaticNotifications = async () => {
    if (!user) return;

    try {
      await supabase.rpc('generate_feeding_notifications');
      await fetchNotifications();
    } catch (error) {
      console.error('Erreur lors de la génération des notifications automatiques:', error);
    }
  };

  // Vérifier les nouvelles notifications toutes les 30 secondes
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    createNotification,
    generateAutomaticNotifications,
    refetch: fetchNotifications
  };
};