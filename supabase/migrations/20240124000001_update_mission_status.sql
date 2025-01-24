-- First, drop any existing constraints that use the enum
ALTER TABLE missions DROP CONSTRAINT IF EXISTS missions_status_check;

-- Drop the existing enum if it exists
DROP TYPE IF EXISTS mission_status;

-- Create the enum with all required statuses
CREATE TYPE mission_status AS ENUM (
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'ACKNOWLEDGED'
);

-- First, remove the default value
ALTER TABLE missions ALTER COLUMN status DROP DEFAULT;

-- Update the missions table to use the new enum
ALTER TABLE missions ALTER COLUMN status TYPE mission_status USING status::text::mission_status;

-- Set the default value after the type change
ALTER TABLE missions ALTER COLUMN status SET DEFAULT 'PENDING'::mission_status; 