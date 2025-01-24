-- Create ticket type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE ticket_type AS ENUM ('MISSION', 'EQUIPMENT', 'INTELLIGENCE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add type column to tickets table
ALTER TABLE tickets ADD COLUMN type ticket_type NOT NULL DEFAULT 'MISSION';

-- Create index for type column
CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(type); 