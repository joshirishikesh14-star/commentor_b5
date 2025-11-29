/*
  # Update Default Monthly Cost to $10

  Changes the default monthly_cost from $5.00 to $10.00 for workspace members.
*/

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workspace_members' 
    AND column_name = 'monthly_cost'
  ) THEN
    ALTER TABLE workspace_members 
    ALTER COLUMN monthly_cost SET DEFAULT 10.00;
  END IF;
END $$;
