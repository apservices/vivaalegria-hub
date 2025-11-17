import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JotFormForm {
  id: string;
  title: string;
  status: string;
}

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

function detectFormType(title: string): string | null {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('evento') || titleLower.includes('reserva')) return 'evento';
  if (titleLower.includes('venda') || titleLower.includes('contrato') || titleLower.includes('proposta')) return 'venda';
  if (titleLower.includes('profissional') || titleLower.includes('monitor') || titleLower.includes('equipe')) return 'profissional';
  if (titleLower.includes('pagamento') || titleLower.includes('financeiro')) return 'pagamento';
  if (titleLower.includes('satisfação') || titleLower.includes('satisfacao') || titleLower.includes('avaliação') || titleLower.includes('avaliacao') || titleLower.includes('feedback')) return 'satisfacao';
  
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

async function processEventoSubmission(submission: JotFormSubmission, supabase: any) {
  const nome = findAnswer(submission.answers, ['nome do evento', 'evento', 'tipo de festa']);
  const cliente = findAnswer(submission.answers, ['nome', 'cliente', 'contratante', 'responsável']);
  const dataEvento = findAnswer(submission.answers, ['data do evento', 'data da festa', 'quando']);
  const tipoEvento = findAnswer(submission.answers, ['tipo', 'categoria']);
  const observacoes = findAnswer(submission.answers, ['observações', 'observacoes', 'detalhes', 'comentários']);
  
  if (!nome || !cliente) return;
  
  const { error } = await supabase.from('eventos').upsert({
    jotform_submission_id: submission.id,
    nome: nome,
    cliente: cliente,
    data_evento: parseDate(dataEvento),
    tipo_evento: tipoEvento?.toLowerCase().includes('casamento') ? 'casamento' :
                 tipoEvento?.toLowerCase().includes('aniversário') || tipoEvento?.toLowerCase().includes('aniversario') ? 'aniversario' :
                 tipoEvento?.toLowerCase().includes('corporativo') ? 'corporativo' :
                 tipoEvento?.toLowerCase().includes('formatura') ? 'formatura' : 'outro',
    status: 'confirmado',
    observacoes: observacoes,
    formulario_origem: submission.form_id
  }, {
    onConflict: 'jotform_submission_id'
  });
  
  if (error) console.error('Erro ao processar evento:', error);
}

async function processVendaSubmission(submission: JotFormSubmission, supabase: any) {
  const valorTotal = findAnswer(submission.answers, ['valor total', 'valor', 'preço']);
  const valorRecebido = findAnswer(submission.answers, ['valor recebido', 'pago', 'entrada']);
  const dataVenda = findAnswer(submission.answers, ['data', 'data da venda', 'data do contrato']);
  
  if (!valorTotal) return;
  
  const total = parseNumber(valorTotal);
  const recebido = parseNumber(valorRecebido);
  
  const statusPagamento = recebido >= total ? 'pago' :
                          recebido > 0 ? 'parcial' : 'pendente';
  
  const { error } = await supabase.from('vendas').upsert({
    jotform_submission_id: submission.id,
    valor_total: total,
    valor_recebido: recebido,
    status_pagamento: statusPagamento,
    data_venda: parseDate(dataVenda)
  }, {
    onConflict: 'jotform_submission_id'
  });
  
  if (error) console.error('Erro ao processar venda:', error);
}

async function processProfissionalSubmission(submission: JotFormSubmission, supabase: any) {
  const nome = findAnswer(submission.answers, ['nome', 'nome completo', 'profissional']);
  const funcao = findAnswer(submission.answers, ['função', 'funcao', 'cargo', 'especialidade']);
  const telefone = findAnswer(submission.answers, ['telefone', 'celular', 'whatsapp', 'contato']);
  const email = findAnswer(submission.answers, ['email', 'e-mail']);
  const valorPadrao = findAnswer(submission.answers, ['valor', 'cachê', 'cache', 'preço']);
  
  if (!nome || !funcao) return;
  
  let valor = parseNumber(valorPadrao);
  if (valor > 99999999.99) valor = 99999999.99;
  
  const { error } = await supabase.from('profissionais').upsert({
    jotform_submission_id: submission.id,
    nome: nome,
    funcao: funcao,
    telefone: telefone,
    email: email,
    valor_padrao: valor || null,
    ativo: true
  }, {
    onConflict: 'jotform_submission_id'
  });
  
  if (error) console.error('Erro ao processar profissional:', error);
}

