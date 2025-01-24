'use client';

import { useState } from 'react';
import { UserSearch } from './user-search';
import { ChatInterface } from './chat-interface';
import { useDirectMessages } from '@/hooks/use-direct-messages';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ChatPanelProps {
  currentUserId: string;
  className?: string;
}

export function ChatPanel({ currentUserId, className }: ChatPanelProps) {
  const {
    connections,
    activeConnectionId,
    setActiveConnectionId,
    startChat,
    isLoading,
  } = useDirectMessages({ currentUserId });

  const handleUserSelect = async (user: { id: string }) => {
    const connectionId = await startChat(user.id);
    if (connectionId) {
      setActiveConnectionId(connectionId);
    }
  };

  return (
    <div className={cn('flex flex-col h-full max-h-full overflow-hidden', className)}>
      <div className="border-b p-2 bg-background z-[1] flex-shrink-0">
        <UserSearch
          currentUserId={currentUserId}
          onSelectUser={handleUserSelect}
        />
      </div>

      <div className="grid grid-cols-[200px,1fr] flex-1 min-h-0">
        <div className="border-r overflow-hidden">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Loading conversations...
              </div>
            ) : connections.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {connections.map((connection) => (
                  <Button
                    key={connection.id}
                    variant={
                      connection.id === activeConnectionId
                        ? 'secondary'
                        : 'ghost'
                    }
                    className="w-full justify-start"
                    onClick={() => setActiveConnectionId(connection.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {connection.other_user.full_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-medium truncate">
                            {connection.other_user.full_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(
                              new Date(connection.updated_at),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="overflow-hidden">
          {activeConnectionId ? (
            <ChatInterface
              currentUserId={currentUserId}
              connectionId={activeConnectionId}
              className="h-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Select a conversation or start a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 