import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

export type TicketPriority = 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA';
export type TicketStatus = 'NEW' | 'IN_PROGRESS' | 'CLOSED' | 'RESOLVED';
export type TicketType = 'MISSION' | 'EQUIPMENT' | 'INTELLIGENCE';

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  priority: TicketPriority;
  status: TicketStatus;
  type: TicketType;
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
  objectives?: string[];
  comments?: Array<{
    content: string;
    created_at: string;
    user_type: 'HERO' | 'SUPPORT';
  }>;
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
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metrics, setMetrics] = useState<QueueMetrics | null>(null);
  const [heroWorkloads, setHeroWorkloads] = useState<HeroWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Keep a ref to the latest tickets state to avoid stale closures
  const ticketsRef = useRef<Ticket[]>([]);
  // Keep refs for subscription channels to prevent cleanup on re-renders
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);
  
  useEffect(() => {
    ticketsRef.current = tickets;
  }, [tickets]);

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

  // Set up real-time subscription
  const setupSubscriptions = useCallback(() => {
    if (!currentUser) return;

    // Only set up subscriptions if they don't exist
    if (channelsRef.current.length > 0) {
      console.log('🎫 [REALTIME] Subscriptions already exist, skipping setup');
      return;
    }

    const isSupport = currentUser.user_metadata?.role === 'SUPPORT';
    const isHero = currentUser.user_metadata?.role === 'HERO';

    console.log('🎫 [REALTIME] Setting up subscription:', { 
      userId: currentUser.id, 
      role: currentUser.user_metadata?.role,
      isSupport,
      isHero
    });

    // Ticket changes channel
    const ticketChannel = supabase
      .channel('ticket-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: isSupport ? undefined : `or(created_by.eq.${currentUser.id},assigned_to.eq.${currentUser.id})`
        },
        (payload) => {
          console.log('🎫 [REALTIME] Received ticket update:', {
            eventType: payload.eventType,
            ticketId: payload.eventType === 'DELETE' ? payload.old?.id : payload.new?.id,
            currentUserId: currentUser.id,
            isCreatedByUser: payload.eventType !== 'DELETE' && payload.new?.created_by === currentUser.id,
            isAssignedToUser: payload.eventType !== 'DELETE' && payload.new?.assigned_to === currentUser.id,
            currentTickets: ticketsRef.current.map(t => t.id)
          });
          
          if (payload.eventType === 'INSERT') {
            const newTicket = payload.new as Ticket;
            
            // Skip if we already have this ticket (from optimistic update)
            if (ticketsRef.current.some(t => t.id === newTicket.id)) {
              console.log('🎫 [REALTIME] Ticket already exists in state (optimistic update), skipping');
              return;
            }

            // For heroes, only show tickets they created or are assigned to
            if (isHero && newTicket.created_by !== currentUser.id && newTicket.assigned_to !== currentUser.id) {
              console.log('🎫 [REALTIME] Ticket not relevant for hero, skipping');
              return;
            }

            // Add the ticket to state
            setTickets(current => {
              const updatedTickets = [newTicket, ...current].sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
              ticketsRef.current = updatedTickets;
              return updatedTickets;
            });

            console.log('🎫 [REALTIME] Added new ticket to state:', {
              ticketId: newTicket.id,
              totalTickets: ticketsRef.current.length,
              ticketIds: ticketsRef.current.map(t => t.id)
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedTicket = payload.new as Ticket;
            
            // For heroes, only show tickets they created or are assigned to
            if (isHero && updatedTicket.created_by !== currentUser.id && updatedTicket.assigned_to !== currentUser.id) {
              setTickets(current => {
                const filtered = current.filter(t => t.id !== updatedTicket.id);
                ticketsRef.current = filtered;
                return filtered;
              });
              return;
            }

            // Update the ticket in state
            setTickets(current => {
              const updated = current.map(ticket => 
                ticket.id === updatedTicket.id ? updatedTicket : ticket
              ).sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
              ticketsRef.current = updated;
              return updated;
            });

            console.log('🎫 [REALTIME] Updated ticket in state:', {
              ticketId: updatedTicket.id,
              totalTickets: ticketsRef.current.length,
              ticketIds: ticketsRef.current.map(t => t.id)
            });
          } else if (payload.eventType === 'DELETE') {
            setTickets(current => {
              const filtered = current.filter(t => t.id !== payload.old.id);
              ticketsRef.current = filtered;
              return filtered;
            });
          }
        }
      );

    const channels = [ticketChannel];
    
    // Subscribe to all channels
    channels.forEach(channel => {
      channel.subscribe((status) => {
        console.log('🎫 [REALTIME] Subscription status:', status);
      });
    });

    // Store channels in ref
    channelsRef.current = channels;

    // Cleanup function
    return () => {
      // Only cleanup if component is actually unmounting
      if (!currentUser) {
        console.log('🎫 [REALTIME] Cleaning up subscriptions (component unmounting)');
        channels.forEach(channel => channel.unsubscribe());
        channelsRef.current = [];
      }
    };
  }, [currentUser]);

  // Initialize subscriptions when user is available
  useEffect(() => {
    if (currentUser) {
      setupSubscriptions();
    }
  }, [currentUser, setupSubscriptions]);

  // Create ticket function
  const createTicket = async (data: Partial<Ticket>): Promise<Ticket> => {
    console.log('🎫 [CREATE] Starting ticket creation with data:', { data });
    
    // Ensure subscriptions are active before creating ticket
    if (channelsRef.current.length === 0) {
      console.log('🎫 [CREATE] Reestablishing subscriptions before ticket creation');
      setupSubscriptions();
    }

    if (!currentUser?.id) {
      console.error('🎫 [CREATE] Error: No User ID available');
      throw new Error('User must be authenticated to create a ticket');
    }

    if (isCreatingTicket) {
      console.log('🎫 [CREATE] Already creating a ticket, waiting...');
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isCreatingTicket) {
            clearInterval(checkInterval);
            resolve(createTicket(data));
          }
        }, 100);
      });
    }

    try {
      setIsCreatingTicket(true);
      console.log('🎫 [CREATE] Current tickets state:', ticketsRef.current);

      const newTicket = {
        ...data,
        created_by: currentUser.id,
        status: 'NEW',
        type: data.type || 'MISSION',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          ...data.metadata,
          created_at: new Date().toISOString(),
          creator_role: currentUser.user_metadata?.role || 'HERO',
          creator_id: currentUser.id
        }
      };

      console.log('🎫 [CREATE] Prepared new ticket:', newTicket);

      // Create the ticket
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert(newTicket)
        .select()
        .single();

      if (error) {
        console.error('🎫 [CREATE] Supabase error creating ticket:', error);
        throw error;
      }
      
      console.log('🎫 [CREATE] Ticket created in database:', ticket);

      // Immediately update local state with optimistic update
      const updatedTickets = [ticket, ...ticketsRef.current];
      setTickets(updatedTickets);
      ticketsRef.current = updatedTickets;

      console.log('🎫 [CREATE] State updated:', {
        newTicket: ticket,
        totalTickets: updatedTickets.length,
        ticketIds: updatedTickets.map(t => t.id)
      });

      // Show success notification
      toast({
        title: "🎫 Support Ticket Created!",
        description: "Your support ticket has been sent to our team. They will review it shortly.",
        className: "font-comic border-2 border-black shadow-lg bg-green-100",
      });
      
      return ticket;
    } catch (error) {
      console.error('🎫 [CREATE] Error in createTicket:', error);
      
      toast({
        title: "Error Creating Ticket",
        description: error instanceof Error ? error.message : "Failed to create ticket. Please try again.",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsCreatingTicket(false);
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
    // This is now a no-op as we handle the update in the modal
    console.log('🎫 useQueueSystem - assignTicket is now a no-op, assignment handled in modal');
    return Promise.resolve();
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