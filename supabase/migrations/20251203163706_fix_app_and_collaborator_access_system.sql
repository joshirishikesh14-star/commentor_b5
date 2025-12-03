/*
  # Fix App Creation and Collaborator Access System
  
  1. Current Problems
    - Apps can only be created by workspace OWNERS (should allow members too)
    - app_collaborators has no INSERT/UPDATE/DELETE policies
    - Can't add app creator as admin when app is created
    - Users can't see apps they're collaborators on
    
  2. Requirements (from user)
    - Workspace owners AND members can create apps
    - App creator becomes admin automatically
    - Can invite users as: admin, moderator, commenter, viewer
    - Users only see apps they're collaborators on
    - App admins can manage collaborators
    
  3. Changes
    - Fix apps INSERT policy to allow workspace members
    - Add comprehensive app_collaborators policies
    - Update apps SELECT to include collaborators
*/

-- ============================================================================
-- FIX APPS TABLE POLICIES
-- ============================================================================

-- Drop old restrictive app creation policy
DROP POLICY IF EXISTS "Users can create apps in their workspaces" ON apps;

-- New policy: Workspace owners AND members can create apps
CREATE POLICY "Workspace members can create apps"
  ON apps
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid() 
    AND (
      -- Workspace owner
      workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
      OR
      -- Workspace member
      workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- Update SELECT policy to include collaborators
DROP POLICY IF EXISTS "Users can view accessible apps" ON apps;
DROP POLICY IF EXISTS "Users can view their apps" ON apps;

CREATE POLICY "Users can view their accessible apps"
  ON apps
  FOR SELECT
  TO authenticated
  USING (
    -- App owner
    owner_id = auth.uid()
    OR
    -- Workspace owner
    workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
    OR
    -- App collaborator
    id IN (SELECT app_id FROM app_collaborators WHERE user_id = auth.uid())
    OR
    -- Workspace member (can see workspace apps)
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );

-- ============================================================================
-- ADD APP_COLLABORATORS POLICIES
-- ============================================================================

-- Collaborators can view their own record and admins can view all
DROP POLICY IF EXISTS "Users can view app collaborators" ON app_collaborators;

CREATE POLICY "View app collaborators"
  ON app_collaborators
  FOR SELECT
  TO authenticated
  USING (
    -- Own record
    user_id = auth.uid()
    OR
    -- App owner can view all
    app_id IN (SELECT id FROM apps WHERE owner_id = auth.uid())
    OR
    -- App admin can view all
    app_id IN (
      SELECT app_id FROM app_collaborators 
      WHERE user_id = auth.uid() AND access_level = 'admin'
    )
    OR
    -- Workspace owner can view workspace app collaborators
    app_id IN (
      SELECT id FROM apps WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE owner_id = auth.uid()
      )
    )
  );

-- App owner and admins can add collaborators
CREATE POLICY "Add app collaborators"
  ON app_collaborators
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- App owner
    app_id IN (SELECT id FROM apps WHERE owner_id = auth.uid())
    OR
    -- App admin
    app_id IN (
      SELECT app_id FROM app_collaborators 
      WHERE user_id = auth.uid() AND access_level = 'admin'
    )
  );

-- App owner and admins can update collaborator roles (but admins can't change their own)
CREATE POLICY "Update app collaborators"
  ON app_collaborators
  FOR UPDATE
  TO authenticated
  USING (
    -- App owner can update anyone
    app_id IN (SELECT id FROM apps WHERE owner_id = auth.uid())
    OR
    -- App admin can update others (not themselves)
    (app_id IN (
      SELECT app_id FROM app_collaborators 
      WHERE user_id = auth.uid() AND access_level = 'admin'
    ) AND user_id != auth.uid())
  )
  WITH CHECK (
    -- App owner can update anyone
    app_id IN (SELECT id FROM apps WHERE owner_id = auth.uid())
    OR
    -- App admin can update others (not themselves)
    (app_id IN (
      SELECT app_id FROM app_collaborators 
      WHERE user_id = auth.uid() AND access_level = 'admin'
    ) AND user_id != auth.uid())
  );

-- App owner and admins can remove collaborators (but admins can't remove themselves)
CREATE POLICY "Remove app collaborators"
  ON app_collaborators
  FOR DELETE
  TO authenticated
  USING (
    -- App owner can remove anyone
    app_id IN (SELECT id FROM apps WHERE owner_id = auth.uid())
    OR
    -- App admin can remove others (not themselves)
    (app_id IN (
      SELECT app_id FROM app_collaborators 
      WHERE user_id = auth.uid() AND access_level = 'admin'
    ) AND user_id != auth.uid())
  );
