import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface Mission {
  id: string;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  progress: number;
  threat_level: number;
  location: string;
  objectives: string[];
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  FAILED: 'bg-red-500',
} as const;

export function MissionStatusCards() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Initial fetch of active missions
    const fetchMissions = async () => {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('threat_level', { ascending: false })
        .limit(3);

      if (!error && data) {
        setMissions(data as Mission[]);
      }
    };

    fetchMissions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('mission-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'missions',
        },
        (payload: RealtimePostgresChangesPayload<Mission>) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setMissions((current) => {
              const updated = [...current];
              const index = updated.findIndex((m) => m.id === payload.new.id);
              if (index >= 0) {
                updated[index] = payload.new;
              }
              return updated;
            });
          }
        }
      )
      .subscribe();

    // Handle custom mission update events (for testing)
    const handleMissionUpdate = (event: CustomEvent<{ id: string; status: Mission['status'] }>) => {
      const { id, status } = event.detail;
      setMissions((current) =>
        current.map((mission) =>
          mission.id === id ? { ...mission, status } : mission
        )
      );
    };

    window.addEventListener('mission-update', handleMissionUpdate as EventListener);

    return () => {
      channel.unsubscribe();
      window.removeEventListener('mission-update', handleMissionUpdate as EventListener);
    };
  }, [supabase, router]);

  return (
    <section
      aria-label="Mission Status"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {missions.map((mission) => (
        <Card
          key={mission.id}
          role="article"
          className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors"
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span className="font-comic text-lg">{mission.name}</span>
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
              <div className="text-sm text-muted-foreground">Progress</div>
              <Progress
                role="meter"
                aria-label="Mission Progress"
                value={mission.progress}
                max={100}
                className="h-2"
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
                  <li key={i} className="text-sm">{objective}</li>
                ))}
                {mission.objectives.length > 2 && (
                  <li className="text-sm text-muted-foreground">
                    +{mission.objectives.length - 2} more
                  </li>
                )}
              </ul>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => router.push(`/missions/${mission.id}`)}
            >
              View Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </section>
  );
} 