-- Create support_closed_tickets table
CREATE TABLE IF NOT EXISTS support_closed_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    support_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    closed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB,
    UNIQUE(support_id, ticket_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_support_closed_tickets_support_id ON support_closed_tickets(support_id);

-- Enable RLS
ALTER TABLE support_closed_tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Support closed tickets are viewable by authenticated users"
ON support_closed_tickets FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Support staff can insert their own closed tickets"
ON support_closed_tickets FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = support_id
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'SUPPORT'
    )
);

-- Create trigger function to automatically track closed tickets
CREATE OR REPLACE FUNCTION track_closed_tickets()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'CLOSED' AND OLD.status != 'CLOSED' THEN
        INSERT INTO support_closed_tickets (support_id, ticket_id)
        VALUES (auth.uid(), NEW.id)
        ON CONFLICT (support_id, ticket_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on tickets table
CREATE TRIGGER track_ticket_closure
    AFTER UPDATE ON tickets
    FOR EACH ROW
    WHEN (NEW.status = 'CLOSED' AND OLD.status != 'CLOSED')
    EXECUTE FUNCTION track_closed_tickets(); 