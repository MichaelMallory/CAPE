'use client';

import { formatDistanceToNow } from 'date-fns';
import { Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  type: 'STATUS_CHANGE' | 'PRIORITY_CHANGE' | 'ASSIGNMENT' | 'COMMENT';
  content: string;
  created_at: string;
  actor: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  metadata?: {
    old_value?: string;
    new_value?: string;
  };
}

const EVENT_COLORS = {
  STATUS_CHANGE: 'text-blue-500',
  PRIORITY_CHANGE: 'text-orange-500',
  ASSIGNMENT: 'text-purple-500',
  COMMENT: 'text-green-500',
} as const;

export function TicketTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div data-testid="timeline" className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
      
      <ul className="space-y-4">
        {events.map((event, index) => (
          <li
            key={event.id}
            className={cn(
              'relative pl-10',
              index === 0 && 'animate-highlight'
            )}
          >
            <div className="absolute left-0 p-2">
              <Circle className={cn('h-4 w-4', EVENT_COLORS[event.type])} />
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      {event.actor.avatar_url && (
                        <img
                          src={event.actor.avatar_url}
                          alt={event.actor.name}
                          className="h-5 w-5 rounded-full"
                        />
                      )}
                      <span className="font-medium">{event.actor.name}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(event.created_at))} ago
                    </span>
                  </div>
                  <p className="text-sm">{event.content}</p>
                  {event.metadata && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {event.type === 'STATUS_CHANGE' && (
                        <>
                          Changed status from{' '}
                          <span className="font-medium">{event.metadata.old_value}</span> to{' '}
                          <span className="font-medium">{event.metadata.new_value}</span>
                        </>
                      )}
                      {event.type === 'PRIORITY_CHANGE' && (
                        <>
                          Changed priority from{' '}
                          <span className="font-medium">{event.metadata.old_value}</span> to{' '}
                          <span className="font-medium">{event.metadata.new_value}</span>
                        </>
                      )}
                      {event.type === 'ASSIGNMENT' && (
                        <>
                          {event.metadata.old_value ? (
                            <>
                              Reassigned from{' '}
                              <span className="font-medium">{event.metadata.old_value}</span> to{' '}
                              <span className="font-medium">{event.metadata.new_value}</span>
                            </>
                          ) : (
                            <>
                              Assigned to{' '}
                              <span className="font-medium">{event.metadata.new_value}</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 