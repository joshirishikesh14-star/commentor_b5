/*
  # Revert Workspace Member Auto-Access
  
  ## Problem
  Previous migration incorrectly added workspace members to has_app_access()
  This gave ALL workspace members access to ALL workspace apps automatically.
  
  ## Correct Behavior
  App access should ONLY be granted via:
  1. App owner
  2. Workspace owner (owns the workspace containing the app)
  3. Direct app invitation (app_collaborators table)
  
  Workspace members should NOT get automatic access to apps.
  They must be explicitly invited to each app.
  
  ## Changes
  - Removes workspace_members UNION clause from has_app_access()
  - Access now requires explicit invitation to the specific app
  
  ## Security
  - More restrictive access control
  - Explicit permission required for each app
  - Prevents accidental data exposure
*/

-- Revert has_app_access to NOT include workspace members
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
    -- App collaborators have access (explicit invitation)
    SELECT 1 FROM public.app_collaborators 
    WHERE app_id = app_id_param AND user_id = user_id_param
    UNION
    -- Workspace owner has access (owns workspace containing app)
    SELECT 1 FROM public.apps a
    JOIN public.workspaces w ON a.workspace_id = w.id
    WHERE a.id = app_id_param AND w.owner_id = user_id_param
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_app_access(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION public.has_app_access(uuid, uuid) IS 
'Returns true if user has access to an app via: app ownership, workspace ownership, or explicit app collaboration (NOT workspace membership)';
