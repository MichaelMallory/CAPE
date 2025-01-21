-- Drop existing foreign key constraints
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_assigned_to_fkey;
ALTER TABLE maintenance_records DROP CONSTRAINT IF EXISTS maintenance_records_performed_by_fkey;
ALTER TABLE mission_assignments DROP CONSTRAINT IF EXISTS mission_assignments_hero_id_fkey;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_assigned_to_fkey;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_created_by_fkey;
ALTER TABLE ticket_comments DROP CONSTRAINT IF EXISTS ticket_comments_author_id_fkey;

-- Recreate foreign key constraints with proper deletion behavior
ALTER TABLE equipment 
    ADD CONSTRAINT equipment_assigned_to_fkey 
    FOREIGN KEY (assigned_to) 
    REFERENCES heroes(id) 
    ON DELETE SET NULL;

ALTER TABLE maintenance_records 
    ADD CONSTRAINT maintenance_records_performed_by_fkey 
    FOREIGN KEY (performed_by) 
    REFERENCES heroes(id) 
    ON DELETE SET NULL;

ALTER TABLE mission_assignments 
    ADD CONSTRAINT mission_assignments_hero_id_fkey 
    FOREIGN KEY (hero_id) 
    REFERENCES heroes(id) 
    ON DELETE CASCADE;

ALTER TABLE tickets 
    ADD CONSTRAINT tickets_assigned_to_fkey 
    FOREIGN KEY (assigned_to) 
    REFERENCES heroes(id) 
    ON DELETE SET NULL;

ALTER TABLE tickets 
    ADD CONSTRAINT tickets_created_by_fkey 
    FOREIGN KEY (created_by) 
    REFERENCES heroes(id) 
    ON DELETE SET NULL;

ALTER TABLE ticket_comments 
    ADD CONSTRAINT ticket_comments_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES heroes(id) 
    ON DELETE CASCADE; 