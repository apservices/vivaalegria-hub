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
}

export interface EventoProfissional {
  id: string;
  evento_id: string;
  profissional_id: string;
  valor_acordado: number;
  valor_pago: number;
  status_pagamento: PagamentoStatus;
  created_at: string;
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
