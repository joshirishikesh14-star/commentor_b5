import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: expiredMembers, error } = await supabase.rpc('flag_expired_subscriptions');

    if (error) {
      console.error('Error flagging expired subscriptions:', error);
      throw new Error('Failed to flag expired subscriptions');
    }

    const count = expiredMembers?.length || 0;

    console.log(`Flagged ${count} expired subscriptions`);

    if (count > 0) {
      console.log('Expired members:', expiredMembers);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Flagged ${count} expired subscription(s)`,
        expired_count: count,
        expired_members: expiredMembers,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});