/*
  # Fix Infinite Recursion in RLS Policies
  
  1. Problem
    - INSERT app_collaborators checks SELECT apps
    - SELECT apps checks SELECT app_collaborators  
    - SELECT app_collaborators checks SELECT apps → infinite loop!
    
  2. Solution
    - Create security definer helper functions
    - These bypass RLS to prevent circular checks
    - Simplify policies to use these functions
    
  3. Changes
    - Add helper function: is_app_owner()
    - Add helper function: is_app_admin()
    - Rewrite app_collaborators policies using helpers
    - Keep apps policies simple
*/

-- ============================================================================
-- HELPER FUNCTIONS (SECURITY DEFINER to bypass RLS)
-- ============================================================================

-- Check if user owns an app
CREATE OR REPLACE FUNCTION is_app_owner(app_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM apps 
    WHERE id = app_uuid AND owner_id = user_uuid
  );
$$;

-- Check if user is app admin
CREATE OR REPLACE FUNCTION is_app_admin(app_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM app_collaborators 
    WHERE app_id = app_uuid 
      AND user_id = user_uuid 
      AND access_level = 'admin'
  );
$$;

-- Check if user is workspace owner
CREATE OR REPLACE FUNCTION is_workspace_owner_of_app(app_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM apps a
    JOIN workspaces w ON w.id = a.workspace_id
    WHERE a.id = app_uuid AND w.owner_id = user_uuid
  );
$$;

-- ============================================================================
-- RECREATE APP_COLLABORATORS POLICIES (no circular deps)
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "View app collaborators" ON app_collaborators;
DROP POLICY IF EXISTS "Add app collaborators" ON app_collaborators;
DROP POLICY IF EXISTS "Update app collaborators" ON app_collaborators;
DROP POLICY IF EXISTS "Remove app collaborators" ON app_collaborators;

-- View: Own record, or if you're app owner/admin/workspace owner
CREATE POLICY "View app collaborators"
  ON app_collaborators
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_app_owner(app_id, auth.uid())
    OR is_app_admin(app_id, auth.uid())
    OR is_workspace_owner_of_app(app_id, auth.uid())
  );

-- Insert: App owner or admin can add
CREATE POLICY "Add app collaborators"
  ON app_collaborators
  FOR INSERT
  TO authenticated
  WITH CHECK (
    is_app_owner(app_id, auth.uid())
    OR is_app_admin(app_id, auth.uid())
  );

-- Update: App owner or admin (admin can't change their own)
CREATE POLICY "Update app collaborators"
  ON app_collaborators
  FOR UPDATE
  TO authenticated
  USING (
    is_app_owner(app_id, auth.uid())
    OR (is_app_admin(app_id, auth.uid()) AND user_id != auth.uid())
  )
  WITH CHECK (
    is_app_owner(app_id, auth.uid())
    OR (is_app_admin(app_id, auth.uid()) AND user_id != auth.uid())
  );

-- Delete: App owner or admin (admin can't remove themselves)
CREATE POLICY "Remove app collaborators"
  ON app_collaborators
  FOR DELETE
  TO authenticated
  USING (
    is_app_owner(app_id, auth.uid())
    OR (is_app_admin(app_id, auth.uid()) AND user_id != auth.uid())
  );
