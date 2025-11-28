import { supabase } from './supabase';

export interface RazorpayConfig {
  key_id: string;
  currency: string;
  amount: number;
}

export interface MemberBilling {
  member_id: string;
  workspace_id: string;
  amount: number;
  coupon_code?: string;
}

export interface CouponCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: string;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
}

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
export const DEFAULT_MONTHLY_COST = 5.00;

export async function validateCoupon(code: string, amount: number) {
  try {
    const { data, error } = await supabase.rpc('validate_coupon', {
      p_code: code,
      p_amount: amount
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, error: 'Failed to validate coupon' };
  }
}

export async function applyCoupon(code: string) {
  try {
    const { error } = await supabase.rpc('use_coupon', {
      p_code: code
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error applying coupon:', error);
    return { success: false, error: 'Failed to apply coupon' };
  }
}

export async function createCouponCode(coupon: {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_until?: string;
  max_uses?: number;
}) {
  try {
    const { data, error } = await supabase
      .from('coupon_codes')
      .insert({
        ...coupon,
        current_uses: 0,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating coupon:', error);
    return { data: null, error };
  }
}

export async function listCoupons() {
  try {
    const { data, error } = await supabase
      .from('coupon_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error listing coupons:', error);
    return { data: null, error };
  }
}

export async function updateCouponStatus(couponId: string, isActive: boolean) {
  try {
    const { error } = await supabase
      .from('coupon_codes')
      .update({ is_active: isActive })
      .eq('id', couponId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating coupon:', error);
    return { success: false, error };
  }
}

export async function updateMemberPaymentStatus(
  memberId: string,
  isPaid: boolean,
  paymentStatus?: 'unpaid' | 'paid' | 'overdue' | 'trial'
) {
  try {
    const { error } = await supabase.rpc('update_member_payment_status', {
      p_member_id: memberId,
      p_is_paid: isPaid,
      p_payment_status: paymentStatus || null
    });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating member payment status:', error);
    return { success: false, error };
  }
}

export async function createBillingRecord(billing: {
  workspace_id: string;
  member_id: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  amount: number;
  currency?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  coupon_code?: string;
  discount_amount?: number;
  billing_period_start: string;
  billing_period_end: string;
}) {
  try {
    const { data, error } = await supabase
      .from('member_billing_history')
      .insert({
        ...billing,
        currency: billing.currency || 'USD',
        discount_amount: billing.discount_amount || 0
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating billing record:', error);
    return { data: null, error };
  }
}

export async function getMemberBillingHistory(memberId: string) {
  try {
    const { data, error } = await supabase
      .from('member_billing_history')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting billing history:', error);
    return { data: null, error };
  }
}

export async function getWorkspaceBillingHistory(workspaceId: string) {
  try {
    const { data, error } = await supabase
      .from('member_billing_history')
      .select(`
        *,
        workspace_members!member_id (
          user_id,
          role,
          profiles!user_id (
            full_name,
            email
          )
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting workspace billing history:', error);
    return { data: null, error };
  }
}

export function initializeRazorpay(options: {
  amount: number;
  currency?: string;
  orderId: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure: (error: Error) => void;
}) {
  if (!RAZORPAY_KEY_ID) {
    console.error('Razorpay Key ID not configured');
    options.onFailure(new Error('Payment gateway not configured'));
    return;
  }

  const razorpayOptions = {
    key: RAZORPAY_KEY_ID,
    amount: Math.round(options.amount * 100),
    currency: options.currency || 'USD',
    name: 'Echo',
    description: options.description,
    order_id: options.orderId,
    prefill: options.prefill,
    theme: {
      color: '#0F172A'
    },
    handler: (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
      options.onSuccess(response);
    },
    modal: {
      ondismiss: () => {
        options.onFailure(new Error('Payment cancelled by user'));
      }
    }
  };

  const rzp = new (window as any).Razorpay(razorpayOptions);
  rzp.on('payment.failed', (response: { error: { description: string } }) => {
    options.onFailure(new Error(response.error.description));
  });

  rzp.open();
}

export async function getWorkspaceMembers(workspaceId: string) {
  try {
    const { data, error } = await supabase
      .from('workspace_members')
      .select(`
        *,
        profiles!user_id (
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('workspace_id', workspaceId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error getting workspace members:', error);
    return { data: null, error };
  }
}
