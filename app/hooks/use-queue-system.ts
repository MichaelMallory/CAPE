import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

export type TicketPriority = 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA';
export type TicketStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED' | 'ASSIGNED';
  priority: 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA';
  type: 'MISSION' | 'EQUIPMENT' | 'INTELLIGENCE';
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  comments?: Array<{
    content: string;
    created_at: string;
    user_id: string;
    user_type: 'HERO' | 'SUPPORT';
  }>;
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
  const router = useRouter();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metrics, setMetrics] = useState<QueueMetrics | null>(null);
  const [heroWorkloads, setHeroWorkloads] = useState<HeroWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check authentication and get current user
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        router.push('/login');
        return;
      }

      if (!session) {
        router.push('/login');
        return;
      }

      setCurrentUser(session.user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
        return;
      }
      setCurrentUser(session.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Load data function
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Check user role from metadata
      const isSupport = currentUser.user_metadata?.role === 'SUPPORT';

      // Query tickets based on role
      const ticketsQuery = supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      // Support staff can see all tickets, heroes only see their own
      if (!isSupport) {
        ticketsQuery.or(`created_by.eq.${currentUser.id},assigned_to.eq.${currentUser.id}`);
      }

      const { data: ticketsData, error: ticketsError } = await ticketsQuery;

      if (ticketsError) throw ticketsError;
      setTickets(ticketsData || []);

      // Only fetch metrics for support staff
      if (isSupport) {
        const { data: metricsData, error: metricsError } = await supabase
          .from('queue_metrics')
          .select('*')
          .single();

        if (metricsError) throw metricsError;
        setMetrics(metricsData);

        const { data: workloadsData, error: workloadsError } = await supabase
          .from('hero_workloads')
          .select('*')
          .order('current_tasks', { ascending: true });

        if (workloadsError) throw workloadsError;
        setHeroWorkloads(workloadsData || []);
      }

    } catch (err) {
      setError(err as Error);
      toast({
        title: 'Error loading queue data',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, toast]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up realtime subscription
  useEffect(() => {
    if (!currentUser) return;

    const isSupport = currentUser.user_metadata?.role === 'SUPPORT';
    const filter = isSupport ? undefined : `or(created_by.eq.${currentUser.id},assigned_to.eq.${currentUser.id})`;

    const channel = supabase
      .channel('queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUser, loadData]);

  // Create ticket function
  const createTicket = async (data: Partial<Ticket>): Promise<Ticket> => {
    console.log('🎫 useQueueSystem - Creating Ticket', { data });
    if (!currentUser?.id) {
      console.error('🎫 useQueueSystem - No User ID');
      throw new Error('User must be authenticated to create a ticket');
    }

    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          ...data,
          created_by: currentUser.id,
          status: 'NEW',
          type: data.type,
          metadata: {
            ...data.metadata,
            created_at: new Date().toISOString(),
          }
        })
        .select()
        .single();

      if (error) {
        console.error('🎫 useQueueSystem - Error Creating Ticket:', error);
        throw error;
      }
      
      console.log('🎫 useQueueSystem - Ticket Created Successfully', { ticket });
      
      // Optimistically update the tickets list
      setTickets(prev => [ticket, ...prev]);
      
      return ticket;
    } catch (error) {
      console.error('🎫 useQueueSystem - Error Creating Ticket:', error);
      throw error;
    }
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