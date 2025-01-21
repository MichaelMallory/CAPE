'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Panel } from '@/components/ui/panel';
import { TicketHeader } from '@/components/hero/ticket-header';
import { TicketTimeline } from '@/components/hero/ticket-timeline';
import { TicketComments } from '@/components/hero/ticket-comments';
import { TicketActions } from '@/components/hero/ticket-actions';
import { RelatedTickets } from '@/components/hero/related-tickets';

interface PageProps {
  params: {
    id: string;
  };
}

export default function TicketDetailPage({ params }: PageProps) {
  const [ticket, setTicket] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [relatedTickets, setRelatedTickets] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Fetch ticket details
    const fetchTicket = async () => {
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('*, assigned_to:heroes(*)')
        .eq('id', params.id)
        .single();

      if (ticketData) {
        setTicket(ticketData);
      }
    };

    // Fetch timeline events
    const fetchEvents = async () => {
      const { data: eventData } = await supabase
        .from('ticket_events')
        .select('*, actor:profiles(*)')
        .eq('ticket_id', params.id)
        .order('created_at', { ascending: false });

      if (eventData) {
        setEvents(eventData);
      }
    };

    // Fetch comments
    const fetchComments = async () => {
      const { data: commentData } = await supabase
        .from('comments')
        .select('*, author:profiles(*), replies:comments!parent_id(*)')
        .eq('ticket_id', params.id)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (commentData) {
        setComments(commentData);
      }
    };

    // Fetch related tickets
    const fetchRelatedTickets = async () => {
      const { data: relatedData } = await supabase.rpc('get_related_tickets', {
        p_ticket_id: params.id,
        p_limit: 3,
      });

      if (relatedData) {
        setRelatedTickets(relatedData);
      }
    };

    // Fetch current user
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setCurrentUser(profile);
        }
      }
    };

    // Fetch all data
    Promise.all([
      fetchTicket(),
      fetchEvents(),
      fetchComments(),
      fetchRelatedTickets(),
      fetchCurrentUser(),
    ]);

    // Subscribe to real-time updates
    const channel = supabase
      .channel('ticket-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${params.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setTicket((prev: any) => ({ ...prev, ...payload.new }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_events',
          filter: `ticket_id=eq.${params.id}`,
        },
        async (payload) => {
          const { data: event } = await supabase
            .from('ticket_events')
            .select('*, actor:profiles(*)')
            .eq('id', payload.new.id)
            .single();

          if (event) {
            setEvents((prev) => [event, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `ticket_id=eq.${params.id}`,
        },
        async (payload) => {
          const { data: comment } = await supabase
            .from('comments')
            .select('*, author:profiles(*)')
            .eq('id', payload.new.id)
            .single();

          if (comment) {
            if (!comment.parent_id) {
              setComments((prev) => [comment, ...prev]);
            } else {
              setComments((prev) =>
                prev.map((c) =>
                  c.id === comment.parent_id
                    ? { ...c, replies: [...(c.replies || []), comment] }
                    : c
                )
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id]);

  if (!ticket || !currentUser) {
    return (
      <div className="container mx-auto py-8">
        <Panel title="Loading...">
          <div className="h-96 flex items-center justify-center">
            <div className="text-lg text-muted-foreground">Loading ticket details...</div>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Panel title={ticket.title}>
            <TicketHeader
              title={ticket.title}
              status={ticket.status}
              priority={ticket.priority}
              category={ticket.category}
              created_at={ticket.created_at}
              updated_at={ticket.updated_at}
              assigned_to={ticket.assigned_to}
            />
          </Panel>

          <Panel title="Timeline">
            <TicketTimeline events={events} />
          </Panel>

          <Panel title="Comments">
            <TicketComments
              ticketId={params.id}
              comments={comments}
              currentUser={currentUser}
            />
          </Panel>
        </div>

        <div className="space-y-8">
          <Panel title="Actions">
            <TicketActions
              ticketId={params.id}
              currentStatus={ticket.status}
              currentPriority={ticket.priority}
              assignedTo={ticket.assigned_to}
            />
          </Panel>

          <Panel title="Related">
            <RelatedTickets tickets={relatedTickets} />
          </Panel>
        </div>
      </div>
    </div>
  );
} 