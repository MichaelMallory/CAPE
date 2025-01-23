-- Create test users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test@example.com', crypt('TestPass123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');

-- Create profiles for test users
INSERT INTO public.profiles (id, role, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'HERO', now(), now())
ON CONFLICT (id) DO UPDATE 
SET role = EXCLUDED.role;
