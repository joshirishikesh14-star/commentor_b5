-- Rollback all Auth0-related changes
-- This migration removes all Auth0 functionality added after commit 693b099

-- 1. Remove anon grants (wrapped in DO blocks to handle errors)
DO $$
BEGIN
  REVOKE EXECUTE ON FUNCTION public.get_user_workspaces(uuid) FROM anon;
EXCEPTION WHEN OTHERS THEN
  -- Grant doesn't exist, ignore
  NULL;
END $$;

DO $$
BEGIN
  REVOKE EXECUTE ON FUNCTION public.create_workspace_with_user_id(p_user_id uuid, p_workspace_name text, p_workspace_slug text) FROM anon;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  REVOKE EXECUTE ON FUNCTION public.create_or_update_auth0_profile(p_auth0_id text, p_email text, p_full_name text, p_avatar_url text) FROM anon;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  REVOKE EXECUTE ON FUNCTION public.sync_auth0_profile(p_auth0_id text, p_email text, p_full_name text, p_avatar_url text) FROM anon;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 2. Drop Auth0-specific functions (using CASCADE to handle dependencies)
DROP FUNCTION IF EXISTS public.create_or_update_auth0_profile CASCADE;
DROP FUNCTION IF EXISTS public.create_workspace_with_user_id CASCADE;
DROP FUNCTION IF EXISTS public.sync_auth0_profile CASCADE;

-- 3. Remove auth0_id column from profiles table
-- Drop any indexes first
DO $$
BEGIN
  DROP INDEX IF EXISTS profiles_auth0_id_idx;
  DROP INDEX IF EXISTS profiles_auth0_id_key;
END $$;

-- Drop the column
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS auth0_id;

-- 4. Clean up any comments
COMMENT ON TABLE public.profiles IS 'User profiles table. Rolled back Auth0 changes.';

-- Verify rollback
DO $$
BEGIN
  RAISE NOTICE '✅ Auth0 rollback complete:';
  RAISE NOTICE '  - Auth0 functions dropped';
  RAISE NOTICE '  - auth0_id column removed from profiles';
  RAISE NOTICE '  - Anon grants revoked for Auth0 functions';
END $$;

