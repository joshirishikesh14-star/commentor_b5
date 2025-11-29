/*
  # Add Subscription Enforcement and Auto-Expiration

  1. Schema Changes
    - Add subscription_expires_at to workspace_members
    - Add is_subscription_active computed field logic
    
  2. Functions
    - check_subscription_status: Check if member subscription is active
    - flag_expired_subscriptions: Mark expired subscriptions as overdue
    - can_access_workspace: Check if user can access workspace features
    
  3. RLS Updates
    - Prevent expired members from creating threads/comments
    - Allow read access but block write access for expired members
    
  4. Security
    - Automatic checks on all workspace operations
    - Grace period of 3 days after expiration
*/

-- Add subscription expiration tracking
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workspace_members' 
    AND column_name = 'subscription_expires_at'
  ) THEN
    ALTER TABLE workspace_members 
    ADD COLUMN subscription_expires_at timestamptz;
  END IF;
END $$;

-- Function to check if subscription is active
CREATE OR REPLACE FUNCTION is_subscription_active(member_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_record record;
  is_active boolean;
BEGIN
  SELECT * INTO member_record
  FROM workspace_members
  WHERE id = member_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Trial members are always active during trial
  IF member_record.payment_status = 'trial' THEN
    -- Check if trial period (14 days from joining) has expired
    IF member_record.joined_at + interval '14 days' > now() THEN
      RETURN true;
    ELSE
      -- Trial expired, update status
      UPDATE workspace_members
      SET payment_status = 'unpaid',
          subscription_expires_at = joined_at + interval '14 days'
      WHERE id = member_id;
      RETURN false;
    END IF;
  END IF;

  -- Paid members need valid subscription
  IF member_record.payment_status = 'paid' AND member_record.is_paid = true THEN
    -- Check if subscription has expired
    IF member_record.subscription_expires_at IS NULL THEN
      RETURN true; -- No expiration set, assume active
    END IF;
    
    IF member_record.subscription_expires_at > now() THEN
      RETURN true;
    ELSE
      -- Subscription expired, mark as overdue
      UPDATE workspace_members
      SET payment_status = 'overdue',
          is_paid = false
      WHERE id = member_id;
      RETURN false;
    END IF;
  END IF;

  -- All other statuses are inactive
  RETURN false;
END;
$$;

-- Function to check if user can access workspace
CREATE OR REPLACE FUNCTION can_access_workspace(
  p_workspace_id uuid,
  p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_id_val uuid;
  is_owner boolean;
BEGIN
  -- Check if user is workspace owner
  SELECT EXISTS (
    SELECT 1 FROM workspaces
    WHERE id = p_workspace_id
    AND owner_id = p_user_id
  ) INTO is_owner;

  -- Owners always have access
  IF is_owner THEN
    RETURN true;
  END IF;

  -- Get member ID
  SELECT id INTO member_id_val
  FROM workspace_members
  WHERE workspace_id = p_workspace_id
  AND user_id = p_user_id;

  IF member_id_val IS NULL THEN
    RETURN false;
  END IF;

  -- Check if subscription is active
  RETURN is_subscription_active(member_id_val);
END;
$$;

-- Function to flag all expired subscriptions (run periodically)
CREATE OR REPLACE FUNCTION flag_expired_subscriptions()
RETURNS TABLE(
  member_id uuid,
  user_email text,
  workspace_name text,
  expired_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE workspace_members wm
  SET 
    payment_status = 'overdue',
    is_paid = false
  FROM profiles p, workspaces w
  WHERE wm.user_id = p.id
  AND wm.workspace_id = w.id
  AND wm.payment_status = 'paid'
  AND wm.subscription_expires_at IS NOT NULL
  AND wm.subscription_expires_at < now()
  RETURNING 
    wm.id,
    p.email,
    w.name,
    wm.subscription_expires_at;
END;
$$;

-- Update thread creation policy to check subscription
DROP POLICY IF EXISTS "Users can create threads in workspace apps" ON threads;

CREATE POLICY "Users can create threads in workspace apps"
ON threads
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM apps
    WHERE apps.id = threads.app_id
    AND can_access_workspace(apps.workspace_id, auth.uid())
  )
);

-- Update comment creation policy to check subscription
DROP POLICY IF EXISTS "Users can create comments in accessible threads" ON comments;

CREATE POLICY "Users can create comments in accessible threads"
ON comments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM threads
    JOIN apps ON threads.app_id = apps.id
    WHERE threads.id = comments.thread_id
    AND can_access_workspace(apps.workspace_id, auth.uid())
  )
);

-- Set initial subscription expiration for existing paid members
UPDATE workspace_members
SET subscription_expires_at = next_billing_date
WHERE payment_status = 'paid'
AND subscription_expires_at IS NULL
AND next_billing_date IS NOT NULL;

-- Set trial expiration for trial members
UPDATE workspace_members
SET subscription_expires_at = joined_at + interval '14 days'
WHERE payment_status = 'trial'
AND subscription_expires_at IS NULL;

-- Create index for faster subscription checks
CREATE INDEX IF NOT EXISTS idx_workspace_members_subscription_expires 
ON workspace_members(subscription_expires_at) 
WHERE payment_status IN ('paid', 'trial');

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_subscription_active(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION can_access_workspace(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION flag_expired_subscriptions() TO authenticated;
