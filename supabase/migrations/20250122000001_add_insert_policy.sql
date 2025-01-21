-- Drop the policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create the INSERT policy
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id); 