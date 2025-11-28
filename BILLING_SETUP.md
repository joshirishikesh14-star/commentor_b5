# Member Billing & Razorpay Integration Guide

## Overview

Echo now supports per-member monthly billing with Razorpay integration. Each workspace member has their own billing cycle and payment status.

## Pricing

- **Monthly Cost**: $5 USD per member (limited time offer)
- **Trial Period**: 14 days free trial for all new members
- **Billing Cycle**: Monthly recurring payments

## Features

### 1. Per-Member Billing
- Each member has independent billing status
- Automatic trial period (14 days)
- Monthly recurring payments
- Flexible pricing (can be customized per member)

### 2. Payment Status
Members can have one of these statuses:
- **trial**: Member is in 14-day free trial
- **paid**: Member has active paid subscription
- **unpaid**: Payment is required
- **overdue**: Payment is past due

### 3. Coupon Codes
Create discount codes with:
- **Percentage discounts** (e.g., 20% off)
- **Fixed amount discounts** (e.g., $2 off)
- Expiration dates
- Usage limits
- Active/inactive toggle

### 4. Workspace Admin Controls
- View all member billing status
- Manually mark members as paid/unpaid
- Access billing history
- Manage coupon codes

## Razorpay Setup

### 1. Create Razorpay Account
1. Go to https://razorpay.com and sign up
2. Complete KYC verification
3. Navigate to Settings > API Keys
4. Generate API keys (Key ID and Key Secret)

### 2. Configure Environment Variables

Add your Razorpay Key ID to `.env`:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

> **Important**: Use Test keys for development, Live keys for production

### 3. Webhook Setup (Optional)

For automated payment status updates, configure webhooks:

1. Go to Razorpay Dashboard > Webhooks
2. Add webhook URL: `https://your-domain.com/api/razorpay-webhook`
3. Select events:
   - payment.captured
   - payment.failed
   - subscription.charged
   - subscription.cancelled

## Database Schema

### workspace_members
Added billing fields:
- `is_paid` (boolean) - Payment status flag
- `payment_status` (text) - Current status
- `razorpay_subscription_id` (text) - Razorpay reference
- `billing_starts_at` (timestamptz) - Billing start date
- `next_billing_date` (timestamptz) - Next billing cycle
- `monthly_cost` (numeric) - Cost per month

### coupon_codes
New table for discount management:
- `code` (text) - Unique coupon code
- `discount_type` (text) - 'percentage' or 'fixed'
- `discount_value` (numeric) - Discount amount
- `valid_from` (timestamptz) - Start date
- `valid_until` (timestamptz) - End date
- `max_uses` (integer) - Usage limit
- `current_uses` (integer) - Usage count
- `is_active` (boolean) - Active status

### member_billing_history
Payment transaction records:
- `razorpay_payment_id` (text) - Payment ID
- `razorpay_order_id` (text) - Order ID
- `amount` (numeric) - Payment amount
- `status` (text) - Transaction status
- `coupon_code` (text) - Applied coupon
- `discount_amount` (numeric) - Discount applied
- `billing_period_start/end` (timestamptz) - Billing period

## Usage

### For Members (End Users)

1. **View Billing Status**
   - Go to workspace settings
   - Check payment status and next billing date
   - View billing history

2. **Make Payment**
   - Click "Pay Now" button
   - (Optional) Enter coupon code
   - Complete Razorpay checkout
   - Payment is automatically processed

3. **Apply Coupon Code**
   - Enter coupon code before payment
   - Click "Apply" to validate
   - See discounted price
   - Proceed with payment

### For Workspace Admins

1. **Manage Members**
   - View all member billing status
   - Manually mark members as paid/unpaid
   - View billing history for all members

2. **Create Coupon Codes**
   - Navigate to Coupon Management
   - Click "Create Coupon"
   - Set discount type and value
   - Configure expiration and usage limits
   - Activate/deactivate as needed

3. **Monitor Billing**
   - View payment history
   - Track trial expirations
   - Identify overdue payments

## Integration Components

### MemberBillingManager
Component for managing member billing:
```tsx
import { MemberBillingManager } from '../components/MemberBillingManager';

<MemberBillingManager
  workspaceId={workspaceId}
  isAdmin={isAdmin}
/>
```

### CouponManager
Component for managing coupon codes:
```tsx
import { CouponManager } from '../components/CouponManager';

<CouponManager />
```

## API Functions

### Razorpay Integration
```typescript
import { initializeRazorpay, validateCoupon, updateMemberPaymentStatus } from '../lib/razorpay';

// Initialize payment
initializeRazorpay({
  amount: 5.00,
  orderId: 'order_123',
  description: 'Monthly subscription',
  onSuccess: (response) => {
    // Handle success
  },
  onFailure: (error) => {
    // Handle failure
  }
});

// Validate coupon
const result = await validateCoupon('SAVE20', 5.00);
if (result.valid) {
  console.log('Final amount:', result.final_amount);
}

// Update member status
await updateMemberPaymentStatus(memberId, true, 'paid');
```

## Coupon Management

Yes, **coupon codes are handled in your database**, not in Razorpay. This gives you full control over:

1. Creating custom discount codes
2. Setting usage limits
3. Managing expiration dates
4. Activating/deactivating codes
5. Tracking usage analytics

Razorpay only processes the final discounted amount.

## Security

- All payment processing happens through Razorpay's secure checkout
- No card details are stored in your database
- RLS policies protect member billing data
- Admins can only view billing for their workspaces
- Members can only view their own billing history

## Testing

### Test Mode
1. Use Razorpay test keys
2. Test card numbers: https://razorpay.com/docs/payments/payments/test-card-details/
3. Example: 4111 1111 1111 1111 (any CVV, future expiry)

### Test Coupon Codes
```typescript
// Create test coupons
await createCouponCode({
  code: 'TEST20',
  discount_type: 'percentage',
  discount_value: 20,
  max_uses: 100
});
```

## Production Checklist

- [ ] Replace test Razorpay keys with live keys
- [ ] Configure webhook endpoints
- [ ] Set up payment failure notifications
- [ ] Test trial expiration flow
- [ ] Test coupon validation
- [ ] Verify billing history recording
- [ ] Set up automated payment reminders
- [ ] Configure tax settings (if applicable)

## Troubleshooting

### Payment Not Processing
- Check Razorpay key is correct
- Verify Razorpay script is loaded
- Check browser console for errors
- Ensure member has valid email

### Coupon Not Applying
- Verify coupon is active
- Check expiration date
- Ensure usage limit not exceeded
- Validate discount value format

### Billing Status Not Updating
- Check RLS policies
- Verify database functions
- Check webhook configuration
- Review error logs

## Support

For Razorpay-specific issues:
- Documentation: https://razorpay.com/docs/
- Support: https://razorpay.com/support/

For implementation questions:
- Check database migration logs
- Review component error messages
- Verify environment variables
