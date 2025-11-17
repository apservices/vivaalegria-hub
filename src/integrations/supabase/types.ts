export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      eventos: {
        Row: {
          cliente: string
          created_at: string
          data_evento: string
          formulario_origem: string | null
          id: string
          jotform_submission_id: string | null
          nome: string
          observacoes: string | null
          status: Database["public"]["Enums"]["evento_status"]
          tipo_evento: Database["public"]["Enums"]["tipo_evento"]
          updated_at: string
        }
        Insert: {
          cliente: string
          created_at?: string
          data_evento: string
          formulario_origem?: string | null
          id?: string
          jotform_submission_id?: string | null
          nome: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["evento_status"]
          tipo_evento?: Database["public"]["Enums"]["tipo_evento"]
          updated_at?: string
        }
        Update: {
          cliente?: string
          created_at?: string
          data_evento?: string
          formulario_origem?: string | null
          id?: string
          jotform_submission_id?: string | null
          nome?: string
          observacoes?: string | null
          status?: Database["public"]["Enums"]["evento_status"]
          tipo_evento?: Database["public"]["Enums"]["tipo_evento"]
          updated_at?: string
        }
        Relationships: []
      }
      eventos_profissionais: {
        Row: {
          created_at: string
          evento_id: string
          id: string
          profissional_id: string
          status_pagamento: Database["public"]["Enums"]["pagamento_status"]
          valor_acordado: number
          valor_pago: number
        }
        Insert: {
          created_at?: string
          evento_id: string
          id?: string
          profissional_id: string
          status_pagamento?: Database["public"]["Enums"]["pagamento_status"]
          valor_acordado: number
          valor_pago?: number
        }
        Update: {
          created_at?: string
          evento_id?: string
          id?: string
          profissional_id?: string
          status_pagamento?: Database["public"]["Enums"]["pagamento_status"]
          valor_acordado?: number
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "eventos_profissionais_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_profissionais_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          created_at: string
          data_pagamento: string
          id: string
          jotform_submission_id: string | null
          metodo_pagamento: string | null
          observacoes: string | null
          updated_at: string
          valor: number
          venda_id: string | null
        }
        Insert: {
          created_at?: string
          data_pagamento: string
          id?: string
          jotform_submission_id?: string | null
          metodo_pagamento?: string | null
          observacoes?: string | null
          updated_at?: string
          valor: number
          venda_id?: string | null
        }
        Update: {
          created_at?: string
          data_pagamento?: string
          id?: string
          jotform_submission_id?: string | null
          metodo_pagamento?: string | null
          observacoes?: string | null
          updated_at?: string
          valor?: number
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      profissionais: {
        Row: {
          ativo: boolean
          created_at: string
          email: string | null
          funcao: string
          id: string
          jotform_submission_id: string | null
          nome: string
          telefone: string | null
          updated_at: string
          valor_padrao: number | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          funcao: string
          id?: string
          jotform_submission_id?: string | null
          nome: string
          telefone?: string | null
          updated_at?: string
          valor_padrao?: number | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string | null
          funcao?: string
          id?: string
          jotform_submission_id?: string | null
          nome?: string
          telefone?: string | null
          updated_at?: string
          valor_padrao?: number | null
        }
        Relationships: []
      }
      satisfacao: {
        Row: {
          comentario: string | null
          created_at: string
          data_avaliacao: string
          evento_id: string | null
          id: string
          jotform_submission_id: string | null
          nota: number
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          data_avaliacao?: string
          evento_id?: string | null
          id?: string
          jotform_submission_id?: string | null
          nota: number
        }
        Update: {
          comentario?: string | null
          created_at?: string
          data_avaliacao?: string
          evento_id?: string | null
          id?: string
          jotform_submission_id?: string | null
          nota?: number
        }
        Relationships: [
          {
            foreignKeyName: "satisfacao_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          created_at: string
          data_venda: string
          evento_id: string | null
          id: string
          jotform_submission_id: string | null
          status_pagamento: Database["public"]["Enums"]["pagamento_status"]
          updated_at: string
          valor_recebido: number
          valor_total: number
        }
        Insert: {
          created_at?: string
          data_venda?: string
          evento_id?: string | null
          id?: string
          jotform_submission_id?: string | null
          status_pagamento?: Database["public"]["Enums"]["pagamento_status"]
          updated_at?: string
          valor_recebido?: number
          valor_total?: number
        }
        Update: {
          created_at?: string
          data_venda?: string
          evento_id?: string | null
          id?: string
          jotform_submission_id?: string | null
          status_pagamento?: Database["public"]["Enums"]["pagamento_status"]
          updated_at?: string
          valor_recebido?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
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
      evento_status: "pendente" | "confirmado" | "realizado" | "cancelado"
      pagamento_status: "pendente" | "parcial" | "pago" | "atrasado"
      tipo_evento:
        | "casamento"
        | "aniversario"
        | "corporativo"
        | "formatura"
        | "outro"
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
    Enums: {
      evento_status: ["pendente", "confirmado", "realizado", "cancelado"],
      pagamento_status: ["pendente", "parcial", "pago", "atrasado"],
      tipo_evento: [
        "casamento",
        "aniversario",
        "corporativo",
        "formatura",
        "outro",
      ],
    },
  },
} as const
