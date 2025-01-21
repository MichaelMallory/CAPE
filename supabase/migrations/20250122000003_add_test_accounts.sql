-- Create test accounts with proper UUIDs
DO $$
BEGIN
  -- Insert test support user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_support@cape.dev') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      '00000000-0000-4000-a000-000000000001',
      'test_support@cape.dev',
      crypt('test_support123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}'
    );
  END IF;

  -- Insert test hero user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test_hero@cape.dev') THEN
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
    VALUES (
      '00000000-0000-4000-a000-000000000002',
      'test_hero@cape.dev',
      crypt('test_hero123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}'
    );
  END IF;

  -- Insert support profile if not exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '00000000-0000-4000-a000-000000000001') THEN
    INSERT INTO public.profiles (id, codename, real_name, role, status, clearance_level)
    VALUES (
      '00000000-0000-4000-a000-000000000001',
      'Mission Control',
      'Test Support',
      'SUPPORT',
      'ACTIVE',
      5
    );
  END IF;

  -- Insert hero profile if not exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '00000000-0000-4000-a000-000000000002') THEN
    INSERT INTO public.profiles (id, codename, real_name, role, status, clearance_level)
    VALUES (
      '00000000-0000-4000-a000-000000000002',
      'Test Hero',
      'Test Hero Real Name',
      'HERO',
      'ACTIVE',
      3
    );
  END IF;
END
$$; 