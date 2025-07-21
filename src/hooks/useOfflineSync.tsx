import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SyncQueueItem {
  id: string;
  table_name: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id: string;
  data_payload: any;
  device_id?: string;
  timestamp_local: string;
  synced: boolean;
  sync_attempts: number;
  error_message?: string;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user } = useAuth();

  // Détecter les changements de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToSyncQueue = async (
    tableName: string,
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    recordId: string,
    data: any
  ) => {
    if (!user) return;

    const queueItem = {
      table_name: tableName,
      operation,
      record_id: recordId,
      data_payload: data,
      device_id: getDeviceId(),
      timestamp_local: new Date().toISOString(),
      synced: false,
      sync_attempts: 0
    };

    if (isOnline) {
      // Si en ligne, essayer de synchroniser immédiatement
      try {
        await syncSingleItem(queueItem as SyncQueueItem);
      } catch (error) {
        // Si échec, ajouter à la queue locale
        saveToLocalQueue(queueItem);
      }
    } else {
      // Si hors ligne, sauvegarder localement
      saveToLocalQueue(queueItem);
    }
  };

  const saveToLocalQueue = (item: any) => {
    const localQueue = getLocalQueue();
    const newItem = { ...item, id: generateLocalId() };
    localQueue.push(newItem);
    localStorage.setItem('sync_queue', JSON.stringify(localQueue));
    setSyncQueue(localQueue);
  };

  const getLocalQueue = (): SyncQueueItem[] => {
    const stored = localStorage.getItem('sync_queue');
    return stored ? JSON.parse(stored) : [];
  };

  const syncPendingData = async () => {
    if (!user || !isOnline || isSyncing) return;

    setIsSyncing(true);
    const localQueue = getLocalQueue();

    for (const item of localQueue) {
      try {
        await syncSingleItem(item);
        // Supprimer de la queue locale après synchronisation réussie
        removeFromLocalQueue(item.id);
      } catch (error) {
        console.error('Erreur lors de la synchronisation:', error);
        // Incrémenter le compteur d'essais
        updateSyncAttempts(item.id);
      }
    }

    setIsSyncing(false);
  };

  const syncSingleItem = async (item: SyncQueueItem) => {
    if (!user) return;

    // Sauvegarder d'abord dans la table sync_queue pour traçabilité
    await supabase
      .from('sync_queue')
      .insert([{
        user_id: user.id,
        table_name: item.table_name,
        operation: item.operation,
        record_id: item.record_id,
        data_payload: item.data_payload,
        device_id: item.device_id,
        timestamp_local: item.timestamp_local,
        synced: false,
        sync_attempts: item.sync_attempts + 1
      }]);

    // Exécuter l'opération selon le type (simplifié pour TypeScript)
    try {
      if (item.operation === 'INSERT') {
        await supabase
          .from('cages' as any)
          .insert([{ ...item.data_payload, user_id: user.id }]);
      } else if (item.operation === 'UPDATE') {
        await supabase
          .from('cages' as any)
          .update(item.data_payload)
          .eq('id', item.record_id)
          .eq('user_id', user.id);
      } else if (item.operation === 'DELETE') {
        await supabase
          .from('cages' as any)
          .delete()
          .eq('id', item.record_id)
          .eq('user_id', user.id);
      }
    } catch (dbError) {
      console.error('Erreur base de données:', dbError);
      throw dbError;
    }

    // Marquer comme synchronisé
    await supabase
      .from('sync_queue')
      .update({ synced: true })
      .eq('record_id', item.record_id);
  };

  const removeFromLocalQueue = (itemId: string) => {
    const localQueue = getLocalQueue().filter(item => item.id !== itemId);
    localStorage.setItem('sync_queue', JSON.stringify(localQueue));
    setSyncQueue(localQueue);
  };

  const updateSyncAttempts = (itemId: string) => {
    const localQueue = getLocalQueue().map(item => 
      item.id === itemId 
        ? { ...item, sync_attempts: item.sync_attempts + 1 }
        : item
    );
    localStorage.setItem('sync_queue', JSON.stringify(localQueue));
    setSyncQueue(localQueue);
  };

  const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  };

  const generateLocalId = (): string => {
    return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Initialiser la queue locale au chargement
  useEffect(() => {
    setSyncQueue(getLocalQueue());
  }, []);

  // Synchroniser automatiquement quand on revient en ligne
  useEffect(() => {
    if (isOnline && user) {
      syncPendingData();
    }
  }, [isOnline, user]);

  return {
    isOnline,
    syncQueue,
    isSyncing,
    addToSyncQueue,
    syncPendingData,
    pendingItemsCount: syncQueue.filter(item => !item.synced).length
  };
};