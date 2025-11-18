export type EventoStatus = 'pendente' | 'confirmado' | 'realizado' | 'cancelado';
export type PagamentoStatus = 'pendente' | 'parcial' | 'pago' | 'atrasado';
export type TipoEvento = 'casamento' | 'aniversario' | 'corporativo' | 'formatura' | 'outro';

export interface Evento {
  id: string;
  nome: string;
  cliente: string;
  data_evento: string;
  tipo_evento: TipoEvento;
  formulario_origem?: string;
  jotform_submission_id?: string;
  status: EventoStatus;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Novos campos da sincronização
  identificacao_unica?: string;
  hora_inicio?: string;
  endereco_evento?: string;
  endereco_igual_residencial?: boolean;
  tipo_local?: string;
  qtd_criancas_prevista?: number;
  faixa_etaria?: string;
  tema?: string;
  nome_aniversariante?: string;
  idade_aniversariante?: number;
  horas_contratadas?: number;
  servicos_contratados?: string;
  qtd_recreadores_contratados?: number;
  pacote_visual?: string;
  permite_alimentacao_recreador?: boolean;
  atividades_adicionais?: string;
  orientacoes_especiais?: string;
  informacoes_rotina_evento?: string;
  observacoes_cliente?: string;
  necessidades_especiais?: string;
  alertas_seguranca?: string;
  duracao_prevista?: number;
  atividades_personalizadas?: string;
  submission_ip?: string;
  data_ultima_atualizacao?: string;
}

export interface Venda {
  id: string;
  evento_id?: string;
  data_venda: string;
  valor_total: number;
  valor_recebido: number;
  status_pagamento: PagamentoStatus;
  jotform_submission_id?: string;
  created_at: string;
  updated_at: string;
  // Novos campos da sincronização
  identificacao_unica?: string;
  data_contrato?: string;
  flow_status?: string;
  status_evento?: string;
  observacoes_internas?: string;
  perdas_reais?: number;
  pendencias_financeiras?: string;
  check_financeiro?: string;
  valor_entrada?: number;
  forma_pagamento_confirmada?: string;
  forma_pagamento_selecionada?: string;
  nome_cliente?: string;
  telefone_cliente?: string;
  email_cliente?: string;
  cpf_cliente?: string;
  cnpj_cliente?: string;
  endereco_residencial?: string;
  complemento_endereco?: string;
  canal_origem?: string;
  email_vendedor?: string;
  nota_atendimento_vendas?: number;
  submission_ip?: string;
  data_ultima_atualizacao?: string;
  tags?: string;
  subtotal?: number;
  desconto?: number;
  observacoes_integradas?: string;
}

export interface Profissional {
  id: string;
  nome: string;
  funcao: string;
  telefone?: string;
  email?: string;
  valor_padrao?: number;
  jotform_submission_id?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  // Novos campos da sincronização
  identificacao_registro?: string;
  apelido?: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: string;
  chave_pix?: string;
  chave_pix_confirmada?: string;
  meio_transporte?: string;
  tempo_experiencia?: string;
  faixa_etaria_experiencia?: string;
  formacao_academica?: string;
  cursos_especializacoes?: string;
  motivacao?: string;
  case_sucesso?: string;
  referencias_profissionais?: string;
  habilidades?: Record<string, string>;
  uniforme_calca?: string;
  uniforme_camiseta?: string;
  uniforme_macacao?: string;
  possui_cnpj?: string;
  frequencia_desejada?: string;
  interesse_pacotes_mensais?: string;
  interesse_mais_eventos?: string;
  interesses_curto_longo_prazo?: string;
  submission_ip?: string;
  data_ultima_atualizacao?: string;
  flow_status?: string;
  data_cadastro?: string;
}

export interface EventoProfissional {
  id: string;
  evento_id: string;
  profissional_id: string;
  valor_acordado: number;
  valor_pago: number;
  status_pagamento: PagamentoStatus;
  created_at: string;
  // Novos campos da sincronização
  profissional_nome?: string;
  origem_avaliacao?: string;
  nota_comunicacao?: number;
  nota_interacao_criancas?: number;
  nota_seguranca?: number;
  nota_adaptacao?: number;
  nota_higiene?: number;
}

export interface Pagamento {
  id: string;
  venda_id?: string;
  valor: number;
  data_pagamento: string;
  metodo_pagamento?: string;
  observacoes?: string;
  jotform_submission_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Satisfacao {
  id: string;
  evento_id?: string;
  nota: number;
  comentario?: string;
  data_avaliacao: string;
  jotform_submission_id?: string;
  created_at: string;
  // Novos campos da sincronização
  tipo?: string;
  identificacao_unica?: string;
  cpf_avaliador?: string;
  nome_avaliador?: string;
  nome_cliente?: string;
  nps_score?: number;
  nota_qualidade_recreacao?: number;
  nota_profissionais?: number;
  recontrataria?: string;
  comentario_aberto?: string;
  nota_informacoes_previas?: number;
  nota_adequacao_atividades?: number;
  nota_engajamento_criancas?: number;
  nota_feedback_criancas?: number;
  nota_materiais?: number;
  nota_suporte_casting?: number;
  nota_cumprimento_cronograma?: number;
  nota_entrega_materiais?: number;
  nota_completude_materiais?: number;
  obs_casting_logistica_materiais?: string;
  escopo_projeto?: string;
  nota_reacao_pais?: number;
  feedback_contratante?: string;
  nota_geral?: number;
  obs_equipe_evento?: string;
  submission_ip?: string;
  data_ultima_atualizacao?: string;
  tags?: string;
  data_resposta?: string;
}

export interface Reclamacao {
  id: string;
  data_abertura: string;
  responsavel_abertura?: string;
  nome_cliente?: string;
  telefone_cliente?: string;
  descricao?: string;
  identificacao_unica?: string;
  evento_id?: string;
  anexos?: string;
  submission_id?: string;
  created_at: string;
}

export interface ControleConferencia {
  id: string;
  data_conferencia: string;
  nome_avaliador?: string;
  anexos?: string;
  marcador?: string;
  evento_id?: string;
  itens_consumidos_totalmente?: string;
  checklist_preenchido?: string;
  uniforme_usado?: string;
  usou_pintura_facial?: string;
  usou_baloes?: string;
  houve_divergencia?: string;
  caixa_organizada?: string;
  id_montagem?: string;
  itens_ausentes?: string;
  comentarios?: string;
  submission_id?: string;
  created_at: string;
}

// Extended types with relations
export interface EventoComVenda extends Evento {
  venda?: Venda;
}

export interface EventoComSatisfacao extends Evento {
  satisfacao?: Satisfacao[];
}

export interface VendaComPagamentos extends Venda {
  pagamentos?: Pagamento[];
}

export interface ProfissionalComEventos extends Profissional {
  eventos_profissionais?: (EventoProfissional & { evento?: Evento })[];
}
