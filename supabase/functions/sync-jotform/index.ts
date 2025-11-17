import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JotFormSubmission {
  id: string;
  form_id: string;
  created_at: string;
  updated_at: string;
  answers: Record<string, {
    answer: string | string[];
    text?: string;
    prettyFormat?: string;
  }>;
}

interface SyncRequest {
  formId: string;
  formType: 'evento' | 'venda' | 'profissional' | 'pagamento' | 'satisfacao';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const jotformApiKey = Deno.env.get('JOTFORM');
    if (!jotformApiKey) {
      throw new Error('JotForm API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { formId, formType } = await req.json() as SyncRequest;

    console.log(`Syncing form ${formId} of type ${formType}`);

    // Fetch submissions from JotForm
    const jotformUrl = `https://api.jotform.com/form/${formId}/submissions?apiKey=${jotformApiKey}`;
    const response = await fetch(jotformUrl);
    
    if (!response.ok) {
      throw new Error(`JotForm API error: ${response.statusText}`);
    }

    const data = await response.json();
    const submissions: JotFormSubmission[] = data.content || [];

    console.log(`Found ${submissions.length} submissions for form ${formId}`);

    let processedCount = 0;

    // Process each submission based on form type
    for (const submission of submissions) {
      try {
        switch (formType) {
          case 'evento':
            await processEventoSubmission(supabase, submission, formId);
            break;
          case 'venda':
            await processVendaSubmission(supabase, submission, formId);
            break;
          case 'profissional':
            await processProfissionalSubmission(supabase, submission, formId);
            break;
          case 'pagamento':
            await processPagamentoSubmission(supabase, submission, formId);
            break;
          case 'satisfacao':
            await processSatisfacaoSubmission(supabase, submission, formId);
            break;
        }
        processedCount++;
      } catch (error) {
        console.error(`Error processing submission ${submission.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        total: submissions.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in sync-jotform function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function processEventoSubmission(supabase: any, submission: JotFormSubmission, formId: string) {
  const answers = submission.answers;
  
  // Auto-detect fields by iterating through all answers
  let nome = 'Evento sem nome';
  let cliente = 'Cliente não informado';
  let dataEvento = new Date().toISOString();
  let tipoEvento = 'outro';
  let observacoes = '';
  
  // Iterate through all answers to find relevant fields
  for (const [key, answer] of Object.entries(answers)) {
    const text = getAnswerText(answers, [key]) || '';
    const textLower = text.toLowerCase();
    
    // Detect event name (usually first text field or contains "evento", "nome")
    if (!nome || nome === 'Evento sem nome') {
      if (textLower.includes('evento') || textLower.length > 10) {
        nome = text;
      }
    }
    
    // Detect client name (contains "cliente", "contratante", "nome")
    if (textLower.includes('cliente') || textLower.includes('contratante')) {
      cliente = text;
    }
    
    // Detect date (date fields or text with date format)
    if (answer.answer && typeof answer.answer === 'object' && 'year' in answer.answer) {
      try {
        const dateObj = answer.answer as any;
        dataEvento = `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}T00:00:00Z`;
      } catch (e) {
        console.log('Error parsing date:', e);
      }
    } else if (text.match(/\d{2}\/\d{2}\/\d{4}/)) {
      // Format DD/MM/YYYY
      const [day, month, year] = text.split('/');
      dataEvento = `${year}-${month}-${day}T00:00:00Z`;
    }
    
    // Detect event type
    if (textLower.includes('casamento') || textLower.includes('wedding')) {
      tipoEvento = 'casamento';
    } else if (textLower.includes('aniversário') || textLower.includes('aniversario') || textLower.includes('birthday')) {
      tipoEvento = 'aniversario';
    } else if (textLower.includes('corporativo') || textLower.includes('empresa')) {
      tipoEvento = 'corporativo';
    } else if (textLower.includes('formatura')) {
      tipoEvento = 'formatura';
    }
    
    // Detect observations (usually last text field or contains "observ")
    if (textLower.includes('observ') || textLower.includes('detalhes') || textLower.includes('comentário')) {
      observacoes = text;
    }
  }

  // Check if already exists
  const { data: existing } = await supabase
    .from('eventos')
    .select('id')
    .eq('jotform_submission_id', submission.id)
    .single();

  if (existing) {
    console.log(`Event ${submission.id} already exists, skipping`);
    return;
  }

  const { error } = await supabase.from('eventos').insert({
    nome,
    cliente,
    data_evento: dataEvento,
    tipo_evento: tipoEvento,
    formulario_origem: formId,
    jotform_submission_id: submission.id,
    status: 'pendente',
    observacoes,
  });

  if (error) {
    console.error('Error inserting evento:', error);
    throw error;
  }
}

async function processVendaSubmission(supabase: any, submission: JotFormSubmission, formId: string) {
  const answers = submission.answers;
  
  let valorTotal = 0;
  let valorRecebido = 0;
  
  // Auto-detect value fields
  for (const [key, answer] of Object.entries(answers)) {
    const text = getAnswerText(answers, [key]) || '';
    const textLower = text.toLowerCase();
    
    // Try to parse numeric values
    const numValue = parseFloat(text.replace(/[^\d.,]/g, '').replace(',', '.'));
    
    if (!isNaN(numValue) && numValue > 0) {
      if (textLower.includes('total') || textLower.includes('valor') || valorTotal === 0) {
        valorTotal = numValue;
      }
      if (textLower.includes('recebido') || textLower.includes('pago')) {
        valorRecebido = numValue;
      }
    }
  }

  // Check if already exists
  const { data: existing } = await supabase
    .from('vendas')
    .select('id')
    .eq('jotform_submission_id', submission.id)
    .single();

  if (existing) {
    console.log(`Sale ${submission.id} already exists, skipping`);
    return;
  }

  const statusPagamento = valorRecebido >= valorTotal ? 'pago' : 
                         valorRecebido > 0 ? 'parcial' : 'pendente';

  const { error } = await supabase.from('vendas').insert({
    valor_total: valorTotal,
    valor_recebido: valorRecebido,
    status_pagamento: statusPagamento,
    jotform_submission_id: submission.id,
    data_venda: submission.created_at,
  });

  if (error) {
    console.error('Error inserting venda:', error);
    throw error;
  }
}

async function processProfissionalSubmission(supabase: any, submission: JotFormSubmission, formId: string) {
  const answers = submission.answers;
  
  let nome = 'Profissional sem nome';
  let funcao = 'Função não informada';
  let telefone = '';
  let email = '';
  let valorPadrao = 0;
  
  // Auto-detect professional fields
  for (const [key, answer] of Object.entries(answers)) {
    const text = getAnswerText(answers, [key]) || '';
    const textLower = text.toLowerCase();
    
    // Detect name
    if ((textLower.includes('nome') || textLower.length > 5) && !textLower.includes('@')) {
      if (nome === 'Profissional sem nome') {
        nome = text;
      }
    }
    
    // Detect function/role
    if (textLower.includes('função') || textLower.includes('cargo') || textLower.includes('profissão')) {
      funcao = text;
    }
    
    // Detect phone (contains numbers and parentheses/dashes)
    if (text.match(/\(?\d{2,}\)?[\s-]?\d{4,}/)) {
      telefone = text;
    }
    
    // Detect email
    if (text.includes('@') && text.includes('.')) {
      email = text;
    }
    
    // Detect value
    const numValue = parseFloat(text.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!isNaN(numValue) && numValue > 0 && numValue < 99999999.99) {
      if (textLower.includes('valor') || textLower.includes('preço') || textLower.includes('preco')) {
        valorPadrao = numValue;
      }
    }
  }

  // Check if already exists
  const { data: existing } = await supabase
    .from('profissionais')
    .select('id')
    .eq('jotform_submission_id', submission.id)
    .single();

  if (existing) {
    console.log(`Professional ${submission.id} already exists, skipping`);
    return;
  }

  const { error } = await supabase.from('profissionais').insert({
    nome,
    funcao,
    telefone,
    email,
    valor_padrao: valorPadrao,
    jotform_submission_id: submission.id,
    ativo: true,
  });

  if (error) {
    console.error('Error inserting profissional:', error);
    throw error;
  }
}

async function processPagamentoSubmission(supabase: any, submission: JotFormSubmission, formId: string) {
  const answers = submission.answers;
  
  let valor = 0;
  let dataPagamento = submission.created_at;
  let metodoPagamento = '';
  let observacoes = '';
  
  // Auto-detect payment fields
  for (const [key, answer] of Object.entries(answers)) {
    const text = getAnswerText(answers, [key]) || '';
    const textLower = text.toLowerCase();
    
    // Detect value
    const numValue = parseFloat(text.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!isNaN(numValue) && numValue > 0) {
      valor = numValue;
    }
    
    // Detect payment method
    if (textLower.includes('pix') || textLower.includes('cartão') || textLower.includes('dinheiro') || textLower.includes('transferência')) {
      metodoPagamento = text;
    }
    
    // Detect date
    if (answer.answer && typeof answer.answer === 'object' && 'year' in answer.answer) {
      try {
        const dateObj = answer.answer as any;
        dataPagamento = `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}T00:00:00Z`;
      } catch (e) {
        console.log('Error parsing date:', e);
      }
    }
    
    // Detect observations
    if (textLower.includes('observ') || textLower.includes('nota')) {
      observacoes = text;
    }
  }

  // Check if already exists
  const { data: existing } = await supabase
    .from('pagamentos')
    .select('id')
    .eq('jotform_submission_id', submission.id)
    .single();

  if (existing) {
    console.log(`Payment ${submission.id} already exists, skipping`);
    return;
  }

  const { error } = await supabase.from('pagamentos').insert({
    valor,
    data_pagamento: dataPagamento,
    metodo_pagamento: metodoPagamento,
    observacoes,
    jotform_submission_id: submission.id,
  });

  if (error) {
    console.error('Error inserting pagamento:', error);
    throw error;
  }
}

async function processSatisfacaoSubmission(supabase: any, submission: JotFormSubmission, formId: string) {
  const answers = submission.answers;
  
  let nota = 3;
  let comentario = '';
  
  // Auto-detect satisfaction fields
  for (const [key, answer] of Object.entries(answers)) {
    const text = getAnswerText(answers, [key]) || '';
    const textLower = text.toLowerCase();
    
    // Detect rating (1-5 or 1-10)
    const numValue = parseInt(text);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
      nota = numValue <= 5 ? numValue : Math.round(numValue / 2); // Convert 1-10 to 1-5
    }
    
    // Detect comment (longer text fields)
    if (text.length > 20 || textLower.includes('comentário') || textLower.includes('feedback')) {
      comentario = text;
    }
  }

  // Check if already exists
  const { data: existing } = await supabase
    .from('satisfacao')
    .select('id')
    .eq('jotform_submission_id', submission.id)
    .single();

  if (existing) {
    console.log(`Satisfaction ${submission.id} already exists, skipping`);
    return;
  }

  const { error } = await supabase.from('satisfacao').insert({
    nota: Math.max(1, Math.min(5, nota)), // Ensure nota is between 1-5
    comentario,
    data_avaliacao: submission.created_at,
    jotform_submission_id: submission.id,
  });

  if (error) {
    console.error('Error inserting satisfacao:', error);
    throw error;
  }
}

// Helper functions
function getAnswerText(answers: Record<string, any>, possibleIds: string[]): string | null {
  for (const id of possibleIds) {
    if (answers[id]) {
      const answer = answers[id];
      if (typeof answer.answer === 'string') {
        return answer.answer;
      }
      if (Array.isArray(answer.answer)) {
        return answer.answer.join(', ');
      }
      if (answer.text) {
        return answer.text;
      }
      if (answer.prettyFormat) {
        return answer.prettyFormat;
      }
    }
  }
  return null;
}

function mapTipoEvento(tipo: string | null): string {
  if (!tipo) return 'outro';
  
  const tipoLower = tipo.toLowerCase();
  if (tipoLower.includes('casamento')) return 'casamento';
  if (tipoLower.includes('aniversário') || tipoLower.includes('aniversario')) return 'aniversario';
  if (tipoLower.includes('corporativo') || tipoLower.includes('empresa')) return 'corporativo';
  if (tipoLower.includes('formatura')) return 'formatura';
  
  return 'outro';
}
