-- Drop existing publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create the publication for real-time
CREATE PUBLICATION supabase_realtime;

-- Enable real-time for tickets table
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;

-- Enable replica identity for tickets table to get old record values
ALTER TABLE tickets REPLICA IDENTITY FULL; 