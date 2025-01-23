'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  acknowledged: boolean;
}

const mockAlerts: Alert[] = [
  {
    id: 'A-001',
    title: 'Critical Power Failure',
    message: 'Main power grid failure in Sector 7. Backup systems engaged.',
    type: 'critical',
    timestamp: '2 min ago',
    acknowledged: false
  },
  {
    id: 'A-002',
    title: 'Backup Team Required',
    message: 'Captain Thunder requesting immediate backup at Central Bank.',
    type: 'warning',
    timestamp: '5 min ago',
    acknowledged: false
  },
  {
    id: 'A-003',
    title: 'System Update Complete',
    message: 'Communication systems successfully updated to version 2.1.0',
    type: 'success',
    timestamp: '10 min ago',
    acknowledged: true
  },
  {
    id: 'A-004',
    title: 'Weather Advisory',
    message: 'Severe weather conditions expected in patrol sectors B and C.',
    type: 'info',
    timestamp: '15 min ago',
    acknowledged: false
  }
];

export function PriorityAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const handleAcknowledge = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
  };

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card 
            key={alert.id}
            className={`p-4 ${
              alert.type === 'critical' && !alert.acknowledged
                ? 'border-destructive animate-pulse'
                : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getIcon(alert.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{alert.title}</h3>
                    <Badge variant={
                      alert.type === 'critical' ? 'destructive' :
                      alert.type === 'warning' ? 'default' :
                      alert.type === 'success' ? 'secondary' :
                      'outline'
                    }>
                      {alert.type}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {alert.timestamp}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {alert.message}
                </p>

                {!alert.acknowledged && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAcknowledge(alert.id)}
                  >
                    Acknowledge
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
} 