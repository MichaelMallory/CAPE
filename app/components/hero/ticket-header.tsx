'use client';

import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface TicketHeaderProps {
  title: string;
  status: 'NEW' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED';
  priority: 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA';
  category: 'MISSION' | 'EQUIPMENT' | 'INTELLIGENCE';
  created_at: string;
  updated_at: string;
  assigned_to?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

const STATUS_COLORS = {
  NEW: 'bg-blue-500',
  IN_PROGRESS: 'bg-yellow-500',
  PENDING: 'bg-purple-500',
  RESOLVED: 'bg-green-500',
} as const;

const PRIORITY_COLORS = {
  OMEGA: 'bg-red-500',
  ALPHA: 'bg-orange-500',
  BETA: 'bg-yellow-500',
  GAMMA: 'bg-blue-500',
} as const;

export function TicketHeader({
  title,
  status,
  priority,
  category,
  created_at,
  updated_at,
  assigned_to,
}: TicketHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Created {formatDistanceToNow(new Date(created_at))} ago</span>
            <span>•</span>
            <span>Last updated {formatDistanceToNow(new Date(updated_at))} ago</span>
          </div>
        </div>
        {assigned_to && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Assigned to</span>
            <div className="flex items-center gap-2">
              {assigned_to.avatar_url && (
                <img
                  src={assigned_to.avatar_url}
                  alt={assigned_to.name}
                  className="h-6 w-6 rounded-full"
                />
              )}
              <span className="font-medium">{assigned_to.name}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Badge
          role="status"
          className={cn('font-semibold', STATUS_COLORS[status])}
        >
          {status}
        </Badge>
        <Badge className={cn('font-semibold', PRIORITY_COLORS[priority])}>
          {priority} Priority
        </Badge>
        <Badge variant="outline">{category}</Badge>
      </div>
    </div>
  );
} 