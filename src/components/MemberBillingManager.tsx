import { useState, useEffect } from 'react';
import { DollarSign, Check, X, Calendar, CreditCard, Tag, Plus } from 'lucide-react';
import {
  getWorkspaceMembers,
  updateMemberPaymentStatus,
  validateCoupon,
  initializeRazorpay,
  createBillingRecord,
  DEFAULT_MONTHLY_COST
} from '../lib/razorpay';

interface Member {
  id: string;
  user_id: string;
  role: string;
  is_paid: boolean;
  payment_status: 'unpaid' | 'paid' | 'overdue' | 'trial';
  monthly_cost: number;
  next_billing_date: string | null;
  joined_at: string;
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

interface MemberBillingManagerProps {
  workspaceId: string;
  isAdmin: boolean;
}

export function MemberBillingManager({ workspaceId, isAdmin }: MemberBillingManagerProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [discount, setDiscount] = useState<{ valid: boolean; discount_amount: number; final_amount: number } | null>(null);

  useEffect(() => {
    loadMembers();
  }, [workspaceId]);

  async function loadMembers() {
    setLoading(true);
    const { data, error } = await getWorkspaceMembers(workspaceId);
    if (data) {
      setMembers(data as Member[]);
    }
    setLoading(false);
  }

  async function handleApplyCoupon(memberId: string, amount: number) {
    if (!couponCode.trim()) {
      alert('Please enter a coupon code');
      return;
    }

    const result = await validateCoupon(couponCode, amount);
    if (result.valid) {
      setDiscount({
        valid: true,
        discount_amount: result.discount_amount,
        final_amount: result.final_amount
      });
    } else {
      alert(result.error || 'Invalid coupon code');
      setDiscount(null);
    }
  }

  async function handlePaymentSuccess(
    memberId: string,
    response: { razorpay_payment_id: string; razorpay_order_id: string }
  ) {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const billingStart = new Date();
    const billingEnd = new Date();
    billingEnd.setMonth(billingEnd.getMonth() + 1);

    await createBillingRecord({
      workspace_id: workspaceId,
      member_id: memberId,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_order_id: response.razorpay_order_id,
      amount: discount?.final_amount || member.monthly_cost,
      status: 'completed',
      coupon_code: couponCode || undefined,
      discount_amount: discount?.discount_amount || 0,
      billing_period_start: billingStart.toISOString(),
      billing_period_end: billingEnd.toISOString()
    });

    await updateMemberPaymentStatus(memberId, true, 'paid');

    setDiscount(null);
    setCouponCode('');
    setSelectedMember(null);
    loadMembers();

    alert('Payment successful!');
  }

  async function handleInitiatePayment(memberId: string) {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const amount = discount?.final_amount || member.monthly_cost;

    initializeRazorpay({
      amount,
      memberId,
      workspaceId,
      description: `Monthly subscription - ${member.profiles.email}`,
      prefill: {
        name: member.profiles.full_name || undefined,
        email: member.profiles.email
      },
      onSuccess: (response) => handlePaymentSuccess(memberId, response),
      onFailure: (error) => {
        console.error('Payment failed:', error);
        alert('Payment failed. Please try again.');
      }
    });
  }

  async function togglePaidStatus(memberId: string, currentStatus: boolean) {
    if (!isAdmin) return;

    const newStatus = !currentStatus;
    await updateMemberPaymentStatus(memberId, newStatus);
    loadMembers();
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-slate-600">Loading members...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Pricing Information</h4>
            <p className="text-sm text-blue-700">
              Monthly cost: <strong>${DEFAULT_MONTHLY_COST} per member</strong> (Limited time offer)
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Members get a 14-day free trial, then billing starts automatically
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Team Members & Billing</h3>
          <p className="text-sm text-slate-600 mt-1">
            Manage member billing status and view payment information
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {members.map((member) => (
            <div key={member.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                    {member.profiles.full_name?.[0]?.toUpperCase() || member.profiles.email[0].toUpperCase()}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-900">
                        {member.profiles.full_name || member.profiles.email}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.payment_status)}`}>
                        {member.payment_status.toUpperCase()}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {member.role}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mb-3">{member.profiles.email}</p>

                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>${member.monthly_cost}/month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Next billing: {formatDate(member.next_billing_date)}</span>
                      </div>
                    </div>

                    {selectedMember === member.id && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="Enter coupon code"
                              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                            />
                          </div>
                          <button
                            onClick={() => handleApplyCoupon(member.id, member.monthly_cost)}
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                          >
                            Apply
                          </button>
                        </div>

                        {discount && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-slate-700">Original Price:</span>
                              <span className="text-slate-900">${member.monthly_cost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-green-700">Discount:</span>
                              <span className="text-green-700">-${discount.discount_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-green-200 font-semibold">
                              <span className="text-slate-900">Final Price:</span>
                              <span className="text-slate-900">${discount.final_amount.toFixed(2)}</span>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleInitiatePayment(member.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pay Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!selectedMember && member.payment_status !== 'paid' && (
                    <button
                      onClick={() => setSelectedMember(member.id)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                    >
                      Pay Now
                    </button>
                  )}

                  {selectedMember === member.id && (
                    <button
                      onClick={() => {
                        setSelectedMember(null);
                        setDiscount(null);
                        setCouponCode('');
                      }}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => togglePaidStatus(member.id, member.is_paid)}
                      className={`p-2 rounded-lg transition-colors ${
                        member.is_paid
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title={member.is_paid ? 'Mark as unpaid' : 'Mark as paid'}
                    >
                      {member.is_paid ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
