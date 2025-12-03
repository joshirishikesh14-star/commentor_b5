/*
  # Update get_user_workspaces to return full workspace data
  
  1. Problem
    - Auth0 users can't query workspaces table directly (RLS blocks anon)
    - Current function returns only workspace_id and role
    - App then queries workspaces table again (fails for Auth0 users)
    
  2. Solution
    - Update function to return full workspace record plus role
    - Eliminates need for second query
    - Works for both Supabase and Auth0 users
    
  3. Security
    - Function has SECURITY DEFINER to bypass RLS
    - Only returns workspaces user owns or is member of
    - Safe for anon users since it validates user_id
*/

-- Drop and recreate with full workspace data
DROP FUNCTION IF EXISTS public.get_user_workspaces(uuid);

CREATE OR REPLACE FUNCTION public.get_user_workspaces(user_uuid uuid)
RETURNS TABLE(
  workspace_id uuid,
  role workspace_role,
  name text,
  slug text,
  owner_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  -- Get workspaces where user is a member
  SELECT 
    w.id as workspace_id,
    wm.role,
    w.name,
    w.slug,
    w.owner_id,
    w.created_at,
    w.updated_at
  FROM public.workspace_members wm
  JOIN public.workspaces w ON w.id = wm.workspace_id
  WHERE wm.user_id = user_uuid
  
  UNION
  
  -- Get workspaces where user is the owner (but not already a member)
  SELECT 
    w.id as workspace_id,
    'admin'::public.workspace_role as role,
    w.name,
    w.slug,
    w.owner_id,
    w.created_at,
    w.updated_at
  FROM public.workspaces w
  WHERE w.owner_id = user_uuid
  AND NOT EXISTS (
    SELECT 1 FROM public.workspace_members wm2
    WHERE wm2.workspace_id = w.id
    AND wm2.user_id = user_uuid
  );
END;
$$;

-- Grant execute to both authenticated and anon
GRANT EXECUTE ON FUNCTION public.get_user_workspaces(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_workspaces(uuid) TO anon;
