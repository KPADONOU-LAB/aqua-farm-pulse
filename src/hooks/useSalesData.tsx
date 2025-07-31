import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Sale {
  id: string;
  date_vente: string;
  cage_id: string;
  client: string;
  quantite_kg: number;
  prix_par_kg: number;
  prix_total: number;
  type_vente: string;
  notes?: string;
  cage?: {
    nom: string;
    espece: string;
  };
}

export const useSalesData = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSales = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          cage:cages(nom, espece)
        `)
        .eq('user_id', user.id)
        .order('date_vente', { ascending: false });

      if (error) throw error;

      setSales(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [user]);

  // Fonction pour générer une facture avec devise configurée
  const generateInvoice = async (sale: Sale) => {
    // Récupérer les paramètres de ferme pour la devise
    const { data: farmSettings } = await supabase
      .from('farm_settings')
      .select('currency, farm_name')
      .eq('user_id', user?.id)
      .single();

    const currency = farmSettings?.currency || 'eur';
    const farmName = farmSettings?.farm_name || 'AquaCulture Pro';
    
    const getCurrencySymbol = (curr: string) => {
      switch (curr) {
        case 'eur': return '€';
        case 'usd': return '$';
        case 'mad': return 'DH';
        case 'cfa': return 'CFA';
        default: return '€';
      }
    };

    const symbol = getCurrencySymbol(currency);
    
    const invoiceWindow = window.open('', '_blank');
    
    if (!invoiceWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture - ${sale.client}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company { font-size: 24px; font-weight: bold; color: #0ea5e9; }
          .invoice-details { margin: 30px 0; }
          .customer { margin: 20px 0; }
          .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .table th { background-color: #f5f5f5; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin: 20px 0; }
          .footer { margin-top: 40px; text-align: center; color: #666; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company">${farmName}</div>
          <p>Gestion d'aquaculture professionnelle</p>
        </div>
        
        <div class="invoice-details">
          <h2>FACTURE</h2>
          <p><strong>Date:</strong> ${new Date(sale.date_vente).toLocaleDateString('fr-FR')}</p>
          <p><strong>N° Facture:</strong> ${sale.id.substring(0, 8).toUpperCase()}</p>
        </div>
        
        <div class="customer">
          <h3>Client:</h3>
          <p><strong>${sale.client}</strong></p>
        </div>
        
        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Provenance</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${sale.cage?.espece || 'Poisson'}</td>
              <td>${sale.cage?.nom || 'N/A'}</td>
              <td>${sale.quantite_kg} kg</td>
              <td>${symbol}${sale.prix_par_kg.toFixed(2)}/kg</td>
              <td>${symbol}${sale.prix_total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="total">
          <p>Total à payer: <strong>${symbol}${sale.prix_total.toFixed(2)}</strong></p>
        </div>
        
        ${sale.notes ? `<div><strong>Notes:</strong> ${sale.notes}</div>` : ''}
        
        <div class="footer">
          <p>Merci pour votre confiance !</p>
        </div>
        
        <script>
          window.print();
          window.onafterprint = function() { window.close(); }
        </script>
      </body>
      </html>
    `;
    
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
  };

  return {
    sales,
    loading,
    error,
    refreshSales: fetchSales,
    generateInvoice
  };
};