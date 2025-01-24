-- Create ticket comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_author_id ON ticket_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_created_at ON ticket_comments(created_at);

-- Enable RLS
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Comments are viewable by authenticated users"
ON ticket_comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own comments"
ON ticket_comments FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = author_id
);

-- Create trigger for updated_at
CREATE TRIGGER update_ticket_comments_updated_at
    BEFORE UPDATE ON ticket_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 