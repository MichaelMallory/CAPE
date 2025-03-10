"use client"

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ComicPanel } from '@/components/ui/comic-panel';
import { Shield, Users, Activity, Star, Wrench, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface TimelineEntry {
  id: string;
  hero_id: string;
  action: string;
  details: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

function getActivityIcon(action: string) {
  switch (action) {
    case 'MISSION_COMPLETE':
      return <Star data-testid="mission-complete-icon" className="w-5 h-5 text-yellow-500" />;
    case 'TEAM_UPDATE':
      return <Users data-testid="team-update-icon" className="w-5 h-5 text-blue-500" />;
    case 'STATUS_CHANGE':
      return <Activity data-testid="status-change-icon" className="w-5 h-5 text-green-500" />;
    case 'EQUIPMENT_UPDATE':
      return <Wrench data-testid="equipment-update-icon" className="w-5 h-5 text-purple-500" />;
    case 'ALERT':
      return <AlertTriangle data-testid="alert-icon" className="w-5 h-5 text-red-500" />;
    default:
      return <Shield data-testid="default-icon" className="w-5 h-5 text-gray-500" />;
  }
}

function getActionBadge(action: string) {
  const colors = {
    MISSION_COMPLETE: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
    TEAM_UPDATE: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
    STATUS_CHANGE: 'bg-green-500/20 text-green-500 border-green-500/50',
    EQUIPMENT_UPDATE: 'bg-purple-500/20 text-purple-500 border-purple-500/50',
    ALERT: 'bg-red-500/20 text-red-500 border-red-500/50',
  };

  return (
    <Badge 
      variant="outline" 
      className={`${colors[action as keyof typeof colors] || 'bg-gray-500/20 text-gray-500 border-gray-500/50'} font-bold`}
    >
      {action.replace('_', ' ')}
    </Badge>
  );
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchActivities() {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get user's profile to get hero_id
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!profile) return;

        // Get activities
        const { data: activities } = await supabase
          .from('hero_timeline')
          .select('*')
          .eq('hero_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (activities) {
          setActivities(activities);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('hero-timeline')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hero_timeline',
        },
        (payload: RealtimePostgresChangesPayload<TimelineEntry>) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setActivities((current) => {
              const updated = [...current];
              const index = updated.findIndex((a) => a.id === payload.new.id);
              if (index >= 0) {
                updated[index] = payload.new;
              } else {
                updated.unshift(payload.new);
              }
              return updated.slice(0, 10); // Keep only last 10
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading activities...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No activity recorded yet, hero! Time to make history!
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {activities.map((activity) => (
        <li
          key={activity.id}
          className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-muted/50 transition-colors border border-border/50"
        >
          <div className="mt-1 p-2 rounded-full bg-background">
            {getActivityIcon(activity.action)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getActionBadge(activity.action)}
              <time className="text-sm text-muted-foreground">
                {new Date(activity.created_at).toLocaleString()}
              </time>
            </div>
            <p className="font-medium text-foreground">{activity.details}</p>
          </div>
        </li>
      ))}
    </ul>
  );
} 