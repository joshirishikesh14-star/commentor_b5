/*
  # Fix workspace_members SELECT policy for owners
  
  1. Problem
    - Workspace owners cannot see members list if they're not explicitly a member
    - Current policy only checks `is_workspace_member()`
    
  2. Solution
    - Allow workspace owners to view all members of their workspaces
    - Keep existing member access for non-owners
    
  3. Changes
    - Drop existing SELECT policy
    - Create new policy that checks: owner OR member
*/

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Members can view workspace members" ON workspace_members;

-- Create new policy allowing both owners and members to view
CREATE POLICY "Owners and members can view workspace members"
  ON workspace_members
  FOR SELECT
  TO authenticated
  USING (
    -- User is a member of the workspace OR
    is_workspace_member(workspace_id, auth.uid())
    OR
    -- User is the owner of the workspace
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );
