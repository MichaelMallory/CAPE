-- Create activity_type enum
DO $$ BEGIN
    CREATE TYPE activity_type AS ENUM ('MISSION_COMPLETED', 'MISSION_FAILED', 'MISSION_STARTED', 'TICKET_RESOLVED', 'TICKET_ASSIGNED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create hero_activity table
CREATE TABLE IF NOT EXISTS hero_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hero_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_hero_activity_hero_id ON hero_activity(hero_id);
CREATE INDEX idx_hero_activity_created_at ON hero_activity(created_at DESC);
CREATE INDEX idx_hero_activity_type ON hero_activity(activity_type);

-- Enable RLS
ALTER TABLE hero_activity ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Hero activity is viewable by the hero and support staff"
ON hero_activity FOR SELECT
TO authenticated
USING (
    hero_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('SUPPORT', 'ADMIN')
    )
);

CREATE POLICY "Heroes can insert their own activity"
ON hero_activity FOR INSERT
TO authenticated
WITH CHECK (
    hero_id = auth.uid()
);

-- Create trigger for updated_at
CREATE TRIGGER update_hero_activity_updated_at
    BEFORE UPDATE ON hero_activity
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 