'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CircleDot, Battery, Shield, Radio } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  type: 'equipment' | 'vehicle' | 'communication';
  status: 'available' | 'in-use' | 'maintenance';
  assignedTo?: string;
  batteryLevel?: number;
  lastChecked: string;
}

const mockResources: Resource[] = [
  {
    id: 'R-001',
    name: 'Tactical Suit Alpha',
    type: 'equipment',
    status: 'in-use',
    assignedTo: 'Captain Thunder',
    batteryLevel: 85,
    lastChecked: '10 min ago'
  },
  {
    id: 'R-002',
    name: 'Support Vehicle Beta',
    type: 'vehicle',
    status: 'available',
    batteryLevel: 100,
    lastChecked: '1 hour ago'
  },
  {
    id: 'R-003',
    name: 'Comm System Gamma',
    type: 'communication',
    status: 'maintenance',
    lastChecked: '30 min ago'
  }
];

export function ResourceStatus() {
  const [resources] = useState<Resource[]>(mockResources);

  const getIcon = (type: Resource['type']) => {
    switch (type) {
      case 'equipment':
        return <Shield className="h-4 w-4" />;
      case 'vehicle':
        return <Battery className="h-4 w-4" />;
      case 'communication':
        return <Radio className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Resource['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'in-use':
        return 'bg-blue-500';
      case 'maintenance':
        return 'bg-yellow-500';
    }
  };

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {resources.map((resource) => (
          <Card key={resource.id} className="p-4">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {getIcon(resource.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{resource.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {resource.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleDot className={`h-3 w-3 ${getStatusColor(resource.status)}`} />
                    <span className="text-sm text-muted-foreground">
                      {resource.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  {resource.assignedTo && (
                    <div className="flex justify-between">
                      <span>Assigned to:</span>
                      <span>{resource.assignedTo}</span>
                    </div>
                  )}
                  {resource.batteryLevel !== undefined && (
                    <div className="flex justify-between">
                      <span>Battery:</span>
                      <span>{resource.batteryLevel}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Last checked:</span>
                    <span>{resource.lastChecked}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
} 