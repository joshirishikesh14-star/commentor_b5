import { useState, useEffect } from 'react';
import { Tag, Plus, X, Percent, DollarSign, Calendar, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { createCouponCode, listCoupons, updateCouponStatus } from '../lib/razorpay';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: string;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

export function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    valid_until: '',
    max_uses: ''
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    setLoading(true);
    const { data } = await listCoupons();
    if (data) {
      setCoupons(data);
    }
    setLoading(false);
  }

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.code.trim()) {
      alert('Please enter a coupon code');
      return;
    }

    const discountValue = parseFloat(formData.discount_value);
    if (isNaN(discountValue) || discountValue <= 0) {
      alert('Please enter a valid discount value');
      return;
    }

    if (formData.discount_type === 'percentage' && discountValue > 100) {
      alert('Percentage discount cannot exceed 100%');
      return;
    }

    const { error } = await createCouponCode({
      code: formData.code.toUpperCase().trim(),
      discount_type: formData.discount_type,
      discount_value: discountValue,
      valid_until: formData.valid_until || undefined,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : undefined
    });

    if (error) {
      alert('Failed to create coupon. Code may already exist.');
      return;
    }

    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: '',
      valid_until: '',
      max_uses: ''
    });
    setShowCreateForm(false);
    loadCoupons();
  }

  async function toggleCouponStatus(couponId: string, currentStatus: boolean) {
    await updateCouponStatus(couponId, !currentStatus);
    loadCoupons();
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-slate-600">Loading coupons...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Coupon Codes</h3>
          <p className="text-sm text-slate-600 mt-1">
            Create and manage discount codes for member billing
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
        >
          {showCreateForm ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Create Coupon
            </>
          )}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateCoupon} className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Coupon Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SAVE20"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Discount Type
              </label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Discount Value
              </label>
              <div className="relative">
                {formData.discount_type === 'percentage' ? (
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                ) : (
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                )}
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  placeholder={formData.discount_type === 'percentage' ? '20' : '5.00'}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Valid Until (Optional)
              </label>
              <input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Max Uses (Optional)
              </label>
              <input
                type="number"
                value={formData.max_uses}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                placeholder="Unlimited"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Create Coupon
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-200">
        {coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">No coupons yet</p>
            <p className="text-sm text-slate-500">Create your first coupon to offer discounts</p>
          </div>
        ) : (
          coupons.map((coupon) => (
            <div key={coupon.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg font-mono font-bold text-lg">
                      <Tag className="w-4 h-4" />
                      {coupon.code}
                    </div>
                    {coupon.is_active ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        INACTIVE
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      {coupon.discount_type === 'percentage' ? (
                        <>
                          <Percent className="w-4 h-4" />
                          <span>{coupon.discount_value}% off</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4" />
                          <span>${coupon.discount_value.toFixed(2)} off</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Valid until: {formatDate(coupon.valid_until)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-4 h-4" />
                      <span>
                        Used: {coupon.current_uses}
                        {coupon.max_uses ? ` / ${coupon.max_uses}` : ' (unlimited)'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                  className={`p-2 rounded-lg transition-colors ${
                    coupon.is_active
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title={coupon.is_active ? 'Deactivate' : 'Activate'}
                >
                  {coupon.is_active ? (
                    <ToggleRight className="w-6 h-6" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
