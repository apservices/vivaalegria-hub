-- =====================================================
-- SINCRONIZAÇÃO JOTFORM → VIVALEGRIA
-- Expansão de tabelas existentes e criação de novas
-- =====================================================

-- ============= TABELA: vendas (EXPANSÃO) =============
ALTER TABLE vendas DROP COLUMN IF EXISTS identificacao_unica;
ALTER TABLE vendas ADD COLUMN identificacao_unica TEXT UNIQUE;
ALTER TABLE vendas ADD COLUMN data_contrato DATE;
ALTER TABLE vendas ADD COLUMN flow_status TEXT;
ALTER TABLE vendas ADD COLUMN status_evento TEXT;
ALTER TABLE vendas ADD COLUMN observacoes_internas TEXT;
ALTER TABLE vendas ADD COLUMN perdas_reais NUMERIC DEFAULT 0;
ALTER TABLE vendas ADD COLUMN pendencias_financeiras TEXT;
ALTER TABLE vendas ADD COLUMN check_financeiro TEXT;
ALTER TABLE vendas ADD COLUMN valor_entrada NUMERIC DEFAULT 0;
ALTER TABLE vendas ADD COLUMN forma_pagamento_confirmada TEXT;
ALTER TABLE vendas ADD COLUMN forma_pagamento_selecionada TEXT;
ALTER TABLE vendas ADD COLUMN nome_cliente TEXT;
ALTER TABLE vendas ADD COLUMN telefone_cliente TEXT;
ALTER TABLE vendas ADD COLUMN email_cliente TEXT;
ALTER TABLE vendas ADD COLUMN cpf_cliente TEXT;
ALTER TABLE vendas ADD COLUMN cnpj_cliente TEXT;
ALTER TABLE vendas ADD COLUMN endereco_residencial TEXT;
ALTER TABLE vendas ADD COLUMN complemento_endereco TEXT;
ALTER TABLE vendas ADD COLUMN canal_origem TEXT;
ALTER TABLE vendas ADD COLUMN email_vendedor TEXT;
ALTER TABLE vendas ADD COLUMN nota_atendimento_vendas INTEGER;
ALTER TABLE vendas ADD COLUMN submission_ip TEXT;
ALTER TABLE vendas ADD COLUMN data_ultima_atualizacao TIMESTAMP WITH TIME ZONE;
ALTER TABLE vendas ADD COLUMN tags TEXT;
ALTER TABLE vendas ADD COLUMN subtotal NUMERIC;
ALTER TABLE vendas ADD COLUMN desconto NUMERIC;
ALTER TABLE vendas ADD COLUMN observacoes_integradas TEXT;

-- ============= TABELA: eventos (EXPANSÃO) =============
ALTER TABLE eventos DROP COLUMN IF EXISTS identificacao_unica;
ALTER TABLE eventos ADD COLUMN identificacao_unica TEXT;
ALTER TABLE eventos ADD COLUMN hora_inicio TIME;
ALTER TABLE eventos ADD COLUMN endereco_evento TEXT;
ALTER TABLE eventos ADD COLUMN endereco_igual_residencial BOOLEAN;
ALTER TABLE eventos ADD COLUMN tipo_local TEXT;
ALTER TABLE eventos ADD COLUMN qtd_criancas_prevista INTEGER;
ALTER TABLE eventos ADD COLUMN faixa_etaria TEXT;
ALTER TABLE eventos ADD COLUMN tema TEXT;
ALTER TABLE eventos ADD COLUMN nome_aniversariante TEXT;
ALTER TABLE eventos ADD COLUMN idade_aniversariante INTEGER;
ALTER TABLE eventos ADD COLUMN horas_contratadas NUMERIC;
ALTER TABLE eventos ADD COLUMN servicos_contratados TEXT;
ALTER TABLE eventos ADD COLUMN qtd_recreadores_contratados INTEGER;
ALTER TABLE eventos ADD COLUMN pacote_visual TEXT;
ALTER TABLE eventos ADD COLUMN permite_alimentacao_recreador BOOLEAN;
ALTER TABLE eventos ADD COLUMN atividades_adicionais TEXT;
ALTER TABLE eventos ADD COLUMN orientacoes_especiais TEXT;
ALTER TABLE eventos ADD COLUMN informacoes_rotina_evento TEXT;
ALTER TABLE eventos ADD COLUMN observacoes_cliente TEXT;
ALTER TABLE eventos ADD COLUMN necessidades_especiais TEXT;
ALTER TABLE eventos ADD COLUMN alertas_seguranca TEXT;
ALTER TABLE eventos ADD COLUMN duracao_prevista NUMERIC;
ALTER TABLE eventos ADD COLUMN atividades_personalizadas TEXT;
ALTER TABLE eventos ADD COLUMN submission_ip TEXT;
ALTER TABLE eventos ADD COLUMN data_ultima_atualizacao TIMESTAMP WITH TIME ZONE;

