/*
  # Fix get_user_workspaces to include owned workspaces
  
  1. Problem
    - Function only returns workspaces where user is a member
    - Workspace owners who aren't in workspace_members table don't see their workspaces
    
  2. Solution
    - Include workspaces where user is the owner
    - Return 'owner' as the role for owned workspaces
    - Combine with existing member workspaces
    
  3. Changes
    - Update get_user_workspaces function to UNION owned workspaces with member workspaces
*/

-- Drop and recreate the function with owner inclusion
CREATE OR REPLACE FUNCTION public.get_user_workspaces(user_uuid uuid)
RETURNS TABLE(workspace_id uuid, role workspace_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  -- Get workspaces where user is a member
  SELECT wm.workspace_id, wm.role
  FROM workspace_members wm
  WHERE wm.user_id = user_uuid
  
  UNION
  
  -- Get workspaces where user is the owner (but not already a member)
  SELECT w.id as workspace_id, 'admin'::workspace_role as role
  FROM workspaces w
  WHERE w.owner_id = user_uuid
  AND NOT EXISTS (
    SELECT 1 FROM workspace_members wm2
    WHERE wm2.workspace_id = w.id
    AND wm2.user_id = user_uuid
  );
END;
$$;
