-- Enable RLS on all tables
ALTER TABLE heroes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for heroes table
CREATE POLICY "Heroes are viewable by authenticated users with sufficient clearance"
ON heroes FOR SELECT
TO authenticated
USING ((auth.jwt()->>'clearance_level')::int >= clearance_level);

CREATE POLICY "Heroes can be updated by themselves or higher clearance"
ON heroes FOR UPDATE
TO authenticated
USING (
    auth.uid()::uuid = id 
    OR (auth.jwt()->>'clearance_level')::int > clearance_level
);

-- Create policies for equipment table
CREATE POLICY "Equipment is viewable by authenticated users"
ON equipment FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Equipment can be updated by assigned hero or support staff"
ON equipment FOR UPDATE
TO authenticated
USING (
    auth.uid()::uuid = assigned_to 
    OR (auth.jwt()->>'role' = 'support_staff')
);

-- Create policies for maintenance_records table
CREATE POLICY "Maintenance records are viewable by authenticated users"
ON maintenance_records FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Maintenance records can be created by support staff"
ON maintenance_records FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'role' = 'support_staff');

-- Create policies for missions table
CREATE POLICY "Missions are viewable by authenticated users with sufficient clearance"
ON missions FOR SELECT
TO authenticated
USING (
    (auth.jwt()->>'clearance_level')::int >= threat_level
);

CREATE POLICY "Missions can be updated by assigned heroes and support staff"
ON missions FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM mission_assignments 
        WHERE mission_id = id 
        AND hero_id = auth.uid()::uuid
    )
    OR (auth.jwt()->>'role' = 'support_staff')
);

-- Create policies for mission_assignments table
CREATE POLICY "Mission assignments are viewable by authenticated users"
ON mission_assignments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Mission assignments can be managed by support staff"
ON mission_assignments FOR ALL
TO authenticated
USING (auth.jwt()->>'role' = 'support_staff');

-- Create policies for tickets table
CREATE POLICY "Tickets are viewable by authenticated users"
ON tickets FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Tickets can be created by any authenticated user"
ON tickets FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Tickets can be updated by assigned hero or support staff"
ON tickets FOR UPDATE
TO authenticated
USING (
    auth.uid()::uuid = assigned_to
    OR auth.uid()::uuid = created_by
    OR (auth.jwt()->>'role' = 'support_staff')
);

-- Create policies for ticket_comments table
CREATE POLICY "Ticket comments are viewable by authenticated users"
ON ticket_comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Ticket comments can be created by authenticated users"
ON ticket_comments FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE missions;
ALTER PUBLICATION supabase_realtime ADD TABLE equipment;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_comments; 