-- =====================================================
-- FIX APP INVITATIONS TABLE
-- Run this in Supabase SQL Editor if invitations aren't working
-- =====================================================

-- Step 1: Create app_invitations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.app_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_email text NOT NULL,
  access_level text NOT NULL DEFAULT 'commenter' CHECK (access_level IN ('viewer', 'commenter', 'moderator')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  invitation_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64'),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_app_invitations_app_id ON public.app_invitations(app_id);
CREATE INDEX IF NOT EXISTS idx_app_invitations_invitee_email ON public.app_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_app_invitations_token ON public.app_invitations(invitation_token) WHERE status = 'pending';

-- Step 3: Enable RLS
ALTER TABLE public.app_invitations ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
DROP POLICY IF EXISTS "App owners and inviters can manage invitations" ON public.app_invitations;
CREATE POLICY "App owners and inviters can manage invitations"
  ON public.app_invitations FOR ALL
  TO authenticated
  USING (
    app_id IN (SELECT id FROM public.apps WHERE owner_id = auth.uid())
    OR inviter_id = auth.uid()
  );

DROP POLICY IF EXISTS "Invitees can view their invitations" ON public.app_invitations;
CREATE POLICY "Invitees can view their invitations"
  ON public.app_invitations FOR SELECT
  TO authenticated
  USING (
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Step 5: Create app_collaborators table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.app_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'commenter' CHECK (role IN ('viewer', 'commenter', 'moderator', 'admin')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invitation_id uuid REFERENCES public.app_invitations(id) ON DELETE SET NULL,
  invited_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(app_id, user_id)
);

-- Step 6: Create indexes for app_collaborators
CREATE INDEX IF NOT EXISTS idx_app_collaborators_app_id ON public.app_collaborators(app_id);
CREATE INDEX IF NOT EXISTS idx_app_collaborators_user_id ON public.app_collaborators(user_id);

-- Step 7: Enable RLS for app_collaborators
ALTER TABLE public.app_collaborators ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies for app_collaborators
DROP POLICY IF EXISTS "Users can view collaborators for their apps" ON public.app_collaborators;
CREATE POLICY "Users can view collaborators for their apps"
  ON public.app_collaborators FOR SELECT
  TO authenticated
  USING (
    app_id IN (SELECT id FROM public.apps WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "App owners can manage collaborators" ON public.app_collaborators;
CREATE POLICY "App owners can manage collaborators"
  ON public.app_collaborators FOR ALL
  TO authenticated
  USING (
    app_id IN (SELECT id FROM public.apps WHERE owner_id = auth.uid())
  );

-- Step 9: Grant permissions
GRANT ALL ON public.app_invitations TO authenticated;
GRANT ALL ON public.app_collaborators TO authenticated;

-- Verify tables exist
SELECT 'app_invitations table exists' as status, count(*) as row_count FROM public.app_invitations;
SELECT 'app_collaborators table exists' as status, count(*) as row_count FROM public.app_collaborators;

