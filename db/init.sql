-- Drop existing tables in correct order (due to dependencies)
DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS mission_assignments CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS maintenance_records CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS heroes CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS ticket_priority CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS ticket_type CASCADE;
DROP TYPE IF EXISTS hero_status CASCADE;
DROP TYPE IF EXISTS equipment_status CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE ticket_priority AS ENUM ('OMEGA', 'ALPHA', 'BETA', 'GAMMA');
CREATE TYPE ticket_status AS ENUM ('NEW', 'IN_PROGRESS', 'PENDING', 'RESOLVED');
CREATE TYPE ticket_type AS ENUM ('MISSION', 'EQUIPMENT', 'INTELLIGENCE');
CREATE TYPE hero_status AS ENUM ('ACTIVE', 'INACTIVE', 'MIA');
CREATE TYPE equipment_status AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'DAMAGED');

-- Create heroes table
CREATE TABLE heroes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codename VARCHAR(100) NOT NULL UNIQUE,
    real_name VARCHAR(200),
    powers TEXT[],
    clearance_level INTEGER NOT NULL DEFAULT 1,
    team_affiliations TEXT[],
    status hero_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Create equipment table
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status equipment_status NOT NULL DEFAULT 'OPERATIONAL',
    assigned_to UUID REFERENCES heroes(id),
    specifications JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Create maintenance_records table
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    maintenance_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT NOT NULL,
    performed_by UUID REFERENCES heroes(id),
    next_maintenance_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create missions table
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    status ticket_status NOT NULL DEFAULT 'NEW',
    threat_level INTEGER NOT NULL CHECK (threat_level BETWEEN 1 AND 10),
    location JSONB,
    objectives TEXT[],
    casualties INTEGER DEFAULT 0,
    collateral_damage NUMERIC(10,2) DEFAULT 0,
    after_action_report TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Create mission_assignments table
CREATE TABLE mission_assignments (
    mission_id UUID REFERENCES missions(id),
    hero_id UUID REFERENCES heroes(id),
    role VARCHAR(100) NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (mission_id, hero_id)
);

-- Create tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ticket_priority NOT NULL DEFAULT 'BETA',
    status ticket_status NOT NULL DEFAULT 'NEW',
    type ticket_type NOT NULL,
    location JSONB,
    assigned_to UUID REFERENCES heroes(id),
    created_by UUID REFERENCES heroes(id),
    related_mission_id UUID REFERENCES missions(id),
    related_equipment_id UUID REFERENCES equipment(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Create ticket_comments table
CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id),
    author_id UUID NOT NULL REFERENCES heroes(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables
CREATE TRIGGER update_heroes_updated_at
    BEFORE UPDATE ON heroes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
    BEFORE UPDATE ON equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missions_updated_at
    BEFORE UPDATE ON missions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at
    BEFORE UPDATE ON ticket_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for common queries
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_type ON tickets(type);
CREATE INDEX idx_heroes_status ON heroes(status);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_threat_level ON missions(threat_level); 