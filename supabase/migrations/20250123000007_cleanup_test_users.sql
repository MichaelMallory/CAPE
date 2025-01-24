-- First, delete all profiles
TRUNCATE public.profiles CASCADE;

-- Delete all auth data
TRUNCATE auth.users CASCADE;
TRUNCATE auth.identities CASCADE;
TRUNCATE auth.sessions CASCADE;
TRUNCATE auth.refresh_tokens CASCADE;
TRUNCATE auth.mfa_factors CASCADE;
TRUNCATE auth.mfa_challenges CASCADE;
TRUNCATE auth.mfa_amr_claims CASCADE;

-- Reset the auth schema
DELETE FROM auth.schema_migrations; 