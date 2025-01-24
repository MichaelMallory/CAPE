-- Add last_escalated_at column to tickets table if it doesn't exist
DO $$ BEGIN
    ALTER TABLE tickets ADD COLUMN last_escalated_at TIMESTAMPTZ;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS handle_ticket_escalation ON tickets;

-- Create or replace the ticket escalation function
CREATE OR REPLACE FUNCTION handle_ticket_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update last_escalated_at if status is changing
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.last_escalated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER handle_ticket_escalation
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION handle_ticket_escalation(); 