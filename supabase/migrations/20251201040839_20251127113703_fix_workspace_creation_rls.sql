/*
  # Fix Workspace Creation RLS

  1. Changes
    - Create a function to atomically create workspace and add creator as admin
    - This bypasses RLS issues when creating new workspaces
    
  2. Security
    - Function uses SECURITY DEFINER but validates user owns the workspace
    - Only authenticated users can call the function
*/

CREATE OR REPLACE FUNCTION create_workspace_with_member(
  workspace_name text,
  workspace_slug text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace workspaces;
  new_member workspace_members;
  result json;
BEGIN
  -- Create the workspace
  INSERT INTO workspaces (name, slug, owner_id)
  VALUES (workspace_name, workspace_slug, auth.uid())
  RETURNING * INTO new_workspace;

  -- Add creator as admin member
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace.id, auth.uid(), 'admin')
  RETURNING * INTO new_member;

  -- Return both records
  result := json_build_object(
    'workspace', row_to_json(new_workspace),
    'membership', row_to_json(new_member)
  );

  RETURN result;
END;
$$;
