-- Add hero-specific fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS codename TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS real_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS powers TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clearance_level INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_affiliations TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hero_equipment TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hero_metadata JSONB DEFAULT '{}'::jsonb;

-- Add indexes for hero-related fields
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_powers ON profiles USING GIN (powers);
CREATE INDEX IF NOT EXISTS idx_profiles_hero_metadata ON profiles USING GIN (hero_metadata);

-- Add AI analysis table
CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    priority_assessment JSONB NOT NULL,
    threat_analysis JSONB NOT NULL,
    generated_objectives JSONB[] NOT NULL,
    hero_matches JSONB[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ticket_id)
);

-- Add indexes for AI analysis
CREATE INDEX IF NOT EXISTS idx_ai_analyses_ticket ON ai_analyses(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created ON ai_analyses(created_at);

-- Add AI-related columns to tickets if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'tickets' AND column_name = 'objectives') THEN
        ALTER TABLE tickets ADD COLUMN objectives TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'tickets' AND column_name = 'metadata') THEN
        ALTER TABLE tickets ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$; 