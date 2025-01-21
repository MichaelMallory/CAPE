/// <reference lib="deno.ns" />
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from '../_shared/cors';
import { Database } from '../_shared/database.types';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCachedData, buildCacheKey } from '../_shared/cache';
import { subscribeToTableChanges, handleTableChange } from '../_shared/updates';

interface DashboardMetrics {
  activeHeroes: number;
  activeMissions: number;
  equipmentStatus: {
    operational: number;
    maintenance: number;
    damaged: number;
  };
  ticketMetrics: {
    total: number;
    byPriority: Record<string, number>;
    byStatus: Record<string, number>;
    averageResolutionTime: number;
  };
  recentActivity: {
    missions: number;
    equipment: number;
    alerts: number;
  };
}

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Get active heroes count
  const { count: activeHeroes } = await supabase
    .from('heroes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ACTIVE');

  // Get active missions count
  const { count: activeMissions } = await supabase
    .from('missions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ACTIVE');

  // Get equipment status counts
  const { data: equipmentCounts } = await supabase
    .from('equipment')
    .select('status')
    .then(({ data }) => {
      const counts = {
        operational: 0,
        maintenance: 0,
        damaged: 0,
      };
      data?.forEach((item) => {
        counts[item.status.toLowerCase() as keyof typeof counts]++;
      });
      return { data: counts };
    });

  // Get ticket metrics
  const { data: tickets } = await supabase
    .from('tickets')
    .select('priority, status, created_at, resolved_at');

  const ticketMetrics = {
    total: tickets?.length ?? 0,
    byPriority: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
    averageResolutionTime: 0,
  };

  let totalResolutionTime = 0;
  let resolvedTickets = 0;

  tickets?.forEach((ticket) => {
    // Count by priority
    ticketMetrics.byPriority[ticket.priority] = 
      (ticketMetrics.byPriority[ticket.priority] || 0) + 1;

    // Count by status
    ticketMetrics.byStatus[ticket.status] = 
      (ticketMetrics.byStatus[ticket.status] || 0) + 1;

    // Calculate resolution time for resolved tickets
    if (ticket.resolved_at) {
      const resolutionTime = 
        new Date(ticket.resolved_at).getTime() - 
        new Date(ticket.created_at).getTime();
      totalResolutionTime += resolutionTime;
      resolvedTickets++;
    }
  });

  // Calculate average resolution time in hours
  ticketMetrics.averageResolutionTime = 
    resolvedTickets > 0 
      ? (totalResolutionTime / resolvedTickets) / (1000 * 60 * 60)
      : 0;

  // Get recent activity counts (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: recentMissions },
    { count: recentEquipment },
    { count: recentAlerts }
  ] = await Promise.all([
    supabase
      .from('missions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneDayAgo),
    supabase
      .from('equipment')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', oneDayAgo),
    supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneDayAgo)
  ]);

  return {
    activeHeroes: activeHeroes ?? 0,
    activeMissions: activeMissions ?? 0,
    equipmentStatus: equipmentCounts ?? {
      operational: 0,
      maintenance: 0,
      damaged: 0
    },
    ticketMetrics,
    recentActivity: {
      missions: recentMissions ?? 0,
      equipment: recentEquipment ?? 0,
      alerts: recentAlerts ?? 0
    }
  };
}

// Set up real-time subscriptions
subscribeToTableChanges(handleTableChange);

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get metrics with caching
    const metrics = await getCachedData<DashboardMetrics>(
      buildCacheKey('dashboard', 'metrics'),
      fetchDashboardMetrics,
      {
        ttl: 30, // Cache for 30 seconds
        staleWhileRevalidate: 60 // Allow serving stale data for up to 1 minute while revalidating
      }
    );

    return new Response(
      JSON.stringify(metrics),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
}); 