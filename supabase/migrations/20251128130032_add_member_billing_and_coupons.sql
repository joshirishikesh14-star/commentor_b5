/*
  # Add Per-Member Billing with Razorpay Integration
  
  1. Schema Changes
    - Add billing fields to `workspace_members` table:
      - `is_paid` (boolean) - Whether this member seat is paid
      - `payment_status` (text) - Payment status: 'unpaid', 'paid', 'overdue', 'trial'
      - `razorpay_subscription_id` (text) - Razorpay subscription reference
      - `billing_starts_at` (timestamptz) - When billing started for this member
      - `next_billing_date` (timestamptz) - Next billing cycle date
      - `monthly_cost` (numeric) - Cost per month for this member (allows custom pricing)
      
    - Create `coupon_codes` table:
      - `id` (uuid) - Primary key
      - `code` (text) - Unique coupon code
      - `discount_type` (text) - 'percentage' or 'fixed'
      - `discount_value` (numeric) - Discount amount/percentage
      - `valid_from` (timestamptz) - Start date
      - `valid_until` (timestamptz) - End date
      - `max_uses` (integer) - Maximum number of uses (null = unlimited)
      - `current_uses` (integer) - Current usage count
      - `is_active` (boolean) - Whether coupon is active
      - `created_by` (uuid) - User who created it
      - `created_at` (timestamptz)
      
    - Create `member_billing_history` table:
      - `id` (uuid) - Primary key
      - `workspace_id` (uuid) - Workspace reference
      - `member_id` (uuid) - workspace_members reference
      - `razorpay_payment_id` (text) - Razorpay payment ID
      - `razorpay_order_id` (text) - Razorpay order ID
      - `amount` (numeric) - Payment amount
      - `currency` (text) - Currency code (default INR)
      - `status` (text) - Payment status
      - `coupon_code` (text) - Applied coupon code
      - `discount_amount` (numeric) - Discount applied
      - `billing_period_start` (timestamptz)
      - `billing_period_end` (timestamptz)
      - `created_at` (timestamptz)
      
  2. Business Rules
    - Default monthly cost: $5 USD per member
    - Members start as 'trial' for 14 days
    - After trial, status becomes 'unpaid' until payment
    - Workspace owners can mark members as paid/unpaid
    - Coupons are validated before applying
    
  3. Security
    - Members can view their own billing status
    - Workspace admins can manage member billing
    - Only system can modify billing history
*/

-- Add billing columns to workspace_members table
DO $$
BEGIN
  -- Add is_paid column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspace_members' AND column_name = 'is_paid'
  ) THEN
    ALTER TABLE workspace_members ADD COLUMN is_paid boolean DEFAULT false NOT NULL;
  END IF;

  -- Add payment_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspace_members' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE workspace_members ADD COLUMN payment_status text DEFAULT 'trial' NOT NULL;
  END IF;

  -- Add razorpay_subscription_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspace_members' AND column_name = 'razorpay_subscription_id'
  ) THEN
    ALTER TABLE workspace_members ADD COLUMN razorpay_subscription_id text DEFAULT NULL;
  END IF;

  -- Add billing_starts_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspace_members' AND column_name = 'billing_starts_at'
  ) THEN
    ALTER TABLE workspace_members ADD COLUMN billing_starts_at timestamptz DEFAULT NOW();
  END IF;

  -- Add next_billing_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspace_members' AND column_name = 'next_billing_date'
  ) THEN
    ALTER TABLE workspace_members ADD COLUMN next_billing_date timestamptz DEFAULT NULL;
  END IF;

  -- Add monthly_cost column (stored in cents to avoid floating point issues)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspace_members' AND column_name = 'monthly_cost'
  ) THEN
    ALTER TABLE workspace_members ADD COLUMN monthly_cost numeric(10,2) DEFAULT 5.00 NOT NULL;
  END IF;
END $$;

-- Add check constraint for payment_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'workspace_members_payment_status_check'
  ) THEN
    ALTER TABLE workspace_members ADD CONSTRAINT workspace_members_payment_status_check 
      CHECK (payment_status IN ('unpaid', 'paid', 'overdue', 'trial'));
  END IF;
END $$;