async function processPagamentoSubmission(submission: JotFormSubmission, supabase: any) {
  const valor = findAnswer(submission.answers, ['valor', 'valor do pagamento']);
  const dataPagamento = findAnswer(submission.answers, ['data', 'data do pagamento']);
  const metodo = findAnswer(submission.answers, ['método', 'metodo', 'forma de pagamento']);
  const observacoes = findAnswer(submission.answers, ['observações', 'observacoes', 'detalhes']);
  
  if (!valor) return;
  
  const { error } = await supabase.from('pagamentos').upsert({
    jotform_submission_id: submission.id,
    valor: parseNumber(valor),
    data_pagamento: parseDate(dataPagamento),
    metodo_pagamento: metodo,
    observacoes: observacoes
  }, {
    onConflict: 'jotform_submission_id'
  });
  
  if (error) console.error('Erro ao processar pagamento:', error);
}

async function processSatisfacaoSubmission(submission: JotFormSubmission, supabase: any) {
  const nota = findAnswer(submission.answers, ['nota', 'avaliação', 'avaliacao', 'satisfação', 'satisfacao', 'estrelas']);
  const comentario = findAnswer(submission.answers, ['comentário', 'comentario', 'feedback', 'sugestão', 'sugestao', 'observações']);
  const dataAvaliacao = findAnswer(submission.answers, ['data']);
  
  if (!nota) return;
  
  const { error } = await supabase.from('satisfacao').upsert({
    jotform_submission_id: submission.id,
    nota: parseNumber(nota, 0),
    comentario: comentario,
    data_avaliacao: parseDate(dataAvaliacao)
  }, {
    onConflict: 'jotform_submission_id'
  });
  
  if (error) console.error('Erro ao processar satisfação:', error);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const jotformApiKey = Deno.env.get('JOTFORM');
    
    if (!jotformApiKey) {
      throw new Error('JOTFORM API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar todos os formulários
    const formsResponse = await fetch(`https://api.jotform.com/user/forms?apiKey=${jotformApiKey}`);
    const formsData = await formsResponse.json();
    
    if (formsData.responseCode !== 200) {
      throw new Error('Failed to fetch forms from JotForm');
    }

    const forms: JotFormForm[] = formsData.content;
    const results = {
      eventos: 0,
      vendas: 0,
      profissionais: 0,
      pagamentos: 0,
      satisfacao: 0,
      errors: [] as string[]
    };

    // Processar cada formulário
    for (const form of forms) {
      if (form.status !== 'ENABLED') continue;
      
      const formType = detectFormType(form.title);
      if (!formType) continue;

      console.log(`Processing form: ${form.title} (${formType})`);

      // Buscar submissões do formulário
      const submissionsResponse = await fetch(
        `https://api.jotform.com/form/${form.id}/submissions?apiKey=${jotformApiKey}&limit=100`
      );
      const submissionsData = await submissionsResponse.json();
      
      if (submissionsData.responseCode !== 200) {
        results.errors.push(`Failed to fetch submissions for form ${form.id}`);
        continue;
      }

      const submissions: JotFormSubmission[] = submissionsData.content;

      // Processar cada submissão baseado no tipo
      for (const submission of submissions) {
        try {
          switch (formType) {
            case 'evento':
              await processEventoSubmission(submission, supabase);
              results.eventos++;
              break;
            case 'venda':
              await processVendaSubmission(submission, supabase);
              results.vendas++;
              break;
            case 'profissional':
              await processProfissionalSubmission(submission, supabase);
              results.profissionais++;
              break;
            case 'pagamento':
              await processPagamentoSubmission(submission, supabase);
              results.pagamentos++;
              break;
            case 'satisfacao':
              await processSatisfacaoSubmission(submission, supabase);
              results.satisfacao++;
              break;
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          results.errors.push(`Error processing submission ${submission.id}: ${errorMsg}`);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Sync error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
