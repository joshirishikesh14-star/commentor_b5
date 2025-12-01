/*
  # Fix create_workspace_with_member function

  1. Changes
    - Drop existing function
    - Recreate function to properly use authenticated user context
    - Remove SECURITY DEFINER as it causes auth.uid() to return NULL
    - Function will run with caller's privileges instead
  
  2. Security
    - RLS policies on workspaces and workspace_members will enforce access control
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS create_workspace_with_member(text, text);

-- Recreate without SECURITY DEFINER so auth.uid() works correctly
CREATE OR REPLACE FUNCTION create_workspace_with_member(
  workspace_name text,
  workspace_slug text
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  new_workspace workspaces;
  new_member workspace_members;
  result json;
  current_user_id uuid;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create the workspace
  INSERT INTO workspaces (name, slug, owner_id)
  VALUES (workspace_name, workspace_slug, current_user_id)
  RETURNING * INTO new_workspace;

  -- Add creator as admin member
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace.id, current_user_id, 'admin')
  RETURNING * INTO new_member;

  -- Return both records
  result := json_build_object(
    'workspace', row_to_json(new_workspace),
    'membership', row_to_json(new_member)
  );

  RETURN result;
END;
$$;
