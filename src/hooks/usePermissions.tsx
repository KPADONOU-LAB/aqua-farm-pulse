import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface UserRole {
  id: string;
  user_id: string;
  farm_owner_id: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserRole();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserRole = async () => {
    if (!user) return;

    try {
      // Vérifier si c'est le propriétaire de la ferme (créateur du compte)
      const { data: farmData, error: farmError } = await supabase
        .from('farm_settings')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (farmData && !farmError) {
        // C'est le propriétaire de la ferme - admin par défaut
        setUserRole({
          id: 'owner',
          user_id: user.id,
          farm_owner_id: user.id,
          role: 'admin'
        });
      } else {
        // Vérifier les rôles assignés
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (roleData && !roleError) {
          setUserRole(roleData);
        } else {
          // Aucun rôle trouvé - viewer par défaut
          setUserRole({
            id: 'default',
            user_id: user.id,
            farm_owner_id: '',
            role: 'viewer'
          });
        }
      }
    } catch (error) {
      console.error('Error loading user role:', error);
      // En cas d'erreur, défaut à viewer
      setUserRole({
        id: 'error',
        user_id: user?.id || '',
        farm_owner_id: '',
        role: 'viewer'
      });
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    return userRole?.role === 'admin' || userRole?.farm_owner_id === user?.id;
  };

  const isManager = () => {
    return userRole?.role === 'manager' || isAdmin();
  };

  const isTechnician = () => {
    return userRole?.role === 'technician' || isManager();
  };

  const canCreate = () => {
    return isManager(); // Seuls les managers et admins peuvent créer
  };

  const canEdit = () => {
    return isManager(); // Seuls les managers et admins peuvent modifier
  };

  const canDelete = () => {
    return isAdmin(); // Seuls les admins peuvent supprimer
  };

  const canManageUsers = () => {
    return isAdmin(); // Seuls les admins peuvent gérer les utilisateurs
  };

  const canViewFinancials = () => {
    return isManager(); // Seuls les managers et admins peuvent voir les finances
  };

  return {
    userRole,
    loading,
    isAdmin: isAdmin(),
    isManager: isManager(),
    isTechnician: isTechnician(),
    canCreate: canCreate(),
    canEdit: canEdit(),
    canDelete: canDelete(),
    canManageUsers: canManageUsers(),
    canViewFinancials: canViewFinancials(),
    refetch: loadUserRole
  };
};