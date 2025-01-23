'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: string;
}

const mockMessages: ChatMessage[] = [
  {
    id: 'M-001',
    sender: {
      name: 'Sarah Chen',
      avatar: '/avatars/sarah.jpg',
      role: 'Support Lead'
    },
    content: 'Team, we have multiple active situations in the downtown area. Please coordinate resources accordingly.',
    timestamp: '10:30 AM'
  },
  {
    id: 'M-002',
    sender: {
      name: 'Marcus Johnson',
      avatar: '/avatars/marcus.jpg',
      role: 'Field Support'
    },
    content: 'Copy that. I\'m redirecting backup units to assist Captain Thunder.',
    timestamp: '10:32 AM'
  },
  {
    id: 'M-003',
    sender: {
      name: 'Alex Rivera',
      avatar: '/avatars/alex.jpg',
      role: 'Tech Support'
    },
    content: 'Communication systems are stable. All heroes are connected and transmitting.',
    timestamp: '10:35 AM'
  }
];

export function TeamChat() {
  const [messages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // In a real app, this would send the message to a backend
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {message.sender.name.charAt(0)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">{message.sender.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {message.sender.role}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {message.timestamp}
                  </span>
                </div>
                
                <p className="text-sm mt-1">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4 flex gap-2">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1"
        />
        <Button
          size="icon"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 