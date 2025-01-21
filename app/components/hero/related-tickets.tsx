'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface RelatedTicket {
  id: string;
  title: string;
  status: 'NEW' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED';
  priority: 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA';
  category: 'MISSION' | 'EQUIPMENT' | 'INTELLIGENCE';
  similarity_score: number;
}

const STATUS_COLORS = {
  NEW: 'bg-blue-500',
  IN_PROGRESS: 'bg-yellow-500',
  PENDING: 'bg-purple-500',
  RESOLVED: 'bg-green-500',
} as const;

const PRIORITY_COLORS = {
  OMEGA: 'bg-red-500',
  ALPHA: 'bg-orange-500',
  BETA: 'bg-yellow-500',
  GAMMA: 'bg-blue-500',
} as const;

export function RelatedTickets({ tickets }: { tickets: RelatedTicket[] }) {
  const router = useRouter();

  return (
    <div role="region" aria-label="Related Tickets">
      <h2 className="text-lg font-semibold mb-4">Related Tickets</h2>
      <div className="space-y-2">
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No related tickets found</p>
        ) : (
          tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => router.push(`/hero/tickets/${ticket.id}`)}
              className="w-full text-left"
              data-testid="related-ticket"
            >
              <div className="rounded-lg border bg-card p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{ticket.title}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge
                        className={cn('font-semibold', STATUS_COLORS[ticket.status])}
                      >
                        {ticket.status}
                      </Badge>
                      <Badge
                        className={cn('font-semibold', PRIORITY_COLORS[ticket.priority])}
                      >
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline">{ticket.category}</Badge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(ticket.similarity_score * 100)}% match
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
} 