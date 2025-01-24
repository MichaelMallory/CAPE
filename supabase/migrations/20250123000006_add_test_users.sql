-- Create test users with specific roles
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role)
VALUES 
  (gen_random_uuid(), 'test@example.com', crypt('TestPass123!', gen_salt('bf')), now(), 'authenticated'),
  (gen_random_uuid(), 'support@hero-hq.com', crypt('SupportPass123!', gen_salt('bf')), now(), 'authenticated');

-- Add user profiles with roles
INSERT INTO public.profiles (id, codename, real_name, role, status, clearance_level)
SELECT 
  id,
  CASE 
    WHEN email = 'test@example.com' THEN 'TestHero_' || substr(id::text, 1, 8)
    WHEN email = 'support@hero-hq.com' THEN 'MissionControl_' || substr(id::text, 1, 8)
  END as codename,
  CASE 
    WHEN email = 'test@example.com' THEN 'Test Hero Real Name'
    WHEN email = 'support@hero-hq.com' THEN 'Support Staff Real Name'
  END as real_name,
  CASE 
    WHEN email = 'test@example.com' THEN 'HERO'::user_role
    WHEN email = 'support@hero-hq.com' THEN 'SUPPORT'::user_role
  END as role,
  'ACTIVE'::user_status as status,
  CASE 
    WHEN email = 'test@example.com' THEN 3
    WHEN email = 'support@hero-hq.com' THEN 5
  END as clearance_level
FROM auth.users
WHERE email IN ('test@example.com', 'support@hero-hq.com');

-- Enable row level security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; 