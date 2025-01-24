-- First, delete any remaining profiles (this should cascade to tickets)
TRUNCATE profiles CASCADE;

-- Delete all users from auth.users (this will cascade to other auth tables)
DELETE FROM auth.users;

-- Reset all auth tables to be thorough
TRUNCATE auth.identities CASCADE;
TRUNCATE auth.sessions CASCADE;
TRUNCATE auth.refresh_tokens CASCADE;
TRUNCATE auth.mfa_factors CASCADE;
TRUNCATE auth.mfa_challenges CASCADE;
TRUNCATE auth.mfa_amr_claims CASCADE;

-- Create test users with proper UUIDs
DO $$
DECLARE
  support_user_id uuid := gen_random_uuid();
  hero_user_id uuid := gen_random_uuid();
BEGIN
  -- Create support user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    aud,
    role,
    is_super_admin
  ) VALUES (
    support_user_id,
    '00000000-0000-0000-0000-000000000000',
    'test_support@cape.dev',
    '$2a$10$Q8UGzVGYEKXGxFD/OYyFyOQbPsL9/qdV.hks0LKyHPqKW0Z9kTzmy', -- This is 'test_support123' hashed with bcrypt
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"SUPPORT","clearance_level":5}'::jsonb,
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    null,
    null,
    null,
    'authenticated',
    'authenticated',
    false
  );

  -- Create hero user
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    aud,
    role,
    is_super_admin
  ) VALUES (
    hero_user_id,
    '00000000-0000-0000-0000-000000000000',
    'test_hero@cape.dev',
    '$2a$10$Q8UGzVGYEKXGxFD/OYyFyOQbPsL9/qdV.hks0LKyHPqKW0Z9kTzmy', -- This is 'test_hero123' hashed with bcrypt
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"HERO","clearance_level":3}'::jsonb,
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    null,
    null,
    null,
    'authenticated',
    'authenticated',
    false
  );

  -- Insert support profile
  INSERT INTO public.profiles (id, codename, real_name, role, status, clearance_level)
  VALUES (
    support_user_id,
    'Mission Control',
    'Test Support',
    'SUPPORT',
    'ACTIVE',
    5
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    codename = EXCLUDED.codename,
    real_name = EXCLUDED.real_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    clearance_level = EXCLUDED.clearance_level;

  -- Insert hero profile
  INSERT INTO public.profiles (id, codename, real_name, role, status, clearance_level)
  VALUES (
    hero_user_id,
    'Test Hero',
    'Test Hero Real Name',
    'HERO',
    'ACTIVE',
    3
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    codename = EXCLUDED.codename,
    real_name = EXCLUDED.real_name,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    clearance_level = EXCLUDED.clearance_level;
END
$$; 