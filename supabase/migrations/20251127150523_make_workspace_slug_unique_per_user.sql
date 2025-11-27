/*
  # Make workspace slug unique per user

  1. Changes
    - Remove global UNIQUE constraint on workspaces.slug
    - Add composite UNIQUE constraint on (owner_id, slug)
    - This allows different users to create workspaces with the same slug
    
  2. Examples
    - User A can create workspace "house" with slug "house"
    - User B can also create workspace "house" with slug "house"
    - Both workspaces exist independently in the database
    
  3. Security
    - Maintains data integrity per user
    - Prevents duplicate slugs within a user's workspaces
*/

-- Drop the existing global unique constraint on slug
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'workspaces_slug_key'
  ) THEN
    ALTER TABLE public.workspaces DROP CONSTRAINT workspaces_slug_key;
  END IF;
END $$;

-- Add composite unique constraint on (owner_id, slug)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'workspaces_owner_id_slug_key'
  ) THEN
    ALTER TABLE public.workspaces 
    ADD CONSTRAINT workspaces_owner_id_slug_key 
    UNIQUE (owner_id, slug);
  END IF;
END $$;