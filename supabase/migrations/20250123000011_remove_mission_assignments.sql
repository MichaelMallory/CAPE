-- Drop mission_assignments table and related policies
DROP POLICY IF EXISTS mission_assignments_select ON mission_assignments;
DROP POLICY IF EXISTS mission_assignments_all ON mission_assignments;
DROP TABLE IF EXISTS mission_assignments CASCADE; 