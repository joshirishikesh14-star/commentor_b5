/*
  # Fix Workspace Creation RLS - Final Solution

  1. Problem
    - Function without SECURITY DEFINER is subject to RLS policies
    - Function with SECURITY DEFINER causes auth.uid() to return NULL
    - Need to capture auth context before privilege elevation
    
  2. Solution
    - Use SECURITY DEFINER to bypass RLS
    - Capture auth.uid() at function entry before privilege context changes
    - Use captured user ID for all operations
    - Set empty search_path for security
    - Fully qualify all table references
    
  3. Security
    - Function validates user is authenticated before proceeding
    - Only authenticated users can create workspaces
    - Creator is automatically set as workspace owner and admin member
    - Empty search_path prevents SQL injection vulnerabilities
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS public.create_workspace_with_member(text, text);

-- Recreate with SECURITY DEFINER and proper auth context capture
CREATE OR REPLACE FUNCTION public.create_workspace_with_member(
  workspace_name text,
  workspace_slug text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_workspace public.workspaces;
  new_member public.workspace_members;
  result json;
  current_user_id uuid;
BEGIN
  -- CRITICAL: Capture auth.uid() at entry point before privilege elevation
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Create the workspace (RLS bypassed due to SECURITY DEFINER)
  INSERT INTO public.workspaces (name, slug, owner_id)
  VALUES (workspace_name, workspace_slug, current_user_id)
  RETURNING * INTO new_workspace;

  -- Add creator as admin member
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
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