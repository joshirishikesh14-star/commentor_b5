import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { memberId, workspaceId, amount = 1000 } = await req.json();

    if (!memberId || !workspaceId) {
      throw new Error('Missing required fields');
    }

    const razorpayKeyId = Deno.env.get('VITE_RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    const orderData = {
      amount: amount,
      currency: 'USD',
      receipt: `receipt_${memberId}_${Date.now()}`,
      notes: {
        memberId,
        workspaceId,
      },
    };

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Razorpay API error:', errorText);
      throw new Error('Failed to create Razorpay order');
    }

    const order = await response.json();

    const billingPeriodStart = new Date();
    const billingPeriodEnd = new Date();
    billingPeriodEnd.setMonth(billingPeriodEnd.getMonth() + 1);

    const { error: insertError } = await supabase
      .from('member_billing_history')
      .insert({
        workspace_id: workspaceId,
        member_id: memberId,
        razorpay_order_id: order.id,
        amount: amount / 100,
        currency: 'USD',
        status: 'pending',
        billing_period_start: billingPeriodStart.toISOString(),
        billing_period_end: billingPeriodEnd.toISOString(),
      });

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to create billing record');
    }

    return new Response(
      JSON.stringify({
        success: true,
        order,
        keyId: razorpayKeyId,
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
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});