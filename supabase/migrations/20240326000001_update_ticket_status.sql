-- First, update any existing tickets that use 'PENDING' status
UPDATE tickets SET status = 'IN_PROGRESS' WHERE status = 'PENDING';

-- Drop the default value for the status column
ALTER TABLE tickets ALTER COLUMN status DROP DEFAULT;

-- Temporarily change the type of the status column to text
ALTER TABLE tickets ALTER COLUMN status TYPE text;

-- Drop the existing enum type
DROP TYPE ticket_status;

-- Recreate the enum type with CLOSED instead of PENDING
CREATE TYPE ticket_status AS ENUM ('NEW', 'IN_PROGRESS', 'CLOSED', 'RESOLVED');

-- Change the column back to use the enum type
ALTER TABLE tickets ALTER COLUMN status TYPE ticket_status USING status::ticket_status;

-- Set the default value back
ALTER TABLE tickets ALTER COLUMN status SET DEFAULT 'NEW'::ticket_status; 