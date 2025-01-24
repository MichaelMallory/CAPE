-- Drop existing foreign key constraints
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_assigned_to_fkey;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_created_by_fkey;

-- Recreate foreign key constraints to reference profiles instead of heroes
ALTER TABLE tickets 
    ADD CONSTRAINT tickets_assigned_to_fkey 
    FOREIGN KEY (assigned_to) 
    REFERENCES profiles(id) 
    ON DELETE SET NULL;

ALTER TABLE tickets 
    ADD CONSTRAINT tickets_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES profiles(id) 
    ON DELETE SET NULL;

-- Drop existing ticket policies
DROP POLICY IF EXISTS "Tickets can be updated by assigned hero or support staff" ON tickets;
DROP POLICY IF EXISTS "Support staff can update tickets" ON tickets;
DROP POLICY IF EXISTS "Heroes can update their tickets" ON tickets;

-- Create new ticket update policy
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