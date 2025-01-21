import { useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

export type TicketPriority = 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA';
export type TicketStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

interface Ticket {
  id: string;
  title: string;
  description?: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  last_escalated_at?: string;
  response_time?: string;
  resolution_time?: string;
  tags: string[];
  metadata: Record<string, any>;
}

interface QueueMetrics {
  avg_response_time: string;
  avg_resolution_time: string;
  queue_length: number;
  resolution_rate: number;
  priority_distribution: Record<TicketPriority, number>;
  workload_distribution: Record<string, number>;
}

interface HeroWorkload {
  hero_id: string;
  current_tasks: number;
  total_tasks_today: number;
  last_assignment_at?: string;
  specialties: string[];
  availability_status: string;
}

interface UseQueueSystemReturn {
  tickets: Ticket[];
  metrics: QueueMetrics | null;
  heroWorkloads: HeroWorkload[];
  isLoading: boolean;
  error: Error | null;
  createTicket: (data: Partial<Ticket>) => Promise<Ticket>;
  updateTicket: (id: string, data: Partial<Ticket>) => Promise<Ticket>;
  assignTicket: (ticketId: string, heroId: string) => Promise<void>;
  getRecommendedHeroes: (ticketId: string) => Promise<HeroWorkload[]>;
}

export function useQueueSystem(): UseQueueSystemReturn {
  const supabase = useSupabaseClient();
  const user = useUser();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metrics, setMetrics] = useState<QueueMetrics | null>(null);
  const [heroWorkloads, setHeroWorkloads] = useState<HeroWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        // Load tickets
        const { data: ticketData, error: ticketError } = await supabase
          .from('tickets')
          .select('*')
          .order('priority', { ascending: false })
          .order('created_at', { ascending: true });

        if (ticketError) throw ticketError;
        setTickets(ticketData);

        // Load metrics
        const { data: metricData, error: metricError } = await supabase
          .from('ticket_metrics')
          .select('*')
          .order('calculated_at', { ascending: false })
          .limit(1)
          .single();

        if (metricError && metricError.code !== 'PGRST116') throw metricError;
        setMetrics(metricData);

        // Load hero workloads
        const { data: workloadData, error: workloadError } = await supabase
          .from('hero_workload')
          .select('*')
          .order('current_tasks', { ascending: true });

        if (workloadError) throw workloadError;
        setHeroWorkloads(workloadData);
      } catch (err) {
        console.error('Error loading queue data:', err);
        setError(err instanceof Error ? err : new Error('Failed to load queue data'));
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [supabase]);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        async (payload) => {
          // Reload tickets to get fresh data
          const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .order('priority', { ascending: false })
            .order('created_at', { ascending: true });

          if (error) {
            console.error('Error reloading tickets:', error);
            return;
          }

          setTickets(data);

          // Show notification for new tickets
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'New Ticket',
              description: `${payload.new.title} (${payload.new.priority})`,
            });
          }
        }
      )
      .subscribe();

    setSubscription(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, toast]);

  // Create ticket function
  const createTicket = async (data: Partial<Ticket>): Promise<Ticket> => {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        ...data,
        created_by: user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return ticket;
  };

  // Update ticket function
  const updateTicket = async (id: string, data: Partial<Ticket>): Promise<Ticket> => {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return ticket;
  };

  // Assign ticket function
  const assignTicket = async (ticketId: string, heroId: string): Promise<void> => {
    const { error } = await supabase
      .from('tickets')
      .update({
        assigned_to: heroId,
        status: 'ASSIGNED',
        response_time: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (error) throw error;
  };

  // Get recommended heroes function
  const getRecommendedHeroes = async (ticketId: string): Promise<HeroWorkload[]> => {
    // Get ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('priority, tags')
      .eq('id', ticketId)
      .single();

    if (ticketError) throw ticketError;

    // Get hero workloads with matching specialties
    const { data: heroes, error: heroError } = await supabase
      .from('hero_workload')
      .select('*')
      .contains('specialties', ticket.tags)
      .eq('availability_status', 'AVAILABLE')
      .order('current_tasks', { ascending: true })
      .order('last_assignment_at', { ascending: true });

    if (heroError) throw heroError;
    return heroes;
  };

  return {
    tickets,
    metrics,
    heroWorkloads,
    isLoading,
    error,
    createTicket,
    updateTicket,
    assignTicket,
    getRecommendedHeroes,
  };
} 