import { useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  Wrench,
  Radio,
  Megaphone,
  FileSearch,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface Action {
  id: string;
  icon: typeof Shield;
  label: string;
  description: string;
  color: string;
}

const ACTIONS: Action[] = [
  {
    id: 'request-backup',
    icon: Shield,
    label: 'Request Backup',
    description: 'Call for additional hero support',
    color: 'text-blue-500',
  },
  {
    id: 'report-incident',
    icon: AlertTriangle,
    label: 'Report Incident',
    description: 'File an incident report',
    color: 'text-orange-500',
  },
  {
    id: 'equipment-check',
    icon: Wrench,
    label: 'Equipment Check',
    description: 'Run diagnostics on your gear',
    color: 'text-green-500',
  },
  {
    id: 'emergency-broadcast',
    icon: Radio,
    label: 'Emergency Broadcast',
    description: 'Send an emergency alert',
    color: 'text-red-500',
  },
  {
    id: 'public-announcement',
    icon: Megaphone,
    label: 'Public Announcement',
    description: 'Make a public statement',
    color: 'text-purple-500',
  },
  {
    id: 'situation-analysis',
    icon: FileSearch,
    label: 'Situation Analysis',
    description: 'Review current threats',
    color: 'text-yellow-500',
  },
];

const PRIORITIES = ['OMEGA', 'ALPHA', 'BETA', 'GAMMA'] as const;
const INCIDENT_TYPES = ['VILLAIN_ACTIVITY', 'CIVILIAN_DANGER', 'PROPERTY_DAMAGE', 'NATURAL_DISASTER', 'OTHER'] as const;

export function QuickActions() {
  const [recentActions, setRecentActions] = useLocalStorage<string[]>('recent-actions', []);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [checkResults, setCheckResults] = useState<Array<{ item: string; status: string }>>([]);
  const supabase = createClientComponentClient();

  // Sort actions with recently used first
  const sortedActions = [...ACTIONS].sort((a, b) => {
    const aIndex = recentActions.indexOf(a.id);
    const bIndex = recentActions.indexOf(b.id);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const handleActionClick = (action: Action) => {
    setSelectedAction(action);
    // Update recent actions
    const updatedActions = [
      action.id,
      ...recentActions.filter((id) => id !== action.id),
    ].slice(0, 3); // Keep only last 3
    setRecentActions(updatedActions);
  };

  const handleBackupRequest = async (formData: FormData) => {
    const data = {
      priority: formData.get('priority'),
      location: formData.get('location'),
      heroes_needed: formData.get('heroes_needed'),
      situation: formData.get('situation'),
    };

    const { error } = await supabase
      .from('backup_requests')
      .insert([data]);

    if (!error) {
      setSelectedAction(null);
    }
  };

  const handleIncidentReport = async (formData: FormData) => {
    const data = {
      type: formData.get('type'),
      location: formData.get('location'),
      casualties: formData.get('casualties'),
      description: formData.get('description'),
    };

    const { error } = await supabase
      .from('incident_reports')
      .insert([data]);

    if (!error) {
      setSelectedAction(null);
    }
  };

  const handleEquipmentCheck = async () => {
    setIsChecking(true);
    setCheckProgress(0);
    setCheckResults([]);

    // Simulate equipment check process
    const items = ['Suit Integrity', 'Power Systems', 'Communications', 'Weapons', 'Shields'];
    const statuses = ['OPTIMAL', 'GOOD', 'NEEDS_MAINTENANCE', 'CRITICAL'];

    for (let i = 0; i < items.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCheckProgress((i + 1) * (100 / items.length));
      setCheckResults((current) => [
        ...current,
        {
          item: items[i],
          status: statuses[Math.floor(Math.random() * statuses.length)],
        },
      ]);
    }

    setIsChecking(false);
  };

  return (
    <section
      aria-label="Quick Actions"
      className="h-full"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {sortedActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => handleActionClick(action)}
            >
              <CardContent className="p-4 text-center space-y-2">
                <Icon className={`h-6 w-6 mx-auto ${action.color}`} />
                <div>
                  <h3 className="font-comic text-sm">{action.label}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Backup Request Dialog */}
      <Dialog open={selectedAction?.id === 'request-backup'} onOpenChange={() => setSelectedAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Request</DialogTitle>
          </DialogHeader>
          <form
            action={(formData) => handleBackupRequest(formData)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select name="priority" defaultValue="BETA">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Enter location"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroes_needed">Heroes Needed</Label>
              <Input
                id="heroes_needed"
                name="heroes_needed"
                type="number"
                min="1"
                defaultValue="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="situation">Situation</Label>
              <Textarea
                id="situation"
                name="situation"
                placeholder="Describe the situation..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSelectedAction(null)}>
                Cancel
              </Button>
              <Button type="submit">Send Request</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Incident Report Dialog */}
      <Dialog open={selectedAction?.id === 'report-incident'} onOpenChange={() => setSelectedAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Incident Report</DialogTitle>
          </DialogHeader>
          <form
            action={(formData) => handleIncidentReport(formData)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="type">Incident Type</Label>
              <Select name="type" defaultValue="VILLAIN_ACTIVITY">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Enter location"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="casualties">Estimated Casualties</Label>
              <Input
                id="casualties"
                name="casualties"
                type="number"
                min="0"
                defaultValue="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the incident..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSelectedAction(null)}>
                Cancel
              </Button>
              <Button type="submit">Submit Report</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Equipment Check Dialog */}
      <Dialog
        open={selectedAction?.id === 'equipment-check'}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAction(null);
            setIsChecking(false);
            setCheckProgress(0);
            setCheckResults([]);
          } else if (!isChecking && checkResults.length === 0) {
            handleEquipmentCheck();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Equipment Check</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {isChecking ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>Equipment check in progress...</p>
                </div>
                <Progress value={checkProgress} className="h-2" />
              </div>
            ) : checkResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <p>Check Complete</p>
                </div>
                <ul className="space-y-2" role="list" aria-label="Equipment Status">
                  {checkResults.map(({ item, status }, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted"
                    >
                      <span>{item}</span>
                      <span className={
                        status === 'OPTIMAL' ? 'text-green-500' :
                        status === 'GOOD' ? 'text-blue-500' :
                        status === 'NEEDS_MAINTENANCE' ? 'text-yellow-500' :
                        'text-red-500'
                      }>
                        {status.replace('_', ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="flex justify-end">
              <Button onClick={() => setSelectedAction(null)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
} 