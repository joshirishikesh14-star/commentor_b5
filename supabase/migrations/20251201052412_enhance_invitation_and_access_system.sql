/*
  # Enhanced Invitation and Access Management System

  ## Overview
  Enhances existing app_invitations table and creates proper integration between:
  - App invitations → App collaborators
  - App invitations → Workspace members (when invited by workspace owner)
  - Share tokens → Anonymous access

  ## What's Added
  1. Missing columns to app_invitations (token, access_level, expires_at)
  2. Invitation acceptance flow function
  3. Integration with workspace membership
  4. Automatic expiration handling

  ## How It Works
  
  ### App-Level Invitations Flow
  1. User clicks "Invite" in AppDetails
  2. Creates app_invitations record with status='pending'
  3. Edge function sends email via Supabase Auth
  4. Recipient clicks link → calls accept_app_invitation()
  5. Function creates:
     - app_collaborators record (always)
     - workspace_members record (if inviter is workspace owner)
  6. Updates invitation status to 'accepted'

  ### Share Link Users
  - Access via app_access_tokens (no account needed)
  - Token validated in PublicReview component
  - Can be converted to full collaborator if they sign up

  ## Security
  - RLS policies ensure only app owners/inviters can manage invitations
  - Invitation tokens are unique and can expire
  - Access levels properly enforced
*/

-- Add missing columns to app_invitations
DO $$
BEGIN
  -- Add invitation_token if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_invitations' AND column_name = 'invitation_token'
  ) THEN
    ALTER TABLE public.app_invitations 
    ADD COLUMN invitation_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64');
  END IF;

  -- Add access_level if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_invitations' AND column_name = 'access_level'
  ) THEN
    ALTER TABLE public.app_invitations 
    ADD COLUMN access_level text NOT NULL DEFAULT 'commenter' 
    CHECK (access_level IN ('viewer', 'commenter', 'moderator'));
  END IF;

  -- Add expires_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_invitations' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE public.app_invitations 
    ADD COLUMN expires_at timestamptz DEFAULT (now() + interval '7 days');
  END IF;
END $$;

-- Create indexes for app_invitations
CREATE INDEX IF NOT EXISTS idx_app_invitations_token 
ON public.app_invitations(invitation_token) WHERE status = 'pending';

-- Add invitation tracking to app_collaborators if column doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_collaborators' AND column_name = 'invitation_id'
  ) THEN
    ALTER TABLE public.app_collaborators 
    ADD COLUMN invitation_id uuid REFERENCES public.app_invitations(id) ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_app_collaborators_invitation_id 
    ON public.app_collaborators(invitation_id);
  END IF;
END $$;

-- Update existing RLS policies for app_invitations
DROP POLICY IF EXISTS "App owners can manage invitations" ON public.app_invitations;
DROP POLICY IF EXISTS "Invitees can view their invitations" ON public.app_invitations;

CREATE POLICY "App owners and inviters can manage invitations"
  ON public.app_invitations FOR ALL
  TO authenticated
  USING (
    app_id IN (SELECT id FROM public.apps WHERE owner_id = auth.uid())
    OR inviter_id = auth.uid()
  );

CREATE POLICY "Invitees can view their invitations"
  ON public.app_invitations FOR SELECT
  TO authenticated
  USING (
    invitee_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR invitee_id = auth.uid()
  );

-- Function to accept invitation and create proper access
CREATE OR REPLACE FUNCTION public.accept_app_invitation(
  invitation_token_param text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_invitation record;
  v_user_id uuid;
  v_workspace_id uuid;
  v_app_owner_id uuid;
  v_is_workspace_owner boolean;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Must be authenticated to accept invitation'
    );
  END IF;

  -- Get the invitation
  SELECT * INTO v_invitation
  FROM app_invitations
  WHERE invitation_token = invitation_token_param
  AND status = 'pending'
  AND (expires_at IS NULL OR expires_at > now());

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired invitation'
    );
  END IF;

  -- Get app details
  SELECT a.workspace_id, a.owner_id, (w.owner_id = v_invitation.inviter_id)
  INTO v_workspace_id, v_app_owner_id, v_is_workspace_owner
  FROM apps a
  JOIN workspaces w ON a.workspace_id = w.id
  WHERE a.id = v_invitation.app_id;

  -- Create app_collaborators record
  INSERT INTO app_collaborators (
    app_id,
    user_id,
    access_level,
    invited_by,
    invitation_id
  ) VALUES (
    v_invitation.app_id,
    v_user_id,
    v_invitation.access_level,
    v_invitation.inviter_id,
    v_invitation.id
  )
  ON CONFLICT (app_id, user_id) 
  DO UPDATE SET 
    access_level = EXCLUDED.access_level,
    invitation_id = EXCLUDED.invitation_id;

  -- If inviter is workspace owner, also add to workspace
  IF v_is_workspace_owner THEN
    INSERT INTO workspace_members (
      workspace_id,
      user_id,
      role,
      invited_by
    ) VALUES (
      v_workspace_id,
      v_user_id,
      CASE v_invitation.access_level
        WHEN 'viewer' THEN 'viewer'::workspace_role
        WHEN 'commenter' THEN 'commenter'::workspace_role
        WHEN 'moderator' THEN 'moderator'::workspace_role
        ELSE 'commenter'::workspace_role
      END,
      v_invitation.inviter_id
    )
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;

  -- Update invitation
  UPDATE app_invitations
  SET 
    status = 'accepted',
    accepted_at = now(),
    invitee_id = v_user_id,
    updated_at = now()
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object(
    'success', true,
    'app_id', v_invitation.app_id,
    'access_level', v_invitation.access_level,
    'added_to_workspace', v_is_workspace_owner
  );
END;
$$;

-- Function to expire old invitations
CREATE OR REPLACE FUNCTION public.expire_old_invitations()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE app_invitations
  SET status = 'expired', updated_at = now()
  WHERE status = 'pending'
  AND expires_at IS NOT NULL
  AND expires_at < now();
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.accept_app_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_old_invitations() TO authenticated;

-- Create comment to document the system
COMMENT ON TABLE public.app_invitations IS 'Email invitations to specific apps. When accepted, creates app_collaborators record and optionally adds to workspace_members if inviter is workspace owner.';
COMMENT ON TABLE public.app_collaborators IS 'Direct user access to apps via accepted invitations or manual grants.';
COMMENT ON TABLE public.app_access_tokens IS 'Share tokens for public/anonymous access to apps without account requirement.';
