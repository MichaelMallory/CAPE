import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Users, Clock } from 'lucide-react';

const MOCK_MISSIONS = [
  {
    id: '1',
    name: 'Operation Thunderstrike',
    location: 'Downtown Metro City',
    status: 'IN_PROGRESS',
    progress: 75,
    team: ['Captain Thunder', 'Frost Queen', 'Shadow Walker'],
    timeRemaining: '45m',
  },
  {
    id: '2',
    name: 'Project Safeguard',
    location: 'Harbor District',
    status: 'STARTING',
    progress: 15,
    team: ['Iron Guardian', 'Swift Wind'],
    timeRemaining: '2h',
  },
  {
    id: '3',
    name: 'Crisis Response',
    location: 'Financial District',
    status: 'CRITICAL',
    progress: 90,
    team: ['Quantum', 'Blaze', 'Mind Master', 'Storm Bringer'],
    timeRemaining: '10m',
  },
];

export function ActiveMissions() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <Badge variant="outline">Active: {MOCK_MISSIONS.length}</Badge>
          <Badge variant="outline">Critical: {MOCK_MISSIONS.filter(m => m.status === 'CRITICAL').length}</Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {MOCK_MISSIONS.map((mission) => (
            <div
              key={mission.id}
              className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm">{mission.name}</h3>
                <Badge
                  variant={
                    mission.status === 'CRITICAL'
                      ? 'destructive'
                      : mission.status === 'IN_PROGRESS'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {mission.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-400">
                  <MapPin className="h-3 w-3 mr-1" />
                  {mission.location}
                </div>

                <div className="flex items-center text-sm text-gray-400">
                  <Users className="h-3 w-3 mr-1" />
                  {mission.team.length} heroes
                </div>

                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {mission.timeRemaining} remaining
                </div>

                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
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
    </div>
  );
} 