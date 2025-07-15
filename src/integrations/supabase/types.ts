export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          actions_recommandees: string[] | null
          cage_id: string | null
          created_at: string
          date_alerte: string
          date_resolution: string | null
          id: string
          lu: boolean | null
          message: string
          priorite: string
          source_id: string | null
          titre: string
          type_alerte: string
          user_id: string
        }
        Insert: {
          actions_recommandees?: string[] | null
          cage_id?: string | null
          created_at?: string
          date_alerte?: string
          date_resolution?: string | null
          id?: string
          lu?: boolean | null
          message: string
          priorite?: string
          source_id?: string | null
          titre: string
          type_alerte: string
          user_id: string
        }
        Update: {
          actions_recommandees?: string[] | null
          cage_id?: string | null
          created_at?: string
          date_alerte?: string
          date_resolution?: string | null
          id?: string
          lu?: boolean | null
          message?: string
          priorite?: string
          source_id?: string | null
          titre?: string
          type_alerte?: string
          user_id?: string
        }
        Relationships: []
      }
      analytics_predictions: {
        Row: {
          cage_id: string | null
          created_at: string
          date_prediction: string
          horizon_jours: number
          id: string
          intervalle_confiance: number | null
          parametres_entree: Json | null
          precision_reelle: number | null
          statut: string
          type_prediction: string
          user_id: string
          valeur_predite: number
        }
        Insert: {
          cage_id?: string | null
          created_at?: string
          date_prediction?: string
          horizon_jours: number
          id?: string
          intervalle_confiance?: number | null
          parametres_entree?: Json | null
          precision_reelle?: number | null
          statut?: string
          type_prediction: string
          user_id: string
          valeur_predite: number
        }
        Update: {
          cage_id?: string | null
          created_at?: string
          date_prediction?: string
          horizon_jours?: number
          id?: string
          intervalle_confiance?: number | null
          parametres_entree?: Json | null
          precision_reelle?: number | null
          statut?: string
          type_prediction?: string
          user_id?: string
          valeur_predite?: number
        }
        Relationships: []
      }
      budgets: {
        Row: {
          budget_aliments: number | null
          budget_equipements: number | null
          budget_maintenance: number | null
          budget_medicaments: number | null
          budget_personnel: number | null
          created_at: string
          id: string
          nom_budget: string
          objectif_chiffre_affaires: number | null
          objectif_marge: number | null
          periode_debut: string
          periode_fin: string
          reel_aliments: number | null
          reel_chiffre_affaires: number | null
          reel_equipements: number | null
          reel_maintenance: number | null
          reel_medicaments: number | null
          reel_personnel: number | null
          statut: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_aliments?: number | null
          budget_equipements?: number | null
          budget_maintenance?: number | null
          budget_medicaments?: number | null
          budget_personnel?: number | null
          created_at?: string
          id?: string
          nom_budget: string
          objectif_chiffre_affaires?: number | null
          objectif_marge?: number | null
          periode_debut: string
          periode_fin: string
          reel_aliments?: number | null
          reel_chiffre_affaires?: number | null
          reel_equipements?: number | null
          reel_maintenance?: number | null
          reel_medicaments?: number | null
          reel_personnel?: number | null
          statut?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_aliments?: number | null
          budget_equipements?: number | null
          budget_maintenance?: number | null
          budget_medicaments?: number | null
          budget_personnel?: number | null
          created_at?: string
          id?: string
          nom_budget?: string
          objectif_chiffre_affaires?: number | null
          objectif_marge?: number | null
          periode_debut?: string
          periode_fin?: string
          reel_aliments?: number | null
          reel_chiffre_affaires?: number | null
          reel_equipements?: number | null
          reel_maintenance?: number | null
          reel_medicaments?: number | null
          reel_personnel?: number | null
          statut?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cage_history: {
        Row: {
          cage_id: string
          change_type: string
          created_at: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          user_id: string
        }
        Insert: {
          cage_id: string
          change_type?: string
          created_at?: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id: string
        }
        Update: {
          cage_id?: string
          change_type?: string
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cage_history_cage_id_fkey"
            columns: ["cage_id"]
            isOneToOne: false
            referencedRelation: "cages"
            referencedColumns: ["id"]
          },
        ]
      }
      cages: {
        Row: {
          created_at: string
          croissance: string | null
          date_introduction: string | null
          espece: string
          fcr: number | null
          id: string
          nom: string
          nombre_poissons: number
          notes: string | null
          poids_moyen: number | null
          statut: string
          taux_mortalite: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          croissance?: string | null
          date_introduction?: string | null
          espece: string
          fcr?: number | null
          id?: string
          nom: string
          nombre_poissons?: number
          notes?: string | null
          poids_moyen?: number | null
          statut?: string
          taux_mortalite?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          croissance?: string | null
          date_introduction?: string | null
          espece?: string
          fcr?: number | null
          id?: string
          nom?: string
          nombre_poissons?: number
          notes?: string | null
          poids_moyen?: number | null
          statut?: string
          taux_mortalite?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          adresse: string | null
          chiffre_affaires_annuel: number | null
          contact_principal: string | null
          created_at: string
          derniere_commande: string | null
          email: string | null
          id: string
          nom_entreprise: string
          notes: string | null
          statut: string
          telephone: string | null
          type_client: string
          updated_at: string
          user_id: string
        }
        Insert: {
          adresse?: string | null
          chiffre_affaires_annuel?: number | null
          contact_principal?: string | null
          created_at?: string
          derniere_commande?: string | null
          email?: string | null
          id?: string
          nom_entreprise: string
          notes?: string | null
          statut?: string
          telephone?: string | null
          type_client?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          adresse?: string | null
          chiffre_affaires_annuel?: number | null
          contact_principal?: string | null
          created_at?: string
          derniere_commande?: string | null
          email?: string | null
          id?: string
          nom_entreprise?: string
          notes?: string | null
          statut?: string
          telephone?: string | null
          type_client?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feeding_sessions: {
        Row: {
          appetit: string
          cage_id: string
          created_at: string
          date_alimentation: string
          heure: string
          id: string
          observations: string | null
          quantite: number
          type_aliment: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appetit: string
          cage_id: string
          created_at?: string
          date_alimentation?: string
          heure: string
          id?: string
          observations?: string | null
          quantite: number
          type_aliment: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appetit?: string
          cage_id?: string
          created_at?: string
          date_alimentation?: string
          heure?: string
          id?: string
          observations?: string | null
          quantite?: number
          type_aliment?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feeding_sessions_cage_id_fkey"
            columns: ["cage_id"]
            isOneToOne: false
            referencedRelation: "cages"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_data: {
        Row: {
          cage_id: string | null
          categorie: string
          created_at: string
          date_transaction: string
          description: string | null
          id: string
          montant: number
          reference_document: string | null
          type_transaction: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cage_id?: string | null
          categorie: string
          created_at?: string
          date_transaction?: string
          description?: string | null
          id?: string
          montant: number
          reference_document?: string | null
          type_transaction: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cage_id?: string | null
          categorie?: string
          created_at?: string
          date_transaction?: string
          description?: string | null
          id?: string
          montant?: number
          reference_document?: string | null
          type_transaction?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fish_lots: {
        Row: {
          cage_id: string
          certifications: string[] | null
          created_at: string
          date_introduction: string
          espece: string
          historique_alimentation: Json | null
          historique_traitements: Json | null
          id: string
          nombre_initial: number
          numero_lot: string
          origine: string
          qr_code: string | null
          souche: string | null
          statut: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cage_id: string
          certifications?: string[] | null
          created_at?: string
          date_introduction: string
          espece: string
          historique_alimentation?: Json | null
          historique_traitements?: Json | null
          id?: string
          nombre_initial: number
          numero_lot: string
          origine: string
          qr_code?: string | null
          souche?: string | null
          statut?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cage_id?: string
          certifications?: string[] | null
          created_at?: string
          date_introduction?: string
          espece?: string
          historique_alimentation?: Json | null
          historique_traitements?: Json | null
          id?: string
          nombre_initial?: number
          numero_lot?: string
          origine?: string
          qr_code?: string | null
          souche?: string | null
          statut?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_observations: {
        Row: {
          cage_id: string
          cause_presumee: string | null
          created_at: string
          date_observation: string
          id: string
          mortalite: number
          observations: string
          statut: string
          traitements: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cage_id: string
          cause_presumee?: string | null
          created_at?: string
          date_observation?: string
          id?: string
          mortalite?: number
          observations: string
          statut?: string
          traitements?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cage_id?: string
          cause_presumee?: string | null
          created_at?: string
          date_observation?: string
          id?: string
          mortalite?: number
          observations?: string
          statut?: string
          traitements?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_observations_cage_id_fkey"
            columns: ["cage_id"]
            isOneToOne: false
            referencedRelation: "cages"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          categorie: string
          created_at: string
          date_expiration: string | null
          fournisseur: string | null
          id: string
          nom: string
          notes: string | null
          prix_unitaire: number
          statut: string
          stock_actuel: number
          stock_min: number
          unite: string
          updated_at: string
          user_id: string
        }
        Insert: {
          categorie: string
          created_at?: string
          date_expiration?: string | null
          fournisseur?: string | null
          id?: string
          nom: string
          notes?: string | null
          prix_unitaire: number
          statut?: string
          stock_actuel?: number
          stock_min: number
          unite: string
          updated_at?: string
          user_id: string
        }
        Update: {
          categorie?: string
          created_at?: string
          date_expiration?: string | null
          fournisseur?: string | null
          id?: string
          nom?: string
          notes?: string | null
          prix_unitaire?: number
          statut?: string
          stock_actuel?: number
          stock_min?: number
          unite?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          client_id: string
          created_at: string
          date_commande: string
          date_livraison_prevue: string | null
          date_livraison_reelle: string | null
          id: string
          montant_total: number
          notes: string | null
          numero_commande: string
          prix_kg: number
          quantite_kg: number
          statut: string
          type_poisson: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          date_commande?: string
          date_livraison_prevue?: string | null
          date_livraison_reelle?: string | null
          id?: string
          montant_total: number
          notes?: string | null
          numero_commande: string
          prix_kg: number
          quantite_kg: number
          statut?: string
          type_poisson: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          date_commande?: string
          date_livraison_prevue?: string | null
          date_livraison_reelle?: string | null
          id?: string
          montant_total?: number
          notes?: string | null
          numero_commande?: string
          prix_kg?: number
          quantite_kg?: number
          statut?: string
          type_poisson?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      production_cycles: {
        Row: {
          cage_id: string
          cout_total: number | null
          created_at: string
          croissance_reelle: number | null
          date_debut: string
          date_fin_prevue: string
          date_fin_reelle: string | null
          id: string
          marge_beneficiaire: number | null
          nom_cycle: string
          nombre_poissons_final: number | null
          nombre_poissons_initial: number
          notes: string | null
          objectif_croissance: number | null
          poids_final_moyen: number | null
          poids_initial_moyen: number | null
          revenu_total: number | null
          statut: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cage_id: string
          cout_total?: number | null
          created_at?: string
          croissance_reelle?: number | null
          date_debut: string
          date_fin_prevue: string
          date_fin_reelle?: string | null
          id?: string
          marge_beneficiaire?: number | null
          nom_cycle: string
          nombre_poissons_final?: number | null
          nombre_poissons_initial: number
          notes?: string | null
          objectif_croissance?: number | null
          poids_final_moyen?: number | null
          poids_initial_moyen?: number | null
          revenu_total?: number | null
          statut?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cage_id?: string
          cout_total?: number | null
          created_at?: string
          croissance_reelle?: number | null
          date_debut?: string
          date_fin_prevue?: string
          date_fin_reelle?: string | null
          id?: string
          marge_beneficiaire?: number | null
          nom_cycle?: string
          nombre_poissons_final?: number | null
          nombre_poissons_initial?: number
          notes?: string | null
          objectif_croissance?: number | null
          poids_final_moyen?: number | null
          poids_initial_moyen?: number | null
          revenu_total?: number | null
          statut?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          cage_id: string
          client: string
          created_at: string
          date_vente: string
          id: string
          notes: string | null
          prix_par_kg: number
          prix_total: number
          quantite_kg: number
          type_vente: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cage_id: string
          client: string
          created_at?: string
          date_vente?: string
          id?: string
          notes?: string | null
          prix_par_kg: number
          prix_total: number
          quantite_kg: number
          type_vente: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cage_id?: string
          client?: string
          created_at?: string
          date_vente?: string
          id?: string
          notes?: string | null
          prix_par_kg?: number
          prix_total?: number
          quantite_kg?: number
          type_vente?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_cage_id_fkey"
            columns: ["cage_id"]
            isOneToOne: false
            referencedRelation: "cages"
            referencedColumns: ["id"]
          },
        ]
      }
      water_quality: {
        Row: {
          cage_id: string
          created_at: string
          date_mesure: string
          heure: string
          id: string
          observations: string | null
          oxygene_dissous: number
          ph: number
          statut: string
          temperature: number
          turbidite: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cage_id: string
          created_at?: string
          date_mesure?: string
          heure: string
          id?: string
          observations?: string | null
          oxygene_dissous: number
          ph: number
          statut?: string
          temperature: number
          turbidite?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cage_id?: string
          created_at?: string
          date_mesure?: string
          heure?: string
          id?: string
          observations?: string | null
          oxygene_dissous?: number
          ph?: number
          statut?: string
          temperature?: number
          turbidite?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "water_quality_cage_id_fkey"
            columns: ["cage_id"]
            isOneToOne: false
            referencedRelation: "cages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_cage_fcr: {
        Args: { cage_id_param: string }
        Returns: number
      }
      calculate_cage_growth_rate: {
        Args: { cage_id_param: string }
        Returns: number
      }
      calculate_cage_mortality_rate: {
        Args: { cage_id_param: string }
        Returns: number
      }
      calculate_cycle_profitability: {
        Args: { cycle_id: string }
        Returns: number
      }
      generate_automatic_alerts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_cage_daily_history: {
        Args: { cage_id_param: string; date_debut?: string; date_fin?: string }
        Returns: {
          date_activite: string
          alimentation: Json
          qualite_eau: Json
          sante: Json
          ventes: Json
          finance: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
