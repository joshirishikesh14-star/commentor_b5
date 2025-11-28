/*
  # Fix workspace SELECT policy to include owners

  1. Changes
    - Update the "Users can view their workspaces" policy to also check owner_id
    - Users should be able to see workspaces they own OR are members of
    
  2. Security
    - Maintains data integrity
    - Ensures owners can always see their own workspaces
*/

-- Drop and recreate the SELECT policy with owner check
DROP POLICY IF EXISTS "Users can view their workspaces" ON public.workspaces;

CREATE POLICY "Users can view their workspaces"
  ON public.workspaces
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id OR is_workspace_member(id, auth.uid())
  );