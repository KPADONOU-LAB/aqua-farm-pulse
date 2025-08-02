import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFarm } from '@/contexts/FarmContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  UserPlus, 
  Users, 
  Mail, 
  Trash2, 
  Edit, 
  Clock,
  CheckCircle,
  XCircle,
  Globe,
  UserCheck
} from 'lucide-react';

interface UserInvitation {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  preferred_language: string;
  status: string;
  expires_at: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  preferred_language: string | null;
  created_at: string;
}

const UserManagement = () => {
  const { translate } = useFarm();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'viewer' as string,
    preferred_language: 'en' as 'fr' | 'en'
  });

  const roleOptions = [
    { value: 'promoter', label: { fr: 'Promoteur', en: 'Promoter' } },
    { value: 'manager', label: { fr: 'Gestionnaire', en: 'Manager' } },
    { value: 'supervisor', label: { fr: 'Superviseur', en: 'Supervisor' } },
    { value: 'technician', label: { fr: 'Technicien', en: 'Technician' } },
    { value: 'viewer', label: { fr: 'Observateur', en: 'Viewer' } }
  ];

  useEffect(() => {
    loadInvitations();
    loadUserRoles();
  }, []);

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const loadUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error loading user roles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.first_name || !formData.last_name || !user) {
      toast({
        title: translate('error'),
        description: translate('fill_required_fields'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Generate invitation token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invitation_token');

      if (tokenError) throw tokenError;

      // Create invitation
      const { error: inviteError } = await supabase
        .from('user_invitations')
        .insert({
          farm_owner_id: user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          preferred_language: formData.preferred_language,
          invitation_token: tokenData
        });

      if (inviteError) throw inviteError;

      toast({
        title: translate('success'),
        description: "Invitation envoyée avec succès",
      });

      // Reset form and reload
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        role: 'viewer',
        preferred_language: 'en'
      });
      loadInvitations();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: translate('error'),
        description: "Erreur lors de l'envoi de l'invitation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: translate('success'),
        description: "Invitation supprimée",
      });
      loadInvitations();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast({
        title: translate('error'),
        description: "Erreur lors de la suppression",
        variant: "destructive"
      });
    }
  };

  const deleteUserRole = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: translate('success'),
        description: "Utilisateur supprimé",
      });
      loadUserRoles();
    } catch (error) {
      console.error('Error deleting user role:', error);
      toast({
        title: translate('error'),
        description: "Erreur lors de la suppression",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <UserPlus className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">Invitez et gérez les utilisateurs de votre ferme</p>
        </div>
      </div>

      {/* Formulaire d'invitation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Inviter un nouvel utilisateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="Prénom"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Nom *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Nom de famille"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="utilisateur@exemple.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select value={formData.role} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label.fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_language" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Langue préférée
              </Label>
              <Select value={formData.preferred_language} onValueChange={(value: 'fr' | 'en') => 
                setFormData(prev => ({ ...prev, preferred_language: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Liste des invitations en attente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Invitations en attente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucune invitation en cours
            </p>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(invitation.status)}
                    <div>
                      <div className="font-medium">
                        {invitation.first_name} {invitation.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">{invitation.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {roleOptions.find(r => r.value === invitation.role)?.label.fr}
                        </Badge>
                        <Badge className={getStatusColor(invitation.status)}>
                          {invitation.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {invitation.preferred_language.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteInvitation(invitation.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des utilisateurs actifs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Utilisateurs actifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRoles.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun utilisateur actif
            </p>
          ) : (
            <div className="space-y-3">
              {userRoles.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCheck className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {roleOptions.find(r => r.value === user.role)?.label.fr}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {user.preferred_language?.toUpperCase() || 'EN'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {/* TODO: Edit user */}}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteUserRole(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;