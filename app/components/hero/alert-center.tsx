import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Filter, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Alert {
  id: string;
  title: string;
  description: string;
  priority: 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA';
  timestamp: string;
  affected_areas: string[];
  recommended_actions: string[];
  acknowledged: boolean;
}

const PRIORITY_COLORS = {
  OMEGA: 'bg-red-500',
  ALPHA: 'bg-orange-500',
  BETA: 'bg-yellow-500',
  GAMMA: 'bg-blue-500',
} as const;

const PRIORITIES = ['OMEGA', 'ALPHA', 'BETA', 'GAMMA'] as const;
type Priority = typeof PRIORITIES[number];

export function AlertCenter() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Set<Priority>>(
    () => new Set(['OMEGA', 'ALPHA'] as Priority[])
  );
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Initial fetch of alerts
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('timestamp', { ascending: false });

      if (!error && data) {
        setAlerts(data as Alert[]);
      }
    };

    fetchAlerts();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('alert-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
        },
        (payload: RealtimePostgresChangesPayload<Alert>) => {
          if (payload.eventType === 'INSERT') {
            setAlerts((current) => [payload.new, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setAlerts((current) =>
              current.map((alert) =>
                alert.id === payload.new.id ? payload.new : alert
              ).filter((alert) => !alert.acknowledged)
            );
          }
        }
      )
      .subscribe();

    // Handle custom alert events (for testing)
    const handleNewAlert = (event: CustomEvent<Alert>) => {
      setAlerts((current) => [event.detail, ...current]);
    };

    window.addEventListener('new-alert', handleNewAlert as EventListener);

    return () => {
      channel.unsubscribe();
      window.removeEventListener('new-alert', handleNewAlert as EventListener);
    };
  }, [supabase]);

  const handleAcknowledge = async (alertId: string) => {
    const { error } = await supabase
      .from('alerts')
      .update({ acknowledged: true })
      .eq('id', alertId);

    if (!error) {
      setAlerts((current) =>
        current.filter((alert) => alert.id !== alertId)
      );
    }
  };

  const filteredAlerts = alerts.filter((alert) => priorityFilter.has(alert.priority));

  return (
    <section
      aria-label="Alert Center"
      className="h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-comic">Active Alerts</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Priority Levels</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PRIORITIES.map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority}
                checked={priorityFilter.has(priority)}
                onCheckedChange={(checked: boolean) => {
                  const newFilter = new Set(priorityFilter);
                  if (checked) {
                    newFilter.add(priority);
                  } else {
                    newFilter.delete(priority);
                  }
                  setPriorityFilter(newFilter);
                }}
              >
                {priority}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1">
        <ul className="space-y-2">
          {filteredAlerts.map((alert) => (
            <li
              key={alert.id}
              data-alert-id={alert.id}
              className="relative"
              data-testid={`alert-${alert.id}`}
            >
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedAlert(alert)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-comic">
                      {alert.title}
                    </CardTitle>
                    <Badge
                      role="status"
                      className={PRIORITY_COLORS[alert.priority]}
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <time
                      dateTime={alert.timestamp}
                      className="text-xs text-muted-foreground"
                    >
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </time>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcknowledge(alert.id);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Acknowledge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </ScrollArea>

      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {selectedAlert.description}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Affected Areas</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedAlert.affected_areas.map((area, i) => (
                    <li key={i} className="text-muted-foreground">{area}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Recommended Actions</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedAlert.recommended_actions.map((action, i) => (
                    <li key={i} className="text-muted-foreground">{action}</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    handleAcknowledge(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Acknowledge Alert
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
} 