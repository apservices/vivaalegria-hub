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
      controle_conferencia: {
        Row: {
          anexos: string | null
          caixa_organizada: string | null
          checklist_preenchido: string | null
          comentarios: string | null
          created_at: string | null
          data_conferencia: string | null
          evento_id: string | null
          houve_divergencia: string | null
          id: string
          id_montagem: string | null
          itens_ausentes: string | null
          itens_consumidos_totalmente: string | null
          marcador: string | null
          nome_avaliador: string | null
          submission_id: string | null
          uniforme_usado: string | null
          usou_baloes: string | null
          usou_pintura_facial: string | null
        }
        Insert: {
          anexos?: string | null
          caixa_organizada?: string | null
          checklist_preenchido?: string | null
          comentarios?: string | null
          created_at?: string | null
          data_conferencia?: string | null
          evento_id?: string | null
          houve_divergencia?: string | null
          id?: string
          id_montagem?: string | null
          itens_ausentes?: string | null
          itens_consumidos_totalmente?: string | null
          marcador?: string | null
          nome_avaliador?: string | null
          submission_id?: string | null
          uniforme_usado?: string | null
          usou_baloes?: string | null
          usou_pintura_facial?: string | null
        }
        Update: {
          anexos?: string | null
          caixa_organizada?: string | null
          checklist_preenchido?: string | null
          comentarios?: string | null
          created_at?: string | null
          data_conferencia?: string | null
          evento_id?: string | null
          houve_divergencia?: string | null
          id?: string
          id_montagem?: string | null
          itens_ausentes?: string | null
          itens_consumidos_totalmente?: string | null
          marcador?: string | null
          nome_avaliador?: string | null
          submission_id?: string | null
          uniforme_usado?: string | null
          usou_baloes?: string | null
          usou_pintura_facial?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "controle_conferencia_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          alertas_seguranca: string | null
          atividades_adicionais: string | null
          atividades_personalizadas: string | null
          cliente: string
          created_at: string
          data_evento: string
          data_ultima_atualizacao: string | null
          duracao_prevista: number | null
          endereco_evento: string | null
          endereco_igual_residencial: boolean | null
          faixa_etaria: string | null
          formulario_origem: string | null
          hora_inicio: string | null
          horas_contratadas: number | null
          id: string
          idade_aniversariante: number | null
          identificacao_unica: string | null
          informacoes_rotina_evento: string | null
          jotform_submission_id: string | null
          necessidades_especiais: string | null
          nome: string
          nome_aniversariante: string | null
          observacoes: string | null
          observacoes_cliente: string | null
          orientacoes_especiais: string | null
          pacote_visual: string | null
          permite_alimentacao_recreador: boolean | null
          qtd_criancas_prevista: number | null
          qtd_recreadores_contratados: number | null
          servicos_contratados: string | null
          status: Database["public"]["Enums"]["evento_status"]
          submission_ip: string | null
          tema: string | null
          tipo_evento: Database["public"]["Enums"]["tipo_evento"]
          tipo_local: string | null
          updated_at: string
        }
        Insert: {
          alertas_seguranca?: string | null
          atividades_adicionais?: string | null
          atividades_personalizadas?: string | null
          cliente: string
          created_at?: string
          data_evento: string
          data_ultima_atualizacao?: string | null
          duracao_prevista?: number | null
          endereco_evento?: string | null
          endereco_igual_residencial?: boolean | null
          faixa_etaria?: string | null
          formulario_origem?: string | null
          hora_inicio?: string | null
          horas_contratadas?: number | null
          id?: string
          idade_aniversariante?: number | null
          identificacao_unica?: string | null
          informacoes_rotina_evento?: string | null
          jotform_submission_id?: string | null
          necessidades_especiais?: string | null
          nome: string
          nome_aniversariante?: string | null
          observacoes?: string | null
          observacoes_cliente?: string | null
          orientacoes_especiais?: string | null
          pacote_visual?: string | null
          permite_alimentacao_recreador?: boolean | null
          qtd_criancas_prevista?: number | null
          qtd_recreadores_contratados?: number | null
          servicos_contratados?: string | null
          status?: Database["public"]["Enums"]["evento_status"]
          submission_ip?: string | null
          tema?: string | null
          tipo_evento?: Database["public"]["Enums"]["tipo_evento"]
          tipo_local?: string | null
          updated_at?: string
        }
        Update: {
          alertas_seguranca?: string | null
          atividades_adicionais?: string | null
          atividades_personalizadas?: string | null
          cliente?: string
          created_at?: string
          data_evento?: string
          data_ultima_atualizacao?: string | null
          duracao_prevista?: number | null
          endereco_evento?: string | null
          endereco_igual_residencial?: boolean | null
          faixa_etaria?: string | null
          formulario_origem?: string | null
          hora_inicio?: string | null
          horas_contratadas?: number | null
          id?: string
          idade_aniversariante?: number | null
          identificacao_unica?: string | null
          informacoes_rotina_evento?: string | null
          jotform_submission_id?: string | null
          necessidades_especiais?: string | null
          nome?: string
          nome_aniversariante?: string | null
          observacoes?: string | null
          observacoes_cliente?: string | null
          orientacoes_especiais?: string | null
          pacote_visual?: string | null
          permite_alimentacao_recreador?: boolean | null
          qtd_criancas_prevista?: number | null
          qtd_recreadores_contratados?: number | null
          servicos_contratados?: string | null
          status?: Database["public"]["Enums"]["evento_status"]
          submission_ip?: string | null
          tema?: string | null
          tipo_evento?: Database["public"]["Enums"]["tipo_evento"]
          tipo_local?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      eventos_profissionais: {
        Row: {
          created_at: string
          evento_id: string
          id: string
          nota_adaptacao: number | null
          nota_comunicacao: number | null
          nota_higiene: number | null
          nota_interacao_criancas: number | null
          nota_seguranca: number | null
          origem_avaliacao: string | null
          profissional_id: string
          profissional_nome: string | null
          status_pagamento: Database["public"]["Enums"]["pagamento_status"]
          valor_acordado: number
          valor_pago: number
        }
        Insert: {
          created_at?: string
          evento_id: string
          id?: string
          nota_adaptacao?: number | null
          nota_comunicacao?: number | null
          nota_higiene?: number | null
          nota_interacao_criancas?: number | null
          nota_seguranca?: number | null
          origem_avaliacao?: string | null
          profissional_id: string
          profissional_nome?: string | null
          status_pagamento?: Database["public"]["Enums"]["pagamento_status"]
          valor_acordado: number
          valor_pago?: number
        }
        Update: {
          created_at?: string
          evento_id?: string
          id?: string
          nota_adaptacao?: number | null
          nota_comunicacao?: number | null
          nota_higiene?: number | null
          nota_interacao_criancas?: number | null
          nota_seguranca?: number | null
          origem_avaliacao?: string | null
          profissional_id?: string
          profissional_nome?: string | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profissionais: {
        Row: {
          apelido: string | null
          ativo: boolean
          case_sucesso: string | null
          chave_pix: string | null
          chave_pix_confirmada: string | null
          cpf: string | null
          created_at: string
          cursos_especializacoes: string | null
          data_cadastro: string | null
          data_nascimento: string | null
          data_ultima_atualizacao: string | null
          email: string | null
          endereco: string | null
          faixa_etaria_experiencia: string | null
          flow_status: string | null
          formacao_academica: string | null
          frequencia_desejada: string | null
          funcao: string
          habilidades: Json | null
          id: string
          identificacao_registro: string | null
          interesse_mais_eventos: string | null
          interesse_pacotes_mensais: string | null
          interesses_curto_longo_prazo: string | null
          jotform_submission_id: string | null
          meio_transporte: string | null
          motivacao: string | null
          nome: string
          possui_cnpj: string | null
          referencias_profissionais: string | null
          submission_ip: string | null
          telefone: string | null
          tempo_experiencia: string | null
          uniforme_calca: string | null
          uniforme_camiseta: string | null
          uniforme_macacao: string | null
          updated_at: string
          valor_padrao: number | null
        }
        Insert: {
          apelido?: string | null
          ativo?: boolean
          case_sucesso?: string | null
          chave_pix?: string | null
          chave_pix_confirmada?: string | null
          cpf?: string | null
          created_at?: string
          cursos_especializacoes?: string | null
          data_cadastro?: string | null
          data_nascimento?: string | null
          data_ultima_atualizacao?: string | null
          email?: string | null
          endereco?: string | null
          faixa_etaria_experiencia?: string | null
          flow_status?: string | null
          formacao_academica?: string | null
          frequencia_desejada?: string | null
          funcao: string
          habilidades?: Json | null
          id?: string
          identificacao_registro?: string | null
          interesse_mais_eventos?: string | null
          interesse_pacotes_mensais?: string | null
          interesses_curto_longo_prazo?: string | null
          jotform_submission_id?: string | null
          meio_transporte?: string | null
          motivacao?: string | null
          nome: string
          possui_cnpj?: string | null
          referencias_profissionais?: string | null
          submission_ip?: string | null
          telefone?: string | null
          tempo_experiencia?: string | null
          uniforme_calca?: string | null
          uniforme_camiseta?: string | null
          uniforme_macacao?: string | null
          updated_at?: string
          valor_padrao?: number | null
        }
        Update: {
          apelido?: string | null
          ativo?: boolean
          case_sucesso?: string | null
          chave_pix?: string | null
          chave_pix_confirmada?: string | null
          cpf?: string | null
          created_at?: string
          cursos_especializacoes?: string | null
          data_cadastro?: string | null
          data_nascimento?: string | null
          data_ultima_atualizacao?: string | null
          email?: string | null
          endereco?: string | null
          faixa_etaria_experiencia?: string | null
          flow_status?: string | null
          formacao_academica?: string | null
          frequencia_desejada?: string | null
          funcao?: string
          habilidades?: Json | null
          id?: string
          identificacao_registro?: string | null
          interesse_mais_eventos?: string | null
          interesse_pacotes_mensais?: string | null
          interesses_curto_longo_prazo?: string | null
          jotform_submission_id?: string | null
          meio_transporte?: string | null
          motivacao?: string | null
          nome?: string
          possui_cnpj?: string | null
          referencias_profissionais?: string | null
          submission_ip?: string | null
          telefone?: string | null
          tempo_experiencia?: string | null
          uniforme_calca?: string | null
          uniforme_camiseta?: string | null
          uniforme_macacao?: string | null
          updated_at?: string
          valor_padrao?: number | null
        }
        Relationships: []
      }
      reclamacoes: {
        Row: {
          anexos: string | null
          created_at: string | null
          data_abertura: string | null
          descricao: string | null
          evento_id: string | null
          id: string
          identificacao_unica: string | null
          nome_cliente: string | null
          responsavel_abertura: string | null
          submission_id: string | null
          telefone_cliente: string | null
        }
        Insert: {
          anexos?: string | null
          created_at?: string | null
          data_abertura?: string | null
          descricao?: string | null
          evento_id?: string | null
          id?: string
          identificacao_unica?: string | null
          nome_cliente?: string | null
          responsavel_abertura?: string | null
          submission_id?: string | null
          telefone_cliente?: string | null
        }
        Update: {
          anexos?: string | null
          created_at?: string | null
          data_abertura?: string | null
          descricao?: string | null
          evento_id?: string | null
          id?: string
          identificacao_unica?: string | null
          nome_cliente?: string | null
          responsavel_abertura?: string | null
          submission_id?: string | null
          telefone_cliente?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reclamacoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      satisfacao: {
        Row: {
          comentario: string | null
          comentario_aberto: string | null
          cpf_avaliador: string | null
          created_at: string
          data_avaliacao: string
          data_resposta: string | null
          data_ultima_atualizacao: string | null
          escopo_projeto: string | null
          evento_id: string | null
          feedback_contratante: string | null
          id: string
          identificacao_unica: string | null
          jotform_submission_id: string | null
          nome_avaliador: string | null
          nome_cliente: string | null
          nota: number
          nota_adequacao_atividades: number | null
          nota_completude_materiais: number | null
          nota_cumprimento_cronograma: number | null
          nota_engajamento_criancas: number | null
          nota_entrega_materiais: number | null
          nota_feedback_criancas: number | null
          nota_geral: number | null
          nota_informacoes_previas: number | null
          nota_materiais: number | null
          nota_profissionais: number | null
          nota_qualidade_recreacao: number | null
          nota_reacao_pais: number | null
          nota_suporte_casting: number | null
          nps_score: number | null
          obs_casting_logistica_materiais: string | null
          obs_equipe_evento: string | null
          recontrataria: string | null
          submission_ip: string | null
          tags: string | null
          tipo: string | null
        }
        Insert: {
          comentario?: string | null
          comentario_aberto?: string | null
          cpf_avaliador?: string | null
          created_at?: string
          data_avaliacao?: string
          data_resposta?: string | null
          data_ultima_atualizacao?: string | null
          escopo_projeto?: string | null
          evento_id?: string | null
          feedback_contratante?: string | null
          id?: string
          identificacao_unica?: string | null
          jotform_submission_id?: string | null
          nome_avaliador?: string | null
          nome_cliente?: string | null
          nota: number
          nota_adequacao_atividades?: number | null
          nota_completude_materiais?: number | null
          nota_cumprimento_cronograma?: number | null
          nota_engajamento_criancas?: number | null
          nota_entrega_materiais?: number | null
          nota_feedback_criancas?: number | null
          nota_geral?: number | null
          nota_informacoes_previas?: number | null
          nota_materiais?: number | null
          nota_profissionais?: number | null
          nota_qualidade_recreacao?: number | null
          nota_reacao_pais?: number | null
          nota_suporte_casting?: number | null
          nps_score?: number | null
          obs_casting_logistica_materiais?: string | null
          obs_equipe_evento?: string | null
          recontrataria?: string | null
          submission_ip?: string | null
          tags?: string | null
          tipo?: string | null
        }
        Update: {
          comentario?: string | null
          comentario_aberto?: string | null
          cpf_avaliador?: string | null
          created_at?: string
          data_avaliacao?: string
          data_resposta?: string | null
          data_ultima_atualizacao?: string | null
          escopo_projeto?: string | null
          evento_id?: string | null
          feedback_contratante?: string | null
          id?: string
          identificacao_unica?: string | null
          jotform_submission_id?: string | null
          nome_avaliador?: string | null
          nome_cliente?: string | null
          nota?: number
          nota_adequacao_atividades?: number | null
          nota_completude_materiais?: number | null
          nota_cumprimento_cronograma?: number | null
          nota_engajamento_criancas?: number | null
          nota_entrega_materiais?: number | null
          nota_feedback_criancas?: number | null
          nota_geral?: number | null
          nota_informacoes_previas?: number | null
          nota_materiais?: number | null
          nota_profissionais?: number | null
          nota_qualidade_recreacao?: number | null
          nota_reacao_pais?: number | null
          nota_suporte_casting?: number | null
          nps_score?: number | null
          obs_casting_logistica_materiais?: string | null
          obs_equipe_evento?: string | null
          recontrataria?: string | null
          submission_ip?: string | null
          tags?: string | null
          tipo?: string | null
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendas: {
        Row: {
          canal_origem: string | null
          check_financeiro: string | null
          cnpj_cliente: string | null
          complemento_endereco: string | null
          cpf_cliente: string | null
          created_at: string
          data_contrato: string | null
          data_ultima_atualizacao: string | null
          data_venda: string
          desconto: number | null
          email_cliente: string | null
          email_vendedor: string | null
          endereco_residencial: string | null
          evento_id: string | null
          flow_status: string | null
          forma_pagamento_confirmada: string | null
          forma_pagamento_selecionada: string | null
          id: string
          identificacao_unica: string | null
          jotform_submission_id: string | null
          nome_cliente: string | null
          nota_atendimento_vendas: number | null
          observacoes_integradas: string | null
          observacoes_internas: string | null
          pendencias_financeiras: string | null
          perdas_reais: number | null
          status_evento: string | null
          status_pagamento: Database["public"]["Enums"]["pagamento_status"]
          submission_ip: string | null
          subtotal: number | null
          tags: string | null
          telefone_cliente: string | null
          updated_at: string
          valor_entrada: number | null
          valor_recebido: number
          valor_total: number
        }
        Insert: {
          canal_origem?: string | null
          check_financeiro?: string | null
          cnpj_cliente?: string | null
          complemento_endereco?: string | null
          cpf_cliente?: string | null
          created_at?: string
          data_contrato?: string | null
          data_ultima_atualizacao?: string | null
          data_venda?: string
          desconto?: number | null
          email_cliente?: string | null
          email_vendedor?: string | null
          endereco_residencial?: string | null
          evento_id?: string | null
          flow_status?: string | null
          forma_pagamento_confirmada?: string | null
          forma_pagamento_selecionada?: string | null
          id?: string
          identificacao_unica?: string | null
          jotform_submission_id?: string | null
          nome_cliente?: string | null
          nota_atendimento_vendas?: number | null
          observacoes_integradas?: string | null
          observacoes_internas?: string | null
          pendencias_financeiras?: string | null
          perdas_reais?: number | null
          status_evento?: string | null
          status_pagamento?: Database["public"]["Enums"]["pagamento_status"]
          submission_ip?: string | null
          subtotal?: number | null
          tags?: string | null
          telefone_cliente?: string | null
          updated_at?: string
          valor_entrada?: number | null
          valor_recebido?: number
          valor_total?: number
        }
        Update: {
          canal_origem?: string | null
          check_financeiro?: string | null
          cnpj_cliente?: string | null
          complemento_endereco?: string | null
          cpf_cliente?: string | null
          created_at?: string
          data_contrato?: string | null
          data_ultima_atualizacao?: string | null
          data_venda?: string
          desconto?: number | null
          email_cliente?: string | null
          email_vendedor?: string | null
          endereco_residencial?: string | null
          evento_id?: string | null
          flow_status?: string | null
          forma_pagamento_confirmada?: string | null
          forma_pagamento_selecionada?: string | null
          id?: string
          identificacao_unica?: string | null
          jotform_submission_id?: string | null
          nome_cliente?: string | null
          nota_atendimento_vendas?: number | null
          observacoes_integradas?: string | null
          observacoes_internas?: string | null
          pendencias_financeiras?: string | null
          perdas_reais?: number | null
          status_evento?: string | null
          status_pagamento?: Database["public"]["Enums"]["pagamento_status"]
          submission_ip?: string | null
          subtotal?: number | null
          tags?: string | null
          telefone_cliente?: string | null
          updated_at?: string
          valor_entrada?: number | null
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
      can_sync_jotform: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
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
