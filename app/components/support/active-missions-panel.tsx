'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { ComicDialog } from '@/components/ui/comic-dialog';
import { cn } from '@/lib/utils';

interface Mission {
  id: string;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ACKNOWLEDGED';
  threat_level: number;
  location: string;
  objectives: string[];
  casualties: number;
  collateral_damage: number;
  metadata?: {
    completed_objectives?: string[];
    progress_notes?: string;
    completed_at?: string;
    final_casualties?: number;
    final_collateral_damage?: number;
    final_notes?: string;
    assigned_hero_name?: string;
  };
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  ACKNOWLEDGED: 'bg-gray-500',
} as const;

export function ActiveMissionsPanel() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  useEffect(() => {
    // Initial fetch of active missions
    const fetchMissions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
          metadata,
          created_at,
          updated_at
        `)
        .eq('metadata->>created_from_ticket', true)
        .eq('metadata->>created_by', user.id)
        .in('status', ['PENDING', 'IN_PROGRESS', 'COMPLETED'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching missions:', error);
        toast({
          title: 'Error fetching missions',
          description: 'Failed to load active missions. Please refresh the page.',
          variant: 'destructive'
        });
        return;
      }

      if (data) {
        setMissions(data);
      }

      // Subscribe to real-time updates
      const channel = supabase
        .channel('mission-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'missions',
            filter: `metadata->>created_by=eq.${user.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setMissions((current) => [payload.new as Mission, ...current].sort((a, b) => b.threat_level - a.threat_level));
            } else if (payload.eventType === 'UPDATE') {
              setMissions((current) => {
                const updated = current.map((mission) =>
                  mission.id === payload.new.id ? { ...payload.new as Mission } : mission
                );
                // Remove acknowledged missions
                return updated
                  .filter(m => m.status !== 'ACKNOWLEDGED')
                  .sort((a, b) => b.threat_level - a.threat_level);
              });
              if (selectedMission?.id === payload.new.id) {
                setSelectedMission(payload.new as Mission);
              }
            } else if (payload.eventType === 'DELETE') {
              setMissions((current) =>
                current.filter((mission) => mission.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    };

    fetchMissions();
  }, []);

  const handleAcknowledge = async (mission: Mission) => {
    try {
      setIsAcknowledging(true);
      const { error } = await supabase
        .from('missions')
        .update({
          status: 'ACKNOWLEDGED',
          metadata: {
            ...mission.metadata,
            acknowledged_at: new Date().toISOString()
          }
        })
        .eq('id', mission.id);

      if (error) throw error;

      toast({
        title: 'Mission acknowledged',
        description: 'The mission has been acknowledged and archived.'
      });

      setSelectedMission(null);
    } catch (error) {
      console.error('Error acknowledging mission:', error);
      toast({
        title: 'Error acknowledging mission',
        description: 'Failed to acknowledge mission. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsAcknowledging(false);
    }
  };

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[600px]">
        <div className="space-y-4 p-4">
          {missions.map((mission) => (
            <Card
              key={mission.id}
              className={cn(
                "border-2 hover:border-primary/50 transition-colors",
                mission.status === 'COMPLETED' && "border-green-500"
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="font-comic text-lg">{mission.name}</span>
                  <Badge className={STATUS_COLORS[mission.status]}>
                    {mission.status.replace('_', ' ')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Assigned To:</span>{' '}
                    {mission.metadata?.assigned_hero_name || 'Unassigned'}
                  </div>
                  <div>
                    <span className="font-medium">Threat Level:</span> {mission.threat_level}
                  </div>
                  <div>
                    <span className="font-medium">Injuries:</span> {mission.casualties}
                  </div>
                  <div>
                    <span className="font-medium">Collateral Damage:</span> ${mission.collateral_damage.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Progress</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {Math.round((mission.metadata?.completed_objectives?.length || 0) / mission.objectives.length * 100)}%
                      </span>
                      {mission.status === 'COMPLETED' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <Progress
                    value={(mission.metadata?.completed_objectives?.length || 0)}
                    max={mission.objectives.length}
                    className="h-2"
                  />
                </div>

                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => setSelectedMission(mission)}
                >
                  View Details
                  <Eye className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {selectedMission && (
        <ComicDialog
          onClose={() => setSelectedMission(null)}
          className="w-full max-w-4xl"
        >
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{selectedMission.name}</h2>
                <Badge className={STATUS_COLORS[selectedMission.status]}>
                  {selectedMission.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Location:</span> {selectedMission.location}
                </div>
                <div>
                  <span className="font-medium">Threat Level:</span> {selectedMission.threat_level}
                </div>
                <div>
                  <span className="font-medium">Injuries:</span> {selectedMission.casualties}
                </div>
                <div>
                  <span className="font-medium">Collateral Damage:</span> ${selectedMission.collateral_damage.toLocaleString()}
                </div>
                {selectedMission.status === 'COMPLETED' && (
                  <>
                    <div>
                      <span className="font-medium">Final Casualties:</span> {selectedMission.metadata?.final_casualties}
                    </div>
                    <div>
                      <span className="font-medium">Final Collateral Damage:</span> ${selectedMission.metadata?.final_collateral_damage?.toLocaleString()}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Objectives</h3>
              <div className="space-y-2">
                {selectedMission.objectives.map((objective, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 
                      className={cn(
                        "h-4 w-4",
                        selectedMission.metadata?.completed_objectives?.includes(objective)
                          ? "text-green-500"
                          : "text-gray-300"
                      )}
                    />
                    <span className={cn(
                      "text-sm",
                      selectedMission.metadata?.completed_objectives?.includes(objective) && 
                      "line-through text-muted-foreground"
                    )}>
                      {objective}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedMission.metadata?.final_notes && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Final Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedMission.metadata.final_notes}
                </p>
              </div>
            )}

            {selectedMission.status === 'COMPLETED' && (
              <Button
                onClick={() => handleAcknowledge(selectedMission)}
                disabled={isAcknowledging}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                {isAcknowledging ? (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2 animate-spin" />
                    Acknowledging...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Acknowledge Mission Completion
                  </>
                )}
              </Button>
            )}
          </div>
        </ComicDialog>
      )}
    </div>
  );
} 