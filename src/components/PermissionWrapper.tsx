import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PermissionWrapperProps {
  children: React.ReactNode;
  requiredPermission: 'create' | 'edit' | 'delete' | 'manageUsers' | 'viewFinancials';
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

export const PermissionWrapper = ({ 
  children, 
  requiredPermission, 
  fallback,
  showMessage = true 
}: PermissionWrapperProps) => {
  const permissions = usePermissions();

  if (permissions.loading) {
    return <div className="animate-pulse bg-muted h-8 w-24 rounded"></div>;
  }

  let hasPermission = false;

  switch (requiredPermission) {
    case 'create':
      hasPermission = permissions.canCreate;
      break;
    case 'edit':
      hasPermission = permissions.canEdit;
      break;
    case 'delete':
      hasPermission = permissions.canDelete;
      break;
    case 'manageUsers':
      hasPermission = permissions.canManageUsers;
      break;
    case 'viewFinancials':
      hasPermission = permissions.canViewFinancials;
      break;
    default:
      hasPermission = false;
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    if (showMessage) {
      return (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vous n'avez pas les permissions nécessaires pour effectuer cette action.
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  }

  return <>{children}</>;
};