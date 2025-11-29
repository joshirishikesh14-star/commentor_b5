import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import { createHmac } from 'node:crypto';

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, memberId, workspaceId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error('Missing required payment fields');
    }

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeySecret) {
      throw new Error('Razorpay key secret not configured');
    }

    const expectedSignature = createHmac('sha256', razorpayKeySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature');
    }

    const { error: updateBillingError } = await supabase
      .from('member_billing_history')
      .update({
        razorpay_payment_id,
        status: 'completed',
      })
      .eq('razorpay_order_id', razorpay_order_id);

    if (updateBillingError) {
      console.error('Failed to update billing history:', updateBillingError);
      throw new Error('Failed to update billing record');
    }

    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const { error: updateMemberError } = await supabase
      .from('workspace_members')
      .update({
        is_paid: true,
        payment_status: 'paid',
        next_billing_date: nextBillingDate.toISOString(),
      })
      .eq('id', memberId);

    if (updateMemberError) {
      console.error('Failed to update member status:', updateMemberError);
      throw new Error('Failed to update member status');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment verified successfully',
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