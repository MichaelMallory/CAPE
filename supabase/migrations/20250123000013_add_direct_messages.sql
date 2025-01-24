-- Create chat_connections table to track chat relationships between users
CREATE TABLE chat_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES profiles(id),
    user2_id UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id) -- Ensures consistent ordering and prevents duplicate connections
);

-- Create direct_messages table
CREATE TABLE direct_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id UUID NOT NULL REFERENCES chat_connections(id),
    sender_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX idx_chat_connections_users ON chat_connections(user1_id, user2_id);
CREATE INDEX idx_direct_messages_connection ON direct_messages(connection_id, created_at DESC);
CREATE INDEX idx_direct_messages_sender ON direct_messages(sender_id);

-- Create function to update chat_connections updated_at
CREATE OR REPLACE FUNCTION update_chat_connection_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_connections
    SET updated_at = NEW.created_at
    WHERE id = NEW.connection_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update chat_connections updated_at on new message
CREATE TRIGGER update_chat_connection_timestamp
    AFTER INSERT ON direct_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_connection_timestamp();

-- Enable Row Level Security
ALTER TABLE chat_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_connections
CREATE POLICY "Users can view their own chat connections"
    ON chat_connections FOR SELECT
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chat connections with other users"
    ON chat_connections FOR INSERT
    WITH CHECK (auth.uid() IN (user1_id, user2_id));

-- Create policies for direct_messages
CREATE POLICY "Users can view messages in their connections"
    ON direct_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_connections
            WHERE id = direct_messages.connection_id
            AND (auth.uid() = user1_id OR auth.uid() = user2_id)
        )
    );

CREATE POLICY "Users can send messages in their connections"
    ON direct_messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM chat_connections
            WHERE id = connection_id
            AND (auth.uid() = user1_id OR auth.uid() = user2_id)
        )
    ); 