import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Users, Mail, UserPlus, Shield, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles?: {
    email: string;
  } | null;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

const UserManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    role: 'technicien' as string
  });

  const roleOptions = [
    { value: 'promoteur', label: 'Promoteur', description: 'Propriétaire de la ferme, accès complet' },
    { value: 'gestionnaire', label: 'Gestionnaire', description: 'Gestion complète des opérations' },
    { value: 'superviseur', label: 'Superviseur', description: 'Supervision et contrôle' },
    { value: 'technicien', label: 'Technicien', description: 'Exécution des tâches quotidiennes' },
    { value: 'viewer', label: 'Observateur', description: 'Lecture seule' }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'promoteur': return 'bg-purple-100 text-purple-800';
      case 'gestionnaire': return 'bg-blue-100 text-blue-800';
      case 'superviseur': return 'bg-green-100 text-green-800';
      case 'technicien': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    if (user) {
      loadUserRoles();
      loadInvitations();
    }
  }, [user]);

  const loadUserRoles = async () => {
    try {
      // Récupérer les rôles d'abord
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('farm_owner_id', user?.id);

      if (rolesError) throw rolesError;

      // Puis récupérer les profils pour chaque utilisateur
      const rolesWithProfiles = await Promise.all(
        (rolesData || []).map(async (role) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('user_id', role.user_id)
            .single();

          return {
            ...role,
            profiles: profileError ? null : profileData
          };
        })
      );

      setUserRoles(rolesWithProfiles);
    } catch (error) {
      console.error('Error loading user roles:', error);
    }
  };

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('farm_invitations')
        .select('*')
        .eq('farm_owner_id', user?.id)
        .in('status', ['pending', 'sent']);

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const generateInvitationToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newInvitation.email || !newInvitation.role) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    // Vérifier si l'email existe déjà
    const existingRole = userRoles.find(ur => ur.profiles?.email === newInvitation.email);
    const existingInvitation = invitations.find(inv => inv.email === newInvitation.email && inv.status === 'pending');

    if (existingRole) {
      toast({
        title: "Erreur",
        description: "Cet utilisateur fait déjà partie de votre ferme",
        variant: "destructive"
      });
      return;
    }

    if (existingInvitation) {
      toast({
        title: "Erreur",
        description: "Une invitation est déjà en attente pour cet email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const token = generateInvitationToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

      const { error } = await supabase
        .from('farm_invitations')
        .insert({
          farm_owner_id: user?.id,
          email: newInvitation.email,
          role: newInvitation.role,
          token,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Invitation envoyée",
        description: `Une invitation a été envoyée à ${newInvitation.email}`,
      });

      setNewInvitation({ email: '', role: 'technicien' });
      loadInvitations();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi de l'invitation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeUserRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Utilisateur retiré",
        description: "L'utilisateur a été retiré de votre ferme",
      });

      loadUserRoles();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du retrait de l'utilisateur",
        variant: "destructive"
      });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('farm_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Invitation annulée",
        description: "L'invitation a été annulée",
      });

      loadInvitations();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'annulation de l'invitation",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gestion des utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Gérez les membres de votre équipe et leurs rôles
          </p>
        </div>
      </div>

      {/* Formulaire d'invitation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Inviter un nouvel utilisateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={sendInvitation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newInvitation.email}
                  onChange={(e) => setNewInvitation(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemple.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rôle *</Label>
                <Select value={newInvitation.role} onValueChange={(value) => 
                  setNewInvitation(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-muted-foreground">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Liste des utilisateurs actuels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Membres de l'équipe ({userRoles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRoles.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun membre dans votre équipe pour le moment
            </p>
          ) : (
            <div className="space-y-3">
              {userRoles.map((userRole) => (
                <div key={userRole.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{userRole.profiles?.email || 'Email non disponible'}</div>
                      <div className="text-sm text-muted-foreground">
                        Membre depuis le {new Date(userRole.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(userRole.role)}>
                      {roleOptions.find(r => r.value === userRole.role)?.label || userRole.role}
                    </Badge>
                    {userRole.user_id !== user?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Retirer cet utilisateur ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. L'utilisateur perdra l'accès à votre ferme.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeUserRole(userRole.id)}>
                              Retirer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invitations en attente */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invitations en attente ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-medium">{invitation.email}</div>
                      <div className="text-sm text-muted-foreground">
                        Invité le {new Date(invitation.created_at).toLocaleDateString('fr-FR')} • 
                        Expire le {new Date(invitation.expires_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(invitation.role)}>
                      {roleOptions.find(r => r.value === invitation.role)?.label || invitation.role}
                    </Badge>
                    <Badge variant="outline" className="text-orange-600">
                      En attente
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => cancelInvitation(invitation.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;