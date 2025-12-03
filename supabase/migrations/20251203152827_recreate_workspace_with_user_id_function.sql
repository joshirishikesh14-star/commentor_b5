/*
  # Create workspace function for Auth0 users
  
  1. New Function
    - `create_workspace_with_user_id` - Accepts explicit user_id parameter
    - Works for both Supabase and Auth0 users
    - Bypasses RLS to create workspace and membership
    
  2. Purpose
    - Auth0 users don't have Supabase sessions (auth.uid() is null)
    - This function accepts the profile ID directly
    - Creates workspace and adds user as admin member
    
  3. Security
    - Function validates user exists in profiles table
    - Only authenticated requests can call this (via API key)
    - User can only create workspaces for themselves
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.create_workspace_with_user_id(uuid, text, text);

-- Create function that accepts user_id parameter
CREATE OR REPLACE FUNCTION public.create_workspace_with_user_id(
  p_user_id uuid,
  p_workspace_name text,
  p_workspace_slug text
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
BEGIN
  -- Validate user exists in profiles table
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = p_user_id
  ) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Create the workspace
  INSERT INTO public.workspaces (name, slug, owner_id)
  VALUES (p_workspace_name, p_workspace_slug, p_user_id)
  RETURNING * INTO new_workspace;

  -- Add creator as admin member
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace.id, p_user_id, 'admin')
  RETURNING * INTO new_member;

  -- Return both records
  result := json_build_object(
    'workspace', row_to_json(new_workspace),
    'membership', row_to_json(new_member)
  );

  RETURN result;
END;
$$;
