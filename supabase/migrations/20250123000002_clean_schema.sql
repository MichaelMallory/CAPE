-- Drop existing tables and types
DROP TABLE IF EXISTS hero_workload CASCADE;
DROP TABLE IF EXISTS ticket_history CASCADE;
DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Recreate core enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('HERO', 'SUPPORT', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    codename VARCHAR(100) NOT NULL UNIQUE,
    real_name VARCHAR(200),
    role user_role NOT NULL DEFAULT 'HERO',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    clearance_level INTEGER NOT NULL DEFAULT 1,
    team_affiliations TEXT[] DEFAULT ARRAY[]::TEXT[],
    powers TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Create tickets table
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority ticket_priority NOT NULL DEFAULT 'BETA',
    status ticket_status NOT NULL DEFAULT 'NEW',
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_escalated_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Create RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create RLS policies for tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tickets are viewable by authenticated users"
ON tickets FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Tickets can be created by authenticated users"
ON tickets FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Tickets can be updated by assigned users, creators, or support staff"
ON tickets FOR UPDATE
TO authenticated
USING (
    auth.uid() = assigned_to
    OR auth.uid() = created_by
    OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'SUPPORT'
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 