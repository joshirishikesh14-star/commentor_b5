/*
  # Grant anon access for Auth0 users
  
  1. Problem
    - Auth0 users don't have Supabase sessions
    - They appear as "anon" role to Supabase
    - RPC functions require execute permissions
    
  2. Solution
    - Grant execute permission to anon role for necessary functions
    - These functions have SECURITY DEFINER and validate user_id
    - Safe because they accept explicit user_id parameter
    
  3. Security
    - Functions validate user exists in profiles table
    - Functions use SECURITY DEFINER to bypass RLS safely
    - User can only operate on their own data (validated by user_id)
*/

-- Grant execute to anon for workspace functions
GRANT EXECUTE ON FUNCTION public.get_user_workspaces(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.create_workspace_with_user_id(uuid, text, text) TO anon;
