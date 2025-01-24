-- Add completed_objectives_count column to missions table
ALTER TABLE missions ADD COLUMN completed_objectives_count INTEGER DEFAULT 0;

-- Update existing missions to set the count based on metadata if it exists
UPDATE missions 
SET completed_objectives_count = COALESCE(
  JSONB_ARRAY_LENGTH(metadata->'completed_objectives'), 
  0
); 