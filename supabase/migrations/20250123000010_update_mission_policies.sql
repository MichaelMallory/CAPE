-- Enable RLS on missions table
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Missions are viewable by authenticated users with sufficient clearance" ON missions;
DROP POLICY IF EXISTS "Missions can be updated by assigned heroes and support staff" ON missions;
DROP POLICY IF EXISTS "Missions can be created by support staff" ON missions;

-- Create updated policies
CREATE POLICY "Missions are viewable by authenticated users with sufficient clearance"
ON missions FOR SELECT
TO authenticated
USING (true);  -- Allow all authenticated users to view missions initially

CREATE POLICY "Missions can be created by authenticated users"
ON missions FOR INSERT
TO authenticated
WITH CHECK (true);  -- Allow all authenticated users to create missions

CREATE POLICY "Missions can be updated by assigned heroes and support staff"
ON missions FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM mission_assignments 
        WHERE mission_id = id 
        AND hero_id = auth.uid()::uuid
    )
    OR auth.jwt()->>'role' = 'SUPPORT'
    OR auth.jwt()->>'role' = 'ADMIN'
); 