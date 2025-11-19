import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  vendaSchema,
  eventoSchema,
  profissionalSchema,
  satisfacaoSchema,
  reclamacaoSchema,
  controleConferenciaSchema,
} from "./validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JotFormSubmission {
  id: string;
  form_id: string;
  created_at: string;
  answers: Record<string, {
    answer: string | string[];
    text?: string;
    prettyFormat?: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const jotformApiKey = Deno.env.get('JOTFORM');

    if (!jotformApiKey) {
      throw new Error('JOTFORM API key not configured');
    }

    // Verificar autenticação e autorização
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se é admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem sincronizar' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔄 Iniciando sincronização automática de todos os formulários...');

    // Buscar todos os formulários do JotForm
    const formsResponse = await fetch(`https://api.jotform.com/user/forms?apiKey=${jotformApiKey}`);
    const formsData = await formsResponse.json();

    if (formsData.responseCode !== 200) {
      throw new Error('Erro ao buscar formulários do JotForm');
    }

    const forms = formsData.content;
    console.log(`📋 ${forms.length} formulários encontrados`);

    const stats = {
      vendas: 0,
      eventos: 0,
      profissionais: 0,
      satisfacao: 0,
      eventos_profissionais: 0,
      reclamacoes: 0,
      controle_conferencia: 0,
    };

    // Processar cada formulário
    for (const form of forms) {
      const formType = detectFormType(form.title);
      if (!formType) {
        console.log(`⏭️ Ignorando formulário: ${form.title}`);
        continue;
      }

      console.log(`📝 Processando: ${form.title} (Tipo: ${formType})`);

      // Buscar submissões
      const submissionsResponse = await fetch(
        `https://api.jotform.com/form/${form.id}/submissions?apiKey=${jotformApiKey}`
      );
      const submissionsData = await submissionsResponse.json();

      if (submissionsData.responseCode !== 200) {
        console.error(`❌ Erro ao buscar submissões do formulário ${form.id}`);
        continue;
      }

      const submissions = submissionsData.content;
      console.log(`  └─ ${submissions.length} submissões encontradas`);

      // Processar cada submissão
      for (const submission of submissions) {
        try {
          await processSubmission(submission, formType, supabase, stats);
        } catch (error) {
          console.error(`❌ Erro ao processar submissão ${submission.id}:`, error);
        }
      }
    }

    console.log('✅ Sincronização completa!', stats);

    return new Response(
      JSON.stringify({ success: true, stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function detectFormType(title: string): string | null {
  const titleLower = title.toLowerCase();

  if (titleLower.includes('contratação') || titleLower.includes('contratacao') || titleLower.includes('venda') || titleLower.includes('proposta')) {
    return 'venda+evento';
  }
  if (titleLower.includes('cadastro') && (titleLower.includes('profissional') || titleLower.includes('recreação') || titleLower.includes('recreacao'))) {
    return 'profissional';
  }
  if (titleLower.includes('avaliação') && titleLower.includes('evento')) {
    return 'satisfacao_interna';
  }
  if (titleLower.includes('nps')) {
    return 'satisfacao_nps';
  }
  if (titleLower.includes('reclamação') || titleLower.includes('reclamacao') || titleLower.includes('ticket')) {
    return 'reclamacao';
  }
  if (titleLower.includes('controle') || titleLower.includes('conferência') || titleLower.includes('conferencia')) {
    return 'controle_conferencia';
  }

  return null;
}

function findAnswer(answers: Record<string, any>, keywords: string[]): string | null {
  for (const [key, value] of Object.entries(answers)) {
    const questionText = (value.text || '').toLowerCase();
    const answer = value.answer || value.prettyFormat || '';

    if (keywords.some(kw => questionText.includes(kw)) && answer) {
      return Array.isArray(answer) ? answer.join(', ') : String(answer);
    }
  }
  return null;
}

function parseDate(dateStr: string | null): string {
  if (!dateStr) return new Date().toISOString();
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function parseNumber(value: string | null, defaultValue: number = 0): number {
  if (!value) return defaultValue;
  const cleanValue = String(value).replace(/[^\d.,]/g, '').replace(',', '.');
  const num = parseFloat(cleanValue);
  return isNaN(num) ? defaultValue : num;
}

function parseBoolean(value: string | null): boolean | undefined {
  if (!value) return undefined;
  const lower = String(value).toLowerCase();
  if (lower === 'sim' || lower === 'yes' || lower === 'true') return true;
  if (lower === 'não' || lower === 'nao' || lower === 'no' || lower === 'false') return false;
  return undefined;
}

async function processSubmission(
  submission: JotFormSubmission,
  formType: string,
  supabase: any,
  stats: any
) {
  if (formType === 'venda+evento') {
    await processVendaEvento(submission, supabase, stats);
  } else if (formType === 'profissional') {
    await processProfissional(submission, supabase, stats);
  } else if (formType === 'satisfacao_interna' || formType === 'satisfacao_nps') {
    await processSatisfacao(submission, formType, supabase, stats);
  } else if (formType === 'reclamacao') {
    await processReclamacao(submission, supabase, stats);
  } else if (formType === 'controle_conferencia') {
    await processControleConferencia(submission, supabase, stats);
  }
}

async function processVendaEvento(submission: JotFormSubmission, supabase: any, stats: any) {
  const answers = submission.answers;
  const identificacaoUnica = findAnswer(answers, ['identificação única', 'identificacao unica', 'contrato', 'id']);

  // VENDA
  try {
    const vendaData = vendaSchema.parse({
      identificacao_unica: identificacaoUnica,
      data_contrato: findAnswer(answers, ['data contrato', 'data do contrato']),
      flow_status: findAnswer(answers, ['flow status', 'status']),
      status_evento: findAnswer(answers, ['status evento']),
      status_pagamento: findAnswer(answers, ['status pagamento']) || 'pendente',
      observacoes_internas: findAnswer(answers, ['obs viva', 'observações viva', 'observacoes internas']),
      perdas_reais: parseNumber(findAnswer(answers, ['perdas', 'perdas reais'])),
      pendencias_financeiras: findAnswer(answers, ['pendências', 'pendencias financeiras']),
      check_financeiro: findAnswer(answers, ['check financeiro', 'auditoria']),
      valor_total: parseNumber(findAnswer(answers, ['valor total'])),
      valor_entrada: parseNumber(findAnswer(answers, ['entrada', 'valor entrada'])),
      forma_pagamento_confirmada: findAnswer(answers, ['confirmação forma', 'forma pagamento confirmada']),
      forma_pagamento_selecionada: findAnswer(answers, ['selecione a forma', 'forma pagamento']),
      nome_cliente: findAnswer(answers, ['nome completo', 'nome', 'razão social']),
      telefone_cliente: findAnswer(answers, ['telefone']),
      email_cliente: findAnswer(answers, ['e-mail', 'email']),
      cpf_cliente: findAnswer(answers, ['cpf']),
      cnpj_cliente: findAnswer(answers, ['cnpj']),
      endereco_residencial: findAnswer(answers, ['endereço residencial', 'endereco residencial']),
      complemento_endereco: findAnswer(answers, ['complemento', 'apartamento', 'bloco']),
      canal_origem: findAnswer(answers, ['como soube']),
      email_vendedor: findAnswer(answers, ['e-mail vendas', 'email vendas']),
      nota_atendimento_vendas: parseNumber(findAnswer(answers, ['avaliação', 'atendimento vendas']), undefined),
      submission_ip: submission.answers['1']?.answer?.toString(),
      submission_id: submission.id,
      data_ultima_atualizacao: submission.created_at,
      tags: findAnswer(answers, ['tags']),
      subtotal: parseNumber(findAnswer(answers, ['subtotal'])),
      desconto: parseNumber(findAnswer(answers, ['desconto'])),
      observacoes_integradas: findAnswer(answers, ['observações integradas', 'observacoes integradas']),
      valor_recebido: 0,
      data_venda: parseDate(submission.created_at),
    });

    const { error } = await supabase.from('vendas').upsert(vendaData, {
      onConflict: 'submission_id',
    });

    if (!error) stats.vendas++;
  } catch (error) {
    console.error('❌ Erro validando venda:', error);
  }

  // EVENTO
  try {
    const eventoData = eventoSchema.parse({
      identificacao_unica: identificacaoUnica,
      nome: findAnswer(answers, ['tipo de evento', 'evento']) || 'Evento',
      cliente: findAnswer(answers, ['nome completo', 'nome', 'cliente']) || 'Cliente',
      data_evento: parseDate(findAnswer(answers, ['data do evento', 'data evento', 'agendamento'])),
      tipo_evento: detectTipoEvento(findAnswer(answers, ['tipo', 'tipo de evento'])),
      status: 'confirmado',
      hora_inicio: findAnswer(answers, ['horário', 'hora início', 'hora inicio']),
      endereco_evento: findAnswer(answers, ['endereço do evento', 'endereco evento']),
      endereco_igual_residencial: parseBoolean(findAnswer(answers, ['endereço do evento é o mesmo'])),
      tipo_local: findAnswer(answers, ['tipo de local']),
      qtd_criancas_prevista: parseNumber(findAnswer(answers, ['quantidade de crianças', 'qtd criancas']), undefined),
      faixa_etaria: findAnswer(answers, ['faixa etária', 'faixa etaria']),
      tema: findAnswer(answers, ['tema']),
      nome_aniversariante: findAnswer(answers, ['aniversariante']),
      idade_aniversariante: parseNumber(findAnswer(answers, ['idade aniversariante']), undefined),
      horas_contratadas: parseNumber(findAnswer(answers, ['horas contratadas', 'tempo', 'duração']), undefined),
      servicos_contratados: findAnswer(answers, ['serviços contratados', 'servicos']),
      qtd_recreadores_contratados: parseNumber(findAnswer(answers, ['recreadores', 'profissionais']), undefined),
      pacote_visual: findAnswer(answers, ['visual', 'multisseleção visual']),
      permite_alimentacao_recreador: parseBoolean(findAnswer(answers, ['alimentar', 'recreador poderá se alimentar'])),
      atividades_adicionais: findAnswer(answers, ['outras atividades', 'atividades adicionais']),
      orientacoes_especiais: findAnswer(answers, ['orientação especial', 'orientacoes']),
      informacoes_rotina_evento: findAnswer(answers, ['personalizar', 'rotina']),
      observacoes: findAnswer(answers, ['observações vivalegria']),
      observacoes_cliente: findAnswer(answers, ['pedidos', 'observações gerais']),
      necessidades_especiais: findAnswer(answers, ['necessidades especiais']),
      alertas_seguranca: findAnswer(answers, ['piscina', 'atenção especial', 'alertas']),
      duracao_prevista: parseNumber(findAnswer(answers, ['duração', 'tempo']), undefined),
      atividades_personalizadas: findAnswer(answers, ['atividades personalizadas']),
      submission_ip: submission.answers['1']?.answer?.toString(),
      submission_id: submission.id,
      data_ultima_atualizacao: submission.created_at,
    });

    const { error } = await supabase.from('eventos').upsert(eventoData, {
      onConflict: 'submission_id',
    });

    if (!error) stats.eventos++;
  } catch (error) {
    console.error('❌ Erro validando evento:', error);
  }
}

async function processProfissional(submission: JotFormSubmission, supabase: any, stats: any) {
  const answers = submission.answers;

  try {
    const profissionalData = profissionalSchema.parse({
      identificacao_registro: findAnswer(answers, ['identificação', 'registro']),
      nome: findAnswer(answers, ['nome completo']) || 'Sem nome',
      apelido: findAnswer(answers, ['apelido']),
      cpf: findAnswer(answers, ['cpf']),
      data_nascimento: parseDate(findAnswer(answers, ['data de nascimento', 'nascimento'])),
      telefone: findAnswer(answers, ['telefone', 'celular', 'whatsapp']),
      email: findAnswer(answers, ['e-mail', 'email']),
      funcao: 'Recreador',
      endereco: findAnswer(answers, ['endereço', 'endereco residencial']),
      chave_pix: findAnswer(answers, ['pix', 'chave pix']),
      chave_pix_confirmada: findAnswer(answers, ['confirme', 'pix confirmada']),
      meio_transporte: findAnswer(answers, ['transporte']),
      tempo_experiencia: findAnswer(answers, ['tempo de experiência', 'experiencia']),
      faixa_etaria_experiencia: findAnswer(answers, ['faixa etária', 'faixa etaria']),
      formacao_academica: findAnswer(answers, ['formação', 'academica']),
      cursos_especializacoes: findAnswer(answers, ['cursos', 'especializações', 'especializacoes']),
      motivacao: findAnswer(answers, ['porque escolheu', 'motivação', 'motivacao']),
      case_sucesso: findAnswer(answers, ['descreva', 'experiência', 'sucesso']),
      referencias_profissionais: findAnswer(answers, ['referências', 'referencias']),
      uniforme_calca: findAnswer(answers, ['calça', 'calca']),
      uniforme_camiseta: findAnswer(answers, ['camiseta']),
      uniforme_macacao: findAnswer(answers, ['macacão', 'macacao']),
      possui_cnpj: findAnswer(answers, ['cnpj']),
      frequencia_desejada: findAnswer(answers, ['frequência', 'frequencia']),
      interesse_pacotes_mensais: findAnswer(answers, ['pacotes mensais']),
      interesse_mais_eventos: findAnswer(answers, ['mais oportunidades']),
      interesses_curto_longo_prazo: findAnswer(answers, ['interesses', 'curto e longo prazo']),
      submission_id: submission.id,
      submission_ip: submission.answers['1']?.answer?.toString(),
      data_cadastro: submission.created_at,
      data_ultima_atualizacao: submission.created_at,
      flow_status: findAnswer(answers, ['flow status']),
      ativo: true,
    });

    const { error } = await supabase.from('profissionais').upsert(profissionalData, {
      onConflict: 'submission_id',
    });

    if (!error) stats.profissionais++;
  } catch (error) {
    console.error('❌ Erro validando profissional:', error);
  }
}

async function processSatisfacao(submission: JotFormSubmission, formType: string, supabase: any, stats: any) {
  const answers = submission.answers;
  const tipo = formType === 'satisfacao_nps' ? 'NPS_CLIENTE' : 'INTERNA_EVENTO';

  try {
    const satisfacaoData = satisfacaoSchema.parse({
      tipo,
      identificacao_unica: findAnswer(answers, ['identificação', 'id evento']),
      data_avaliacao: submission.created_at,
      nota: parseNumber(findAnswer(answers, ['nota', 'satisfação geral', 'avaliação geral']), 0),
      cpf_avaliador: findAnswer(answers, ['cpf']),
      nome_avaliador: findAnswer(answers, ['nome']),
      nome_cliente: findAnswer(answers, ['cliente']),
      nps_score: parseNumber(findAnswer(answers, ['indica', 'nps']), undefined),
      nota_qualidade_recreacao: parseNumber(findAnswer(answers, ['qualidade']), undefined),
      nota_profissionais: parseNumber(findAnswer(answers, ['profissionais']), undefined),
      recontrataria: findAnswer(answers, ['contrataria novamente']),
      comentario_aberto: findAnswer(answers, ['melhorar', 'comentário', 'feedback']),
      nota_informacoes_previas: parseNumber(findAnswer(answers, ['informações necessárias']), undefined),
      nota_adequacao_atividades: parseNumber(findAnswer(answers, ['adequação']), undefined),
      nota_engajamento_criancas: parseNumber(findAnswer(answers, ['engajamento']), undefined),
      nota_feedback_criancas: parseNumber(findAnswer(answers, ['feedback criancas']), undefined),
      nota_materiais: parseNumber(findAnswer(answers, ['materiais']), undefined),
      nota_suporte_casting: parseNumber(findAnswer(answers, ['casting']), undefined),
      nota_cumprimento_cronograma: parseNumber(findAnswer(answers, ['cronograma']), undefined),
      nota_entrega_materiais: parseNumber(findAnswer(answers, ['entrega materiais']), undefined),
      nota_completude_materiais: parseNumber(findAnswer(answers, ['completude']), undefined),
      obs_casting_logistica_materiais: findAnswer(answers, ['observação', 'melhoria']),
      escopo_projeto: findAnswer(answers, ['escopo']),
      nota_reacao_pais: parseNumber(findAnswer(answers, ['reação pais']), undefined),
      feedback_contratante: findAnswer(answers, ['feedback contratante']),
      nota_geral: parseNumber(findAnswer(answers, ['geral']), undefined),
      obs_equipe_evento: findAnswer(answers, ['equipe']),
      submission_ip: submission.answers['1']?.answer?.toString(),
      submission_id: submission.id,
      data_resposta: submission.created_at,
    });

    const { error } = await supabase.from('satisfacao').upsert(satisfacaoData, {
      onConflict: 'submission_id',
    });

    if (!error) stats.satisfacao++;
  } catch (error) {
    console.error('❌ Erro validando satisfacao:', error);
  }
}

async function processReclamacao(submission: JotFormSubmission, supabase: any, stats: any) {
  const answers = submission.answers;

  try {
    const reclamacaoData = reclamacaoSchema.parse({
      data_abertura: submission.created_at,
      responsavel_abertura: findAnswer(answers, ['responsável']),
      nome_cliente: findAnswer(answers, ['nome', 'cliente']),
      telefone_cliente: findAnswer(answers, ['telefone']),
      descricao: findAnswer(answers, ['detalhes', 'descrição', 'ocorrência']),
      identificacao_unica: findAnswer(answers, ['identificação']),
      anexos: findAnswer(answers, ['anexar', 'evidências']),
      submission_id: submission.id,
    });

    const { error } = await supabase.from('reclamacoes').upsert(reclamacaoData, {
      onConflict: 'submission_id',
    });

    if (!error) stats.reclamacoes++;
  } catch (error) {
    console.error('❌ Erro validando reclamacao:', error);
  }
}

async function processControleConferencia(submission: JotFormSubmission, supabase: any, stats: any) {
  const answers = submission.answers;

  try {
    const controleData = controleConferenciaSchema.parse({
      data_conferencia: submission.created_at,
      nome_avaliador: findAnswer(answers, ['avaliador']),
      anexos: findAnswer(answers, ['anexar', 'evidência']),
      marcador: findAnswer(answers, ['marcador']),
      itens_consumidos_totalmente: findAnswer(answers, ['itens', 'consumidos']),
      checklist_preenchido: findAnswer(answers, ['checklist']),
      uniforme_usado: findAnswer(answers, ['uniforme']),
      usou_pintura_facial: findAnswer(answers, ['pintura facial']),
      usou_baloes: findAnswer(answers, ['balão', 'baloes']),
      houve_divergencia: findAnswer(answers, ['divergência', 'divergencia']),
      caixa_organizada: findAnswer(answers, ['caixa', 'organizada']),
      id_montagem: findAnswer(answers, ['id montagem', 'montagem']),
      itens_ausentes: findAnswer(answers, ['ausentes']),
      comentarios: findAnswer(answers, ['comentários', 'comentarios']),
      submission_id: submission.id,
    });

    const { error } = await supabase.from('controle_conferencia').upsert(controleData, {
      onConflict: 'submission_id',
    });

    if (!error) stats.controle_conferencia++;
  } catch (error) {
    console.error('❌ Erro validando controle conferencia:', error);
  }
}

function detectTipoEvento(tipo: string | null): 'casamento' | 'aniversario' | 'corporativo' | 'formatura' | 'outro' {
  if (!tipo) return 'outro';
  const lower = tipo.toLowerCase();
  if (lower.includes('casamento')) return 'casamento';
  if (lower.includes('aniversário') || lower.includes('aniversario')) return 'aniversario';
  if (lower.includes('corporativo')) return 'corporativo';
  if (lower.includes('formatura')) return 'formatura';
  return 'outro';
}
