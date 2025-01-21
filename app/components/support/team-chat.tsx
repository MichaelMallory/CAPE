import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User } from 'lucide-react';
import { useState } from 'react';

const MOCK_MESSAGES = [
  {
    id: '1',
    sender: 'Captain Thunder',
    message: 'Need backup at the harbor, multiple hostiles detected.',
    timestamp: '2m ago',
  },
  {
    id: '2',
    sender: 'Support Team',
    message: 'Dispatching Frost Queen and Shadow Walker to your location.',
    timestamp: '1m ago',
  },
  {
    id: '3',
    sender: 'Frost Queen',
    message: 'ETA 3 minutes to harbor.',
    timestamp: 'Just now',
  },
];

export function TeamChat() {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    // Add message handling logic here
    setMessage('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <Badge variant="outline">Online: 12</Badge>
          <Badge variant="outline">Active Chats: 3</Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 mb-4">
        <div className="space-y-4">
          {MOCK_MESSAGES.map((msg) => (
            <div
              key={msg.id}
              className="bg-gray-900/50 p-3 rounded-lg border border-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium text-sm">{msg.sender}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {msg.timestamp}
                </Badge>
              </div>
              <p className="text-sm text-gray-300">{msg.message}</p>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1"
        />
        <Button onClick={handleSend} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 