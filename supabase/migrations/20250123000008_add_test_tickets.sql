-- Add test tickets
INSERT INTO tickets (title, description, priority, status, created_by)
SELECT 
  'Test Unassigned Ticket',
  'This is a test ticket that needs assignment',
  'BETA'::ticket_priority,
  'NEW'::ticket_status,
  id
FROM auth.users 
WHERE email = 'test@example.com'
LIMIT 1;

INSERT INTO tickets (title, description, priority, status, created_by)
SELECT 
  'High Priority Mission',
  'Urgent mission requiring immediate attention',
  'OMEGA'::ticket_priority,
  'NEW'::ticket_status,
  id
FROM auth.users 
WHERE email = 'test@example.com'
LIMIT 1;

INSERT INTO tickets (title, description, priority, status, created_by)
SELECT 
  'Equipment Maintenance Request',
  'Regular maintenance check needed',
  'GAMMA'::ticket_priority,
  'NEW'::ticket_status,
  id
FROM auth.users 
WHERE email = 'test@example.com'
LIMIT 1; 