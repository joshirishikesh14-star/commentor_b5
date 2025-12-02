/*
  # Fix has_app_access Function to Include Workspace Members

  ## Problem
  Users who are workspace members (not owners) cannot create threads/comments
  because has_app_access() only checks:
  - App owner
  - App collaborators  
  - Workspace owner
  
  Missing: Workspace members!

  ## Solution
  Update has_app_access() to also check workspace_members table
  This allows all workspace members to access apps in their workspace

  ## Changes
  - Adds UNION clause to check workspace_members
  - Now grants access to:
    1. App owner
    2. App collaborators
    3. Workspace owner
    4. Workspace members (NEW!)

  ## Security
  - Maintains existing security model
  - Only grants access to users who are part of the workspace
  - Uses SECURITY DEFINER with proper search_path
*/

-- Update has_app_access to include workspace members
CREATE OR REPLACE FUNCTION public.has_app_access(app_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    -- App owner has access
    SELECT 1 FROM public.apps WHERE id = app_id_param AND owner_id = user_id_param
    UNION
    -- App collaborators have access
    SELECT 1 FROM public.app_collaborators 
    WHERE app_id = app_id_param AND user_id = user_id_param
    UNION
    -- Workspace owner has access
    SELECT 1 FROM public.apps a
    JOIN public.workspaces w ON a.workspace_id = w.id
    WHERE a.id = app_id_param AND w.owner_id = user_id_param
    UNION
    -- Workspace members have access (NEW!)
    SELECT 1 FROM public.apps a
    JOIN public.workspace_members wm ON a.workspace_id = wm.workspace_id
    WHERE a.id = app_id_param AND wm.user_id = user_id_param
  );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.has_app_access(uuid, uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.has_app_access(uuid, uuid) IS 
'Returns true if user has access to an app via: app ownership, app collaboration, workspace ownership, or workspace membership';
