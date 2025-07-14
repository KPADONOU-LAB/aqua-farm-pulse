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
      [_ in never]: never
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
