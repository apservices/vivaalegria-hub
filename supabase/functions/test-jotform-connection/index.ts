const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const jotformApiKey = Deno.env.get('JOTFORM');
    if (!jotformApiKey) {
      throw new Error('JotForm API key not configured');
    }

    console.log('Testing JotForm connection...');

    // Test connection to JotForm API
    const response = await fetch(
      `https://api.jotform.com/user?apiKey=${jotformApiKey}`
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          success: false,
          connected: false,
          error: 'Invalid API key or connection failed'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const data = await response.json();
    const connected = data.responseCode === 200;

    console.log(`JotForm connection test: ${connected ? 'SUCCESS' : 'FAILED'}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        connected
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error testing JotForm connection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false,
        connected: false,
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