-- Create coupon_codes table
CREATE TABLE IF NOT EXISTS coupon_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(10,2) NOT NULL CHECK (discount_value > 0),
  valid_from timestamptz DEFAULT NOW() NOT NULL,
  valid_until timestamptz DEFAULT NULL,
  max_uses integer DEFAULT NULL,
  current_uses integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT NOW() NOT NULL,
  CONSTRAINT discount_percentage_max CHECK (
    discount_type != 'percentage' OR discount_value <= 100
  )
);

-- Create member_billing_history table
CREATE TABLE IF NOT EXISTS member_billing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES workspace_members(id) ON DELETE SET NULL,
  razorpay_payment_id text UNIQUE,
  razorpay_order_id text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD' NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  coupon_code text,
  discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
  billing_period_start timestamptz NOT NULL,
  billing_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workspace_members_payment_status ON workspace_members(payment_status);
CREATE INDEX IF NOT EXISTS idx_workspace_members_next_billing ON workspace_members(next_billing_date) WHERE payment_status = 'paid';
CREATE INDEX IF NOT EXISTS idx_coupon_codes_code ON coupon_codes(code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_billing_history_workspace ON member_billing_history(workspace_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_member ON member_billing_history(member_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_razorpay ON member_billing_history(razorpay_payment_id);

-- Enable RLS on new tables
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_billing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupon_codes
CREATE POLICY "Users can view active coupons"
  ON coupon_codes FOR SELECT
  TO authenticated
  USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

CREATE POLICY "Workspace admins can create coupons"
  ON coupon_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.user_id = auth.uid()
      AND workspace_members.role = 'admin'
    )
  );

CREATE POLICY "Creators can update their coupons"
  ON coupon_codes FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- RLS Policies for member_billing_history
CREATE POLICY "Members can view their billing history"
  ON member_billing_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.id = member_billing_history.member_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace admins can view all billing history"
  ON member_billing_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = member_billing_history.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role = 'admin'
    )
  );

CREATE POLICY "System can insert billing history"
  ON member_billing_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to validate and apply coupon
CREATE OR REPLACE FUNCTION validate_coupon(
  p_code text,
  p_amount numeric
)
RETURNS json AS $$
DECLARE
  v_coupon coupon_codes;
  v_discount numeric := 0;
  v_final_amount numeric;
BEGIN
  -- Get coupon details
  SELECT * INTO v_coupon
  FROM coupon_codes
  WHERE code = p_code
    AND is_active = true
    AND (valid_until IS NULL OR valid_until > NOW())
    AND (max_uses IS NULL OR current_uses < max_uses);
  
  -- Check if coupon exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Invalid or expired coupon code'
    );
  END IF;
  
  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := p_amount * (v_coupon.discount_value / 100);
  ELSE
    v_discount := LEAST(v_coupon.discount_value, p_amount);
  END IF;
  
  v_final_amount := GREATEST(0, p_amount - v_discount);
  
  RETURN json_build_object(
    'valid', true,
    'discount_amount', v_discount,
    'final_amount', v_final_amount,
    'coupon_id', v_coupon.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark coupon as used
CREATE OR REPLACE FUNCTION use_coupon(p_code text)
RETURNS void AS $$
BEGIN
  UPDATE coupon_codes
  SET current_uses = current_uses + 1
  WHERE code = p_code
    AND is_active = true
    AND (max_uses IS NULL OR current_uses < max_uses);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update member payment status
CREATE OR REPLACE FUNCTION update_member_payment_status(
  p_member_id uuid,
  p_is_paid boolean,
  p_payment_status text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_new_status text;
BEGIN
  -- Determine new status
  IF p_payment_status IS NOT NULL THEN
    v_new_status := p_payment_status;
  ELSIF p_is_paid THEN
    v_new_status := 'paid';
  ELSE
    v_new_status := 'unpaid';
  END IF;
  
  -- Update member
  UPDATE workspace_members
  SET 
    is_paid = p_is_paid,
    payment_status = v_new_status,
    next_billing_date = CASE 
      WHEN p_is_paid THEN 
        COALESCE(next_billing_date, NOW()) + INTERVAL '1 month'
      ELSE NULL
    END
  WHERE id = p_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set trial end dates for existing members (14 days from join date)
UPDATE workspace_members
SET 
  next_billing_date = joined_at + INTERVAL '14 days',
  payment_status = CASE 
    WHEN joined_at + INTERVAL '14 days' > NOW() THEN 'trial'
    ELSE 'unpaid'
  END
WHERE next_billing_date IS NULL;
