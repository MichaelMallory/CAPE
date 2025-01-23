'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Mission {
  id: string;
  title: string;
  hero: string;
  location: string;
  progress: number;
  status: 'preparing' | 'in-progress' | 'critical';
  eta: string;
}

const mockMissions: Mission[] = [
  {
    id: 'M-001',
    title: 'Downtown Bank Heist Response',
    hero: 'Captain Thunder',
    location: 'Central City Bank',
    progress: 75,
    status: 'in-progress',
    eta: '15 min'
  },
  {
    id: 'M-002',
    title: 'Supervillain Pursuit',
    hero: 'Swift Shadow',
    location: 'Harbor District',
    progress: 30,
    status: 'critical',
    eta: '45 min'
  },
  {
    id: 'M-003',
    title: 'Civilian Evacuation',
    hero: 'Guardian',
    location: 'Metro Station',
    progress: 10,
    status: 'preparing',
    eta: '5 min'
  }
];

export function ActiveMissions() {
  const [missions] = useState<Mission[]>(mockMissions);

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {mission.id}
                  </span>
                  <Badge variant={
                    mission.status === 'critical' ? 'destructive' :
                    mission.status === 'in-progress' ? 'default' :
                    'secondary'
                  }>
                    {mission.status}
                  </Badge>
                </div>
                <h3 className="font-medium">{mission.title}</h3>
              </div>
              <span className="text-sm text-muted-foreground">
                ETA: {mission.eta}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{mission.hero}</span>
                <span>{mission.location}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{mission.progress}%</span>
                </div>
                <Progress value={mission.progress} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 