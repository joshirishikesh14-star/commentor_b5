/*
  # Add Subscription and Billing Support

  1. Schema Changes
    - Add subscription fields to `profiles` table:
      - `subscription_plan` (text) - Plan type: 'free', 'pro', 'enterprise'
      - `subscription_status` (text) - Status: 'active', 'trial', 'expired', 'canceled'
      - `trial_ends_at` (timestamptz) - When trial expires
      - `subscription_started_at` (timestamptz) - When paid subscription started
      - `subscription_expires_at` (timestamptz) - When subscription expires
      - `stripe_customer_id` (text) - Stripe customer reference
      - `stripe_subscription_id` (text) - Stripe subscription reference

  2. Defaults
    - New users start on 'free' plan with 'active' status
    - Trial period is 14 days from signup

  3. Security
    - Users can view their own subscription status
    - Only admins can modify subscription status (handled by Stripe webhooks)
*/

-- Add subscription columns to profiles table
DO $$
BEGIN
  -- Add subscription_plan column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_plan text DEFAULT 'free' NOT NULL;
  END IF;

  -- Add subscription_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'active' NOT NULL;
  END IF;

  -- Add trial_ends_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_ends_at timestamptz DEFAULT NULL;
  END IF;

  -- Add subscription_started_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_started_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_started_at timestamptz DEFAULT NULL;
  END IF;

  -- Add subscription_expires_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_expires_at timestamptz DEFAULT NULL;
  END IF;

  -- Add stripe_customer_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id text DEFAULT NULL;
  END IF;

  -- Add stripe_subscription_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_subscription_id text DEFAULT NULL;
  END IF;
END $$;

-- Add check constraints for valid values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_subscription_plan_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_plan_check 
      CHECK (subscription_plan IN ('free', 'pro', 'enterprise'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_subscription_status_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_status_check 
      CHECK (subscription_status IN ('active', 'trial', 'expired', 'canceled', 'past_due'));
  END IF;
END $$;

-- Create index for faster subscription queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Function to automatically set trial period for new signups
CREATE OR REPLACE FUNCTION set_trial_period()
RETURNS TRIGGER AS $$
BEGIN
  -- Set trial_ends_at to 14 days from now for new free users
  IF NEW.subscription_plan = 'free' AND NEW.trial_ends_at IS NULL THEN
    NEW.trial_ends_at := NOW() + INTERVAL '14 days';
    NEW.subscription_status := 'trial';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set trial period on profile creation
DROP TRIGGER IF EXISTS on_profile_created_set_trial ON profiles;
CREATE TRIGGER on_profile_created_set_trial
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_trial_period();

-- Update existing users to have trial period if they don't have one
UPDATE profiles 
SET 
  trial_ends_at = created_at + INTERVAL '14 days',
  subscription_status = CASE 
    WHEN created_at + INTERVAL '14 days' > NOW() THEN 'trial'
    ELSE 'active'
  END
WHERE trial_ends_at IS NULL 
  AND subscription_plan = 'free';
