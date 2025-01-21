-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    target_role user_role,
    target_hero UUID REFERENCES profiles(id) ON DELETE CASCADE,
    related_mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    related_ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Create hero_timeline table if it doesn't exist
CREATE TABLE IF NOT EXISTS hero_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_target_role ON alerts(target_role);
CREATE INDEX IF NOT EXISTS idx_hero_timeline_hero_id ON hero_timeline(hero_id);
CREATE INDEX IF NOT EXISTS idx_hero_timeline_created_at ON hero_timeline(created_at DESC);

-- Enable RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_timeline ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for alerts
CREATE POLICY "Alerts are viewable by authenticated users with matching role"
ON alerts FOR SELECT
TO authenticated
USING (
    target_role IS NULL 
    OR target_role = (
        SELECT role FROM profiles WHERE id = auth.uid()
    )
    OR target_hero = auth.uid()
);

CREATE POLICY "Support staff can acknowledge alerts"
ON alerts FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'SUPPORT'
    )
)
WITH CHECK (
    acknowledged_by = auth.uid()
);

-- Create RLS policies for hero_timeline
CREATE POLICY "Timeline entries are viewable by the hero and support staff"
ON hero_timeline FOR SELECT
TO authenticated
USING (
    hero_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('SUPPORT', 'ADMIN')
    )
);

-- Add trigger for updated_at on alerts
CREATE TRIGGER update_alerts_updated_at
    BEFORE UPDATE ON alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 