-- ============= TABELA: profissionais (EXPANSÃO) =============
ALTER TABLE profissionais ADD COLUMN identificacao_registro TEXT;
ALTER TABLE profissionais ADD COLUMN apelido TEXT;
ALTER TABLE profissionais ADD COLUMN cpf TEXT;
ALTER TABLE profissionais ADD COLUMN data_nascimento DATE;
ALTER TABLE profissionais ADD COLUMN endereco TEXT;
ALTER TABLE profissionais ADD COLUMN chave_pix TEXT;
ALTER TABLE profissionais ADD COLUMN chave_pix_confirmada TEXT;
ALTER TABLE profissionais ADD COLUMN meio_transporte TEXT;
ALTER TABLE profissionais ADD COLUMN tempo_experiencia TEXT;
ALTER TABLE profissionais ADD COLUMN faixa_etaria_experiencia TEXT;
ALTER TABLE profissionais ADD COLUMN formacao_academica TEXT;
ALTER TABLE profissionais ADD COLUMN cursos_especializacoes TEXT;
ALTER TABLE profissionais ADD COLUMN motivacao TEXT;
ALTER TABLE profissionais ADD COLUMN case_sucesso TEXT;
ALTER TABLE profissionais ADD COLUMN referencias_profissionais TEXT;
ALTER TABLE profissionais ADD COLUMN habilidades JSONB;
ALTER TABLE profissionais ADD COLUMN uniforme_calca TEXT;
ALTER TABLE profissionais ADD COLUMN uniforme_camiseta TEXT;
ALTER TABLE profissionais ADD COLUMN uniforme_macacao TEXT;
ALTER TABLE profissionais ADD COLUMN possui_cnpj TEXT;
ALTER TABLE profissionais ADD COLUMN frequencia_desejada TEXT;
ALTER TABLE profissionais ADD COLUMN interesse_pacotes_mensais TEXT;
ALTER TABLE profissionais ADD COLUMN interesse_mais_eventos TEXT;
ALTER TABLE profissionais ADD COLUMN interesses_curto_longo_prazo TEXT;
ALTER TABLE profissionais ADD COLUMN submission_ip TEXT;
ALTER TABLE profissionais ADD COLUMN data_ultima_atualizacao TIMESTAMP WITH TIME ZONE;
ALTER TABLE profissionais ADD COLUMN flow_status TEXT;
ALTER TABLE profissionais ADD COLUMN data_cadastro TIMESTAMP WITH TIME ZONE;

-- ============= TABELA: eventos_profissionais (EXPANSÃO) =============
ALTER TABLE eventos_profissionais ADD COLUMN profissional_nome TEXT;
ALTER TABLE eventos_profissionais ADD COLUMN origem_avaliacao TEXT;
ALTER TABLE eventos_profissionais ADD COLUMN nota_comunicacao INTEGER;
ALTER TABLE eventos_profissionais ADD COLUMN nota_interacao_criancas INTEGER;
ALTER TABLE eventos_profissionais ADD COLUMN nota_seguranca INTEGER;
ALTER TABLE eventos_profissionais ADD COLUMN nota_adaptacao INTEGER;
ALTER TABLE eventos_profissionais ADD COLUMN nota_higiene INTEGER;

