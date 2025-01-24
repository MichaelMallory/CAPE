'use client';

import { useAuth } from '@/hooks/use-auth';
import { ChatPanel } from '@/components/chat/chat-panel';

export function TeamChat() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="h-full pb-8">
      <div className="h-[300px]">
        <ChatPanel 
          currentUserId={user.id} 
          className="h-full" 
        />
      </div>
    </div>
  );
} 