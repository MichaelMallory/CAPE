'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, RotateCw } from 'lucide-react';
import { MissionDetailsModal } from './mission-details-modal';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  FAILED: 'bg-red-500',
  ACKNOWLEDGED: 'bg-gray-500',
} as const;

const PRIORITY_COLORS = {
  OMEGA: 'bg-red-500',
  ALPHA: 'bg-orange-500',
  BETA: 'bg-yellow-500',
  GAMMA: 'bg-blue-500',
} as const;

const THREAT_LEVELS = {
  1: 'Alpha',
  2: 'Beta',
  3: 'Gamma',
  4: 'Delta',
  5: 'Omega'
} as const;

const getThreatLevelLabel = (level: number): string => {
  return THREAT_LEVELS[level as keyof typeof THREAT_LEVELS] || `Level ${level}`;
};

interface Mission {
  id: string;
  name: string;
  status: keyof typeof STATUS_COLORS;
  threat_level: number;
  location: string;
  objectives: string[];
  casualties: number;
  collateral_damage: number;
  completed_objectives_count: number;
  metadata?: {
    completed_objectives?: string[];
    progress_notes?: string;
    completed_at?: string;
    final_casualties?: number;
    final_collateral_damage?: number;
    final_notes?: string;
    assigned_hero_id?: string;
    mission_id?: string;
    ticket_priority?: keyof typeof PRIORITY_COLORS;
  };
  created_at: string;
  updated_at: string;
}

interface TicketWithMission {
  related_mission_id: string;
  missions: Mission;
}

export function MissionStatusCards() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const fetchMissions = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        return;
      }

      console.log('Fetching missions for user:', user.id);

      const { data, error } = await supabase
        .from('missions')
        .select(`
          id,
          name,
          status,
          threat_level,
          location,
          objectives,
          casualties,
          collateral_damage,
          completed_objectives_count,
          metadata,
          created_at,
          updated_at
        `)
        .eq('metadata->>assigned_hero_id', user.id)
        .in('status', ['PENDING', 'IN_PROGRESS', 'COMPLETED'])
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Get the ticket IDs from the metadata
      const ticketIds = data
        .map(mission => mission.metadata?.ticket_id)
        .filter(Boolean);

      // Fetch the tickets to get their priorities
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, priority')
        .in('id', ticketIds);

      if (ticketsError) {
        console.error('Error fetching ticket priorities:', ticketsError);
      }

      // Create a map of ticket priorities
      const ticketPriorities = new Map(
        tickets?.map(ticket => [ticket.id, ticket.priority]) || []
      );

      // Update the missions data to include the ticket priority
      const missionsWithPriority = data.map(mission => ({
        ...mission,
        metadata: {
          ...mission.metadata,
          ticket_priority: ticketPriorities.get(mission.metadata?.ticket_id) || 'GAMMA'
        }
      }));

      console.log('Fetched missions:', missionsWithPriority);
      setMissions(missionsWithPriority);

      toast({
        title: "Missions Refreshed",
        description: `Found ${data.length} active missions.`,
        className: "font-comic border-2 border-black shadow-lg bg-blue-100",
      });
    } catch (error) {
      console.error('Error fetching missions:', error);
      toast({
        title: 'Error fetching missions',
        description: 'Failed to load your missions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <section aria-label="Mission Status" className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-comic">Active Missions</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMissions}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RotateCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Refreshing..." : "Refresh Missions"}
          </Button>
        </div>
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No active missions at the moment.</p>
        </div>
      </section>
    );
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const renderMissionCard = (mission: Mission) => {
    // Calculate progress based on completed count and total objectives
    const totalObjectives = mission.objectives.length;
    const completedCount = mission.completed_objectives_count || 0;
    const completedObjectives = mission.metadata?.completed_objectives || [];
    const progress = totalObjectives > 0 ? (completedCount / totalObjectives) * 100 : 0;

    console.log('Rendering mission card:', {
      id: mission.id,
      name: mission.name,
      completedCount,
      completedObjectives,
      totalObjectives,
      progress,
      status: mission.status
    });

    const handleRemove = async () => {
      try {
        const { error } = await supabase
          .from('missions')
          .update({ status: 'ACKNOWLEDGED' })
          .eq('id', mission.id);

        if (error) throw error;

        // Immediately update local state to remove the mission
        setMissions(current => current.filter(m => m.id !== mission.id));

        toast({
          title: 'Mission removed',
          description: 'The completed mission has been removed from your active missions.'
        });
      } catch (error) {
        console.error('Error removing mission:', error);
        toast({
          title: 'Error removing mission',
          description: 'Failed to remove the mission. Please try again.',
          variant: 'destructive'
        });
      }
    };

    return (
      <Card
        key={mission.id}
        role="article"
        className={cn(
          "relative overflow-hidden border-2 hover:border-primary/50 transition-colors",
          mission.status === 'COMPLETED' && "border-green-500 bg-green-50/50"
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-comic text-lg">{mission.name}</span>
              <Badge className={cn(
                PRIORITY_COLORS[mission.metadata?.ticket_priority || 'GAMMA'],
                "text-white font-medium"
              )}>
                {mission.metadata?.ticket_priority || 'GAMMA'}
              </Badge>
            </div>
            <Badge
              role="status"
              className={STATUS_COLORS[mission.status]}
            >
              {mission.status.replace('_', ' ')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-sm font-medium">
                {Math.round(progress)}% ({completedCount}/{totalObjectives})
              </div>
            </div>
            <Progress
              role="meter"
              aria-label="Mission Progress"
              value={progress}
              max={100}
              className="h-2"
              indicatorClassName={getProgressColor(progress)}
            />
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Location</div>
            <div className="font-medium">{mission.location}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Objectives</div>
            <ul className="list-disc list-inside space-y-1">
              {mission.objectives.slice(0, 2).map((objective, i) => (
                <li key={i} className={cn(
                  "text-sm",
                  completedObjectives.includes(objective) && "line-through text-muted-foreground"
                )}>
                  {objective}
                </li>
              ))}
              {mission.objectives.length > 2 && (
                <li className="text-sm text-muted-foreground">
                  +{mission.objectives.length - 2} more
                </li>
              )}
            </ul>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1 justify-between"
              onClick={() => setSelectedMission(mission)}
            >
              View Details
              <ArrowRight className="h-4 w-4" />
            </Button>
            {mission.status === 'COMPLETED' && (
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={handleRemove}
              >
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <section
      aria-label="Mission Status"
      className="space-y-4"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-comic">Active Missions</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMissions}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RotateCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          {isRefreshing ? "Refreshing..." : "Refresh Missions"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : missions.length === 0 ? (
        <div className="text-center p-8 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No active missions at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missions.map(renderMissionCard)}
        </div>
      )}

      <MissionDetailsModal
        mission={selectedMission}
        open={!!selectedMission}
        onOpenChange={(open) => !open && setSelectedMission(null)}
      />
    </section>
  );
} 