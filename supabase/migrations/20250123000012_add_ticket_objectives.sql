-- Add objectives column to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS objectives TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update existing tickets to move objectives from description if they exist
UPDATE tickets 
SET objectives = ARRAY[description]
WHERE objectives IS NULL OR array_length(objectives, 1) IS NULL;

-- Create index for objectives
CREATE INDEX IF NOT EXISTS idx_tickets_objectives ON tickets USING GIN (objectives); 