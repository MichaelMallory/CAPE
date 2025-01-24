'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDirectMessages, type ChatMessage } from '@/hooks/use-direct-messages';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { SpeechBubble } from '@/components/ui/speech-bubble';

interface ChatInterfaceProps {
  currentUserId: string;
  connectionId: string;
  className?: string;
}

export function ChatInterface({ currentUserId, connectionId, className }: ChatInterfaceProps) {
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage } = useDirectMessages({ currentUserId });
  const currentMessages = messages[connectionId] || [];

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [connectionId, scrollToBottom]);

  const handleSendMessage = async () => {
    const content = messageInputRef.current?.value.trim();
    if (!content) return;

    try {
      await sendMessage(connectionId, content);
      if (messageInputRef.current) {
        messageInputRef.current.value = '';
      }
      scrollToBottom();
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={cn('flex flex-col h-full max-h-full overflow-hidden', className)}>
      <ScrollArea className="flex-1 p-2 min-h-0">
        <div className="space-y-2">
          {currentMessages.map((message: ChatMessage) => {
            const isSender = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  isSender ? 'justify-end' : 'justify-start',
                  'px-2'
                )}
              >
                <SpeechBubble
                  variant="speech"
                  position={isSender ? 'right' : 'left'}
                  className="min-h-[40px] max-w-[85%]"
                >
                  <div className="flex flex-col justify-between gap-1">
                    <p className="text-sm break-words font-comic">{message.content}</p>
                    <span className="text-xs text-gray-500 font-comic">
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </SpeechBubble>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-2 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            ref={messageInputRef}
            placeholder="Type a message..."
            onKeyDown={handleKeyPress}
            className="flex-1 font-comic border-2 border-black rounded-lg"
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage}
            className="bg-white hover:bg-gray-50 border-2 border-black text-black rounded-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 