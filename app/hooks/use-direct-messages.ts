import { useCallback, useEffect, useRef, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  connection_id: string;
  created_at: string;
  read_at: string | null;
}

export interface ChatConnection {
  id: string;
  user1_id: string;
  user2_id: string;
  updated_at: string;
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

interface DatabaseUser {
  id: string;
  codename: string;
  real_name: string | null;
}

interface DatabaseConnection {
  id: string;
  user1_id: string;
  user2_id: string;
  updated_at: string;
  user1: DatabaseUser;
  user2: DatabaseUser;
}

interface UseDirectMessagesProps {
  currentUserId: string;
}

export function useDirectMessages({ currentUserId }: UseDirectMessagesProps) {
  const [connections, setConnections] = useState<ChatConnection[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  
  // Track messages we've sent to avoid duplicates from real-time updates
  const sentMessageIds = useRef<Set<string>>(new Set());

  // Fetch user's chat connections
  const fetchConnections = useCallback(async () => {
    const { data: connectionsData, error } = await supabase
      .from('chat_connections')
      .select(`
        id,
        user1_id,
        user2_id,
        updated_at,
        user1:profiles!chat_connections_user1_id_fkey(id, codename, real_name),
        user2:profiles!chat_connections_user2_id_fkey(id, codename, real_name)
      `)
      .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load chat connections',
        variant: 'destructive',
      });
      return;
    }

    const formattedConnections: ChatConnection[] = (connectionsData as unknown as DatabaseConnection[]).map(conn => ({
      id: conn.id,
      user1_id: conn.user1_id,
      user2_id: conn.user2_id,
      updated_at: conn.updated_at,
      other_user: {
        id: conn.user1_id === currentUserId ? conn.user2.id : conn.user1.id,
        full_name: conn.user1_id === currentUserId ? conn.user2.codename : conn.user1.codename,
        avatar_url: null
      }
    }));

    setConnections(formattedConnections);
    return formattedConnections;
  }, [currentUserId, supabase, toast]);

  // Fetch messages for a specific connection
  const fetchMessages = useCallback(async (connectionId: string) => {
    const { data: messagesData, error } = await supabase
      .from('direct_messages')
      .select('*')
      .eq('connection_id', connectionId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
      return;
    }

    // Update sent message IDs for this connection
    sentMessageIds.current = new Set(
      messagesData
        .filter(m => m.sender_id === currentUserId)
        .map(m => m.id)
    );

    setMessages(prev => ({
      ...prev,
      [connectionId]: messagesData,
    }));
  }, [supabase, toast, currentUserId]);

  // Helper function to check for duplicate messages
  const isDuplicateMessage = useCallback((newMessage: ChatMessage, existingMessages: ChatMessage[]) => {
    const logInfo = {
      newMessage: {
        id: newMessage.id,
        content: newMessage.content,
        sender: newMessage.sender_id,
        created_at: newMessage.created_at
      },
      existingCount: existingMessages.length
    };
    console.log('Checking for duplicates:', logInfo);
    toast({
      title: 'Debug: Checking Message',
      description: `New message: ${newMessage.content.slice(0, 30)}... (${existingMessages.length} existing)`,
    });

    const duplicate = existingMessages.some(existing => {
      const timeDiff = Math.abs(new Date(existing.created_at).getTime() - new Date(newMessage.created_at).getTime());
      const isDupe = existing.content === newMessage.content &&
                    existing.sender_id === newMessage.sender_id &&
                    existing.connection_id === newMessage.connection_id &&
                    timeDiff < 2000;
      
      if (isDupe) {
        const dupeInfo = {
          existing: {
            id: existing.id,
            content: existing.content,
            sender: existing.sender_id,
            created_at: existing.created_at
          },
          timeDiff
        };
        console.log('Found duplicate:', dupeInfo);
        toast({
          title: 'Debug: Duplicate Found',
          description: `Duplicate of: ${existing.content.slice(0, 30)}... (${timeDiff}ms apart)`,
          variant: 'destructive'
        });
      }
      return isDupe;
    });

    return duplicate;
  }, [toast]);

  // Send a new message
  const sendMessage = useCallback(async (connectionId: string, content: string) => {
    const { data: message, error } = await supabase
      .from('direct_messages')
      .insert({
        connection_id: connectionId,
        sender_id: currentUserId,
        content,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      return null;
    }

    // Add message to sent messages set
    sentMessageIds.current.add(message.id);

    // Update messages state
    setMessages(prev => ({
      ...prev,
      [connectionId]: [...(prev[connectionId] || []), message],
    }));

    return message;
  }, [currentUserId, supabase, toast]);

  // Start or get existing chat with a user
  const startChat = useCallback(async (otherUserId: string) => {
    const [user1_id, user2_id] = [currentUserId, otherUserId].sort();

    const { data: existing } = await supabase
      .from('chat_connections')
      .select('*')
      .eq('user1_id', user1_id)
      .eq('user2_id', user2_id)
      .single();

    if (existing) {
      setActiveConnectionId(existing.id);
      return existing.id;
    }

    const { data: newConnection, error } = await supabase
      .from('chat_connections')
      .insert({
        user1_id,
        user2_id,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to start chat',
        variant: 'destructive',
      });
      return null;
    }

    await fetchConnections();
    setActiveConnectionId(newConnection.id);
    return newConnection.id;
  }, [currentUserId, supabase, fetchConnections, toast]);

  // Set up real-time subscription
  useEffect(() => {
    if (!currentUserId) return;

    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channel = supabase
      .channel('direct-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          if (sentMessageIds.current.has(newMessage.id)) {
            return;
          }

          if (newMessage.sender_id !== currentUserId) {
            setMessages(prev => {
              const existingMessages = prev[newMessage.connection_id] || [];
              return {
                ...prev,
                [newMessage.connection_id]: [...existingMessages, newMessage],
              };
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_connections',
          filter: `or(user1_id.eq.${currentUserId},user2_id.eq.${currentUserId})`,
        },
        () => {
          fetchConnections();
        }
      );

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId, supabase, fetchConnections]);

  // Initial data fetch
  useEffect(() => {
    if (!currentUserId) return;

    const initialize = async () => {
      setIsLoading(true);
      const conns = await fetchConnections();
      if (conns && conns.length > 0) {
        await fetchMessages(conns[0].id);
        setActiveConnectionId(conns[0].id);
      }
      setIsLoading(false);
    };

    initialize();
  }, [currentUserId, fetchConnections, fetchMessages]);

  return {
    connections,
    messages,
    activeConnectionId,
    isLoading,
    setActiveConnectionId,
    sendMessage,
    startChat,
    fetchMessages,
  };
} 