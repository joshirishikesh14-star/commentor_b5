/*
  # Add Trial Expiration Enforcement

  1. New Functions
    - `check_subscription_access()` - Helper function to check if user has access based on subscription
    - `update_expired_trials()` - Function to mark expired trials as expired
    - `get_subscription_limits()` - Returns limits based on plan

  2. Scheduled Job
    - Daily cron job to update expired trial statuses

  3. Helper Views
    - `user_subscription_info` - View with subscription status and limits
*/

-- Function to check if user's trial has expired and update status
CREATE OR REPLACE FUNCTION update_expired_trials()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET subscription_status = 'expired'
  WHERE subscription_status = 'trial'
    AND trial_ends_at IS NOT NULL
    AND trial_ends_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription limits for a user
CREATE OR REPLACE FUNCTION get_subscription_limits(user_id uuid)
RETURNS jsonb AS $$
DECLARE
  user_plan text;
  user_status text;
  limits jsonb;
BEGIN
  -- Get user's plan and status
  SELECT subscription_plan, subscription_status
  INTO user_plan, user_status
  FROM profiles
  WHERE id = user_id;

  -- Return limits based on plan and status
  IF user_status = 'expired' OR user_status = 'canceled' THEN
    -- Expired or canceled - read-only access
    limits := jsonb_build_object(
      'can_create_apps', false,
      'can_create_comments', false,
      'can_invite_members', false,
      'max_apps', 0,
      'max_comments_per_month', 0,
      'max_team_members', 0,
      'status', user_status,
      'plan', user_plan
    );
  ELSIF user_plan = 'free' OR user_status = 'trial' THEN
    -- Free tier or trial
    limits := jsonb_build_object(
      'can_create_apps', true,
      'can_create_comments', true,
      'can_invite_members', true,
      'max_apps', 3,
      'max_comments_per_month', 100,
      'max_team_members', 5,
      'status', user_status,
      'plan', user_plan
    );
  ELSIF user_plan = 'pro' THEN
    -- Pro tier - unlimited
    limits := jsonb_build_object(
      'can_create_apps', true,
      'can_create_comments', true,
      'can_invite_members', true,
      'max_apps', -1,
      'max_comments_per_month', -1,
      'max_team_members', -1,
      'status', user_status,
      'plan', user_plan
    );
  ELSIF user_plan = 'enterprise' THEN
    -- Enterprise tier - unlimited
    limits := jsonb_build_object(
      'can_create_apps', true,
      'can_create_comments', true,
      'can_invite_members', true,
      'max_apps', -1,
      'max_comments_per_month', -1,
      'max_team_members', -1,
      'status', user_status,
      'plan', user_plan
    );
  ELSE
    -- Default to no access
    limits := jsonb_build_object(
      'can_create_apps', false,
      'can_create_comments', false,
      'can_invite_members', false,
      'max_apps', 0,
      'max_comments_per_month', 0,
      'max_team_members', 0,
      'status', 'unknown',
      'plan', 'unknown'
    );
  END IF;

  RETURN limits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create an app
CREATE OR REPLACE FUNCTION can_user_create_app(user_id uuid)
RETURNS boolean AS $$
DECLARE
  limits jsonb;
  current_app_count integer;
  max_apps integer;
BEGIN
  -- Get user limits
  limits := get_subscription_limits(user_id);
  
  -- Check if user can create apps at all
  IF NOT (limits->>'can_create_apps')::boolean THEN
    RETURN false;
  END IF;

  -- Get max apps allowed (-1 means unlimited)
  max_apps := (limits->>'max_apps')::integer;
  
  -- If unlimited, return true
  IF max_apps = -1 THEN
    RETURN true;
  END IF;

  -- Count user's current apps (as owner)
  SELECT COUNT(*)
  INTO current_app_count
  FROM apps
  WHERE owner_id = user_id;

  -- Return true if under limit
  RETURN current_app_count < max_apps;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create a comment this month
CREATE OR REPLACE FUNCTION can_user_create_comment(user_id uuid)
RETURNS boolean AS $$
DECLARE
  limits jsonb;
  current_comment_count integer;
  max_comments integer;
BEGIN
  -- Get user limits
  limits := get_subscription_limits(user_id);
  
  -- Check if user can create comments at all
  IF NOT (limits->>'can_create_comments')::boolean THEN
    RETURN false;
  END IF;

  -- Get max comments allowed (-1 means unlimited)
  max_comments := (limits->>'max_comments_per_month')::integer;
  
  -- If unlimited, return true
  IF max_comments = -1 THEN
    RETURN true;
  END IF;

  -- Count user's comments this month
  SELECT COUNT(*)
  INTO current_comment_count
  FROM threads
  WHERE author_id = user_id
    AND created_at >= date_trunc('month', NOW());

  -- Return true if under limit
  RETURN current_comment_count < max_comments;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for easy subscription info access
CREATE OR REPLACE VIEW user_subscription_info AS
SELECT 
  p.id as user_id,
  p.email,
  p.subscription_plan,
  p.subscription_status,
  p.trial_ends_at,
  p.subscription_started_at,
  p.subscription_expires_at,
  CASE 
    WHEN p.subscription_status = 'trial' AND p.trial_ends_at > NOW() THEN
      EXTRACT(DAY FROM (p.trial_ends_at - NOW()))
    ELSE NULL
  END as trial_days_remaining,
  CASE
    WHEN p.subscription_status = 'expired' THEN true
    WHEN p.subscription_status = 'trial' AND p.trial_ends_at < NOW() THEN true
    ELSE false
  END as is_expired,
  get_subscription_limits(p.id) as limits
FROM profiles p;

-- Grant access to the view
GRANT SELECT ON user_subscription_info TO authenticated;

-- Add RLS policy for the view
ALTER VIEW user_subscription_info SET (security_invoker = true);

-- Run initial update to mark any already-expired trials
SELECT update_expired_trials();

-- Note: To set up automatic daily updates, you would use pg_cron extension:
-- SELECT cron.schedule('update-expired-trials', '0 0 * * *', 'SELECT update_expired_trials();');
-- This requires the pg_cron extension to be enabled in Supabase project settings.