-- ============= TABELA: satisfacao (EXPANSÃO) =============
ALTER TABLE satisfacao ADD COLUMN tipo TEXT;
ALTER TABLE satisfacao ADD COLUMN identificacao_unica TEXT;
ALTER TABLE satisfacao ADD COLUMN cpf_avaliador TEXT;
ALTER TABLE satisfacao ADD COLUMN nome_avaliador TEXT;
ALTER TABLE satisfacao ADD COLUMN nome_cliente TEXT;
ALTER TABLE satisfacao ADD COLUMN nps_score INTEGER;
ALTER TABLE satisfacao ADD COLUMN nota_qualidade_recreacao INTEGER;
ALTER TABLE satisfacao ADD COLUMN nota_profissionais INTEGER;
ALTER TABLE satisfacao ADD COLUMN recontrataria TEXT;
ALTER TABLE satisfacao ADD COLUMN comentario_aberto TEXT;
ALTER TABLE satisfacao ADD COLUMN nota_informacoes_previas INTEGER;
ALTER TABLE satisfacao ADD COLUMN nota_adequacao_atividades INTEGER;
ALTER TABLE satisfacao ADD COLUMN nota_engajamento_criancas INTEGER;
ALTER TABLE satisfacao ADD COLUMN nota_feedback_criancas INTEGER;
ALTER TABLE satisfacao ADD COLUMN nota_materiais INTEGER;
ALTER TABLE satisfacao ADD COLUMN nota_suporte_casting INTEGER;
ALTER TABLE satisfacao ADD COLUMN nota_cumprimento_cronograma INTEGER;
ALTER TABLE satisfacao ADD COLUMN nota_entrega_materiais INTEGER;
ALTER TABLE satisfacao ADD COLUMN nota_completude_materiais INTEGER;
ALTER TABLE satisfacao ADD COLUMN obs_casting_logistica_materiais TEXT;
ALTER TABLE satisfacao ADD COLUMN escopo_projeto TEXT;
ALTER TABLE satisfacao ADD COLUMN nota_reacao_pais INTEGER;
ALTER TABLE satisfacao ADD COLUMN feedback_contratante TEXT;
ALTER TABLE satisfacao ADD COLUMN nota_geral INTEGER;
ALTER TABLE satisfacao ADD COLUMN obs_equipe_evento TEXT;
ALTER TABLE satisfacao ADD COLUMN submission_ip TEXT;
ALTER TABLE satisfacao ADD COLUMN data_ultima_atualizacao TIMESTAMP WITH TIME ZONE;
ALTER TABLE satisfacao ADD COLUMN tags TEXT;
ALTER TABLE satisfacao ADD COLUMN data_resposta TIMESTAMP WITH TIME ZONE;

-- ============= NOVA TABELA: reclamacoes =============
CREATE TABLE IF NOT EXISTS reclamacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_abertura TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responsavel_abertura TEXT,
  nome_cliente TEXT,
  telefone_cliente TEXT,
  descricao TEXT,
  identificacao_unica TEXT,
  evento_id UUID REFERENCES eventos(id),
  anexos TEXT,
  submission_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============= NOVA TABELA: controle_conferencia =============
CREATE TABLE IF NOT EXISTS controle_conferencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_conferencia TIMESTAMP WITH TIME ZONE DEFAULT now(),
  nome_avaliador TEXT,
  anexos TEXT,
  marcador TEXT,
  evento_id UUID REFERENCES eventos(id),
  itens_consumidos_totalmente TEXT,
  checklist_preenchido TEXT,
  uniforme_usado TEXT,
  usou_pintura_facial TEXT,
  usou_baloes TEXT,
  houve_divergencia TEXT,
  caixa_organizada TEXT,
  id_montagem TEXT,
  itens_ausentes TEXT,
  comentarios TEXT,
  submission_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============= RLS POLICIES (manter públicas por enquanto) =============
ALTER TABLE reclamacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE controle_conferencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on reclamacoes" 
  ON reclamacoes FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on controle_conferencia" 
  ON controle_conferencia FOR ALL USING (true) WITH CHECK (true);

-- ============= ÍNDICES PARA PERFORMANCE =============
CREATE INDEX IF NOT EXISTS idx_vendas_identificacao_unica ON vendas(identificacao_unica);
CREATE INDEX IF NOT EXISTS idx_vendas_submission_id ON vendas(jotform_submission_id);
CREATE INDEX IF NOT EXISTS idx_eventos_identificacao_unica ON eventos(identificacao_unica);
CREATE INDEX IF NOT EXISTS idx_eventos_submission_id ON eventos(jotform_submission_id);
CREATE INDEX IF NOT EXISTS idx_profissionais_cpf ON profissionais(cpf);
CREATE INDEX IF NOT EXISTS idx_profissionais_submission_id ON profissionais(jotform_submission_id);
CREATE INDEX IF NOT EXISTS idx_satisfacao_submission_id ON satisfacao(jotform_submission_id);
CREATE INDEX IF NOT EXISTS idx_reclamacoes_submission_id ON reclamacoes(submission_id);
CREATE INDEX IF NOT EXISTS idx_controle_submission_id ON controle_conferencia(submission_id);