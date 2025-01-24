-- Drop existing tables in correct order (due to dependencies)
DROP TABLE IF EXISTS mission_assignments CASCADE;
DROP TABLE IF EXISTS missions CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS mission_status CASCADE;

-- Create mission_status enum
CREATE TYPE mission_status AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED',
    'ACKNOWLEDGED'
);

-- Create missions table
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    status mission_status NOT NULL DEFAULT 'PENDING',
    threat_level INTEGER NOT NULL CHECK (threat_level BETWEEN 1 AND 10),
    location JSONB,
    objectives TEXT[],
    completed_objectives_count INTEGER DEFAULT 0,
    casualties INTEGER DEFAULT 0,
    collateral_damage NUMERIC(10,2) DEFAULT 0,
    after_action_report TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create mission_assignments table
CREATE TABLE mission_assignments (
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    hero_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (mission_id, hero_id)
);

-- Create indexes
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_threat_level ON missions(threat_level);

-- Create update trigger for updated_at
CREATE TRIGGER update_missions_updated_at
    BEFORE UPDATE ON missions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
