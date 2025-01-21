-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE ticket_priority AS ENUM ('OMEGA', 'ALPHA', 'BETA', 'GAMMA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('NEW', 'IN_PROGRESS', 'PENDING', 'RESOLVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_type AS ENUM ('MISSION', 'EQUIPMENT', 'INTELLIGENCE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hero_status AS ENUM ('ACTIVE', 'INACTIVE', 'MIA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE equipment_status AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'DAMAGED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('HERO', 'SUPPORT', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create heroes table
CREATE TABLE IF NOT EXISTS heroes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codename VARCHAR(100) NOT NULL UNIQUE,
    real_name VARCHAR(200),
    powers TEXT[],
    clearance_level INTEGER NOT NULL DEFAULT 1,
    team_affiliations TEXT[],
    status hero_status NOT NULL DEFAULT 'ACTIVE',
    role user_role NOT NULL DEFAULT 'HERO',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status equipment_status NOT NULL DEFAULT 'OPERATIONAL',
    assigned_to UUID REFERENCES heroes(id) ON DELETE SET NULL,
    specifications JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    description TEXT NOT NULL,
    performed_by UUID REFERENCES heroes(id) ON DELETE SET NULL,
    next_maintenance_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create missions table
CREATE TABLE IF NOT EXISTS missions (
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
CREATE TABLE IF NOT EXISTS mission_assignments (
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    hero_id UUID REFERENCES heroes(id) ON DELETE CASCADE,
    role VARCHAR(100) NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (mission_id, hero_id)
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ticket_priority NOT NULL DEFAULT 'BETA',
    status ticket_status NOT NULL DEFAULT 'NEW',
    type ticket_type NOT NULL,
    location JSONB,
    assigned_to UUID REFERENCES heroes(id) ON DELETE SET NULL,
    created_by UUID REFERENCES heroes(id) ON DELETE SET NULL,
    related_mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    related_equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB
);

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES heroes(id) ON DELETE CASCADE,
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
DO $$ BEGIN
    CREATE TRIGGER update_heroes_updated_at
        BEFORE UPDATE ON heroes
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_equipment_updated_at
        BEFORE UPDATE ON equipment
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_missions_updated_at
        BEFORE UPDATE ON missions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_tickets_updated_at
        BEFORE UPDATE ON tickets
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_ticket_comments_updated_at
        BEFORE UPDATE ON ticket_comments
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_type ON tickets(type);
CREATE INDEX IF NOT EXISTS idx_heroes_status ON heroes(status);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_threat_level ON missions(threat_level); 