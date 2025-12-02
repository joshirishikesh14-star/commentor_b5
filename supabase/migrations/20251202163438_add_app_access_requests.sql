/*
  # Add App Access Request System

  ## Overview
  Allows workspace members to request access to apps they can see but cannot edit.
  App owners/workspace owners can approve or deny these requests.

  ## New Table
  - `app_access_requests`: Tracks access requests from users

  ## Fields
  - id: Unique identifier
  - app_id: Which app access is requested for
  - user_id: Who is requesting access
  - requested_at: When request was made
  - status: pending, approved, denied
  - reviewed_by: Who approved/denied (nullable)
  - reviewed_at: When reviewed (nullable)
  - message: Optional message from requester

  ## Security
  - RLS enabled
  - Users can create requests for themselves
  - Users can view their own requests
  - App owners and workspace owners can view/update requests for their apps
*/

-- Create app_access_requests table
CREATE TABLE IF NOT EXISTS public.app_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid REFERENCES public.apps(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message text DEFAULT '',
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'denied')),
  requested_at timestamptz DEFAULT now() NOT NULL,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(app_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_app_access_requests_app_id 
ON public.app_access_requests(app_id);

CREATE INDEX IF NOT EXISTS idx_app_access_requests_user_id 
ON public.app_access_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_app_access_requests_status 
ON public.app_access_requests(status) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.app_access_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create their own access requests"
  ON public.app_access_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own access requests"
  ON public.app_access_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "App owners can view requests for their apps"
  ON public.app_access_requests FOR SELECT
  TO authenticated
  USING (
    app_id IN (
      SELECT id FROM public.apps WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can view requests for workspace apps"
  ON public.app_access_requests FOR SELECT
  TO authenticated
  USING (
    app_id IN (
      SELECT a.id FROM public.apps a
      JOIN public.workspaces w ON a.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

CREATE POLICY "App owners can update requests for their apps"
  ON public.app_access_requests FOR UPDATE
  TO authenticated
  USING (
    app_id IN (
      SELECT id FROM public.apps WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    app_id IN (
      SELECT id FROM public.apps WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can update requests for workspace apps"
  ON public.app_access_requests FOR UPDATE
  TO authenticated
  USING (
    app_id IN (
      SELECT a.id FROM public.apps a
      JOIN public.workspaces w ON a.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    app_id IN (
      SELECT a.id FROM public.apps a
      JOIN public.workspaces w ON a.workspace_id = w.id
      WHERE w.owner_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_app_access_requests_updated_at
  BEFORE UPDATE ON public.app_access_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.app_access_requests IS 
'Tracks access requests from users who want to collaborate on an app. App owners and workspace owners can approve or deny requests.';
