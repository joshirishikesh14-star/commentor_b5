/*
  # Fix Workspace Member Invitation for Owners

  ## Changes
  - Updates the INSERT policy on workspace_members to allow workspace owners to invite members
  - Previously only admins could invite, but owners should also have this ability

  ## Security
  - Maintains RLS security by verifying workspace ownership
  - Users can still only add themselves OR must be owner/admin to add others
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can join workspaces" ON workspace_members;

-- Create new policy that allows owners and admins to invite
CREATE POLICY "Users can join workspaces"
  ON workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can add themselves
    user_id = auth.uid() 
    OR 
    -- User is a workspace admin
    is_workspace_admin(workspace_id, auth.uid())
    OR
    -- User is the workspace owner
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );
