import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, AlertCircle, Bell } from 'lucide-react';

const MOCK_ALERTS = [
  {
    id: '1',
    type: 'CRITICAL',
    message: 'Multiple villain signatures detected in Financial District',
    timestamp: '2m ago',
  },
  {
    id: '2',
    type: 'WARNING',
    message: 'Equipment malfunction reported by Captain Thunder',
    timestamp: '5m ago',
  },
  {
    id: '3',
    type: 'INFO',
    message: 'New hero registration pending approval',
    timestamp: '10m ago',
  },
  {
    id: '4',
    type: 'CRITICAL',
    message: 'Energy surge detected at power plant',
    timestamp: '12m ago',
  },
];

export function PriorityAlerts() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <Badge variant="destructive">Critical: {MOCK_ALERTS.filter(a => a.type === 'CRITICAL').length}</Badge>
          <Badge variant="default">Warnings: {MOCK_ALERTS.filter(a => a.type === 'WARNING').length}</Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3">
          {MOCK_ALERTS.map((alert) => (
            <Alert
              key={alert.id}
              variant={
                alert.type === 'CRITICAL'
                  ? 'destructive'
                  : alert.type === 'WARNING'
                  ? 'default'
                  : undefined
              }
            >
              {alert.type === 'CRITICAL' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : alert.type === 'WARNING' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              <AlertDescription className="flex justify-between items-start">
                <span>{alert.message}</span>
                <Badge
                  variant="outline"
                  className="ml-2 shrink-0"
                >
                  {alert.timestamp}
                </Badge>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 