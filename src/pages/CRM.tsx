import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useCRMData } from "@/hooks/useCRMData";
import { NewClientModal } from "@/components/modals/NewClientModal";
import { NewOrderModal } from "@/components/modals/NewOrderModal";
import { EditClientStatusModal } from "@/components/modals/EditClientStatusModal";
import { EditClientModal } from "@/components/modals/EditClientModal";
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Phone, 
  Mail,
  Calendar,
  Search,
  Filter,
  Star,
  Edit
} from "lucide-react";

const CRM = () => {
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { 
    clients, 
    orders, 
    crmStats, 
    loading, 
    refreshData 
  } = useCRMData();

  const handleNewClient = () => {
    setShowNewClientModal(false);
    refreshData();
  };

  const handleNewOrder = () => {
    setShowNewOrderModal(false);
    refreshData();
  };

  const handleEditStatus = (client: any) => {
    setSelectedClient(client);
    setShowEditStatusModal(true);
  };

  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    setShowEditClientModal(true);
  };

  const handleStatusUpdated = () => {
    setShowEditStatusModal(false);
    setSelectedClient(null);
    refreshData();
  };

  const handleClientUpdated = () => {
    setShowEditClientModal(false);
    setSelectedClient(null);
    refreshData();
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.nom_entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contact_principal?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || client.statut === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'default';
      case 'prospect': return 'secondary';
      case 'inactif': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeClientIcon = (type: string) => {
    switch (type) {
      case 'premium': return <Star className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion Client (CRM)</h1>
          <p className="text-muted-foreground">
            Gérez vos relations clients et commandes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewOrderModal(true)} variant="outline">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Nouvelle Commande
          </Button>
          <Button onClick={() => setShowNewClientModal(true)}>
            <Users className="w-4 h-4 mr-2" />
            Nouveau Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {crmStats.totalClients}
            </div>
            <div className="flex items-center justify-center mt-2">
              <Badge variant="secondary">
                {crmStats.activeClients} actifs
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes du Mois</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {crmStats.monthlyOrders}
            </div>
            <div className="flex items-center justify-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">
                +{crmStats.ordersGrowth.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CA Mensuel</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {crmStats.monthlyRevenue.toLocaleString('fr-FR')} €
            </div>
            <div className="flex items-center justify-center mt-2">
              <span className="text-sm text-muted-foreground">
                Moy. par commande: {crmStats.averageOrderValue.toLocaleString('fr-FR')} €
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Fidélité</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-center">
              {crmStats.clientRetentionRate.toFixed(1)}%
            </div>
            <div className="flex items-center justify-center mt-2">
              <Badge variant={crmStats.clientRetentionRate >= 80 ? "default" : "secondary"}>
                {crmStats.clientRetentionRate >= 80 ? "Excellent" : "À améliorer"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="commandes">Commandes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="prospect">Prospect</option>
              <option value="inactif">Inactif</option>
            </select>
          </div>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {client.nom_entreprise}
                      {getTypeClientIcon(client.type_client)}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getStatusColor(client.statut)}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => handleEditStatus(client)}
                      >
                        {client.statut}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClient(client)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {client.contact_principal}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {client.email}
                    </div>
                  )}
                  {client.telephone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {client.telephone}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">CA annuel:</span>
                    <span className="font-medium">
                      {client.chiffre_affaires_annuel.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                  {client.derniere_commande && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Dernière commande: {new Date(client.derniere_commande).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Contacter
                    </Button>
                    <Button size="sm" className="flex-1">
                      Nouvelle Commande
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="commandes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commandes Récentes</CardTitle>
              <CardDescription>
                Suivi des commandes et livraisons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">#{order.numero_commande}</span>
                        <Badge variant={
                          order.statut === 'livree' ? 'default' :
                          order.statut === 'en_preparation' ? 'secondary' :
                          order.statut === 'confirmee' ? 'outline' : 'destructive'
                        }>
                          {order.statut.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.client?.nom_entreprise} • {order.quantite_kg}kg {order.type_poisson}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Commandé le {new Date(order.date_commande).toLocaleDateString('fr-FR')}
                        {order.date_livraison_prevue && 
                          ` • Livraison prévue le ${new Date(order.date_livraison_prevue).toLocaleDateString('fr-FR')}`
                        }
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {order.montant_total.toLocaleString('fr-FR')} €
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.prix_kg.toLocaleString('fr-FR')} €/kg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Clients</CardTitle>
                <CardDescription>Par chiffre d'affaires annuel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients
                    .sort((a, b) => b.chiffre_affaires_annuel - a.chiffre_affaires_annuel)
                    .slice(0, 5)
                    .map((client, index) => (
                      <div key={client.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground">
                            #{index + 1}
                          </span>
                          <span className="font-medium">{client.nom_entreprise}</span>
                        </div>
                        <span className="font-bold">
                          {client.chiffre_affaires_annuel.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par Type</CardTitle>
                <CardDescription>Distribution des clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clients Premium</span>
                    <span className="font-medium">
                      {clients.filter(c => c.type_client === 'premium').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clients Standard</span>
                    <span className="font-medium">
                      {clients.filter(c => c.type_client === 'standard').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clients Occasionnels</span>
                    <span className="font-medium">
                      {clients.filter(c => c.type_client === 'occasional').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <NewClientModal
        open={showNewClientModal}
        onOpenChange={setShowNewClientModal}
        onSuccess={handleNewClient}
      />
      
      <NewOrderModal
        open={showNewOrderModal}
        onOpenChange={setShowNewOrderModal}
        onSuccess={handleNewOrder}
      />
      
      <EditClientStatusModal
        open={showEditStatusModal}
        onOpenChange={setShowEditStatusModal}
        onSuccess={handleStatusUpdated}
        client={selectedClient}
      />

      <EditClientModal
        open={showEditClientModal}
        onOpenChange={setShowEditClientModal}
        onSuccess={handleClientUpdated}
        client={selectedClient}
      />
    </div>
  );
};

export default CRM;