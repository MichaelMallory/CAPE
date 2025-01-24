'use client';

import { useAuth } from '@/hooks/use-auth';
import { ChatPanel } from '@/components/chat/chat-panel';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AlertCenter() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <section
      aria-label="Alert Center"
      className="flex flex-col"
      style={{
        height: '300px', // Smaller fixed height
        maxHeight: '300px' // Ensure it never grows beyond this
      }}
    >
      <ScrollArea className="flex-1 w-full">
        <div className="p-2">
          <ChatPanel currentUserId={user.id} />
        </div>
      </ScrollArea>
    </section>
  );
} 