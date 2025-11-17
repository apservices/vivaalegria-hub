import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JotFormForm {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  count: string;
  new: string;
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

    console.log('Fetching forms from JotForm...');

    // Fetch forms from JotForm API
    const response = await fetch(
      `https://api.jotform.com/user/forms?apiKey=${jotformApiKey}&limit=100`
    );

    if (!response.ok) {
      throw new Error(`JotForm API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.responseCode !== 200) {
      throw new Error('Failed to fetch forms from JotForm');
    }

    const forms: JotFormForm[] = data.content || [];
    
    console.log(`Successfully fetched ${forms.length} forms`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        forms 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error fetching JotForm forms:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
