-- Create enum types if they don't exist
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

-- Drop heroes table if it exists since we're starting fresh
DROP TABLE IF EXISTS heroes CASCADE;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Drop profiles table if it exists
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table for all users
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_clearance_level ON profiles(clearance_level);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Profiles are viewable by authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
ON profiles FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 
        FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.role = 'ADMIN'::user_role
    )
); 