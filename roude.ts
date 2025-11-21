import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const JOTFORM_API_KEY = 'dab6828eb9d008c597f3f24b38679a68';
const FORM_ID = '243466215987670';

export async function GET() {
  const res = await fetch(`https://api.jotform.com/form/${FORM_ID}/submissions?apiKey=${JOTFORM_API_KEY}`);
  const data = await res.json();

  if (!data.response || data.response !== '200') {
    return NextResponse.json({ error: 'Erro Jotform' }, { status: 500 });
  }

  const submissions = data.content;

  for (const sub of submissions) {
    const answers = sub.answers;
    const getAnswer = (qid: string) => answers[qid]?.answer || '';

    await supabase.from('inscricoes').upsert({
      nome: getAnswer('3') || getAnswer('2'), // ajusta conforme seu form
      telefone: getAnswer('4'),
      email: getAnswer('5'),
      evento: getAnswer('6'),
      profissional: getAnswer('7'),
      fonte: getAnswer('8'),
      status: getAnswer('9')?.includes('Sim') ? 'confirmado' : 'pendente',
      pago: getAnswer('9')?.includes('Sim'),
      created_at: sub.created_at,
    }, { onConflict: 'id' });
  }

  return NextResponse.json({ success: true, imported: submissions.length });
}
