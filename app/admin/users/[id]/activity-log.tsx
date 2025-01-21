import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Card } from '@/components/ui/card';
import { Clock, Shield, Users, Activity } from 'lucide-react';

interface ActivityLogEntry {
  id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

async function getActivityLog(userId: string): Promise<ActivityLogEntry[]> {
  const supabase = createServerComponentClient({ cookies });
  const { data: activities, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return activities || [];
}

function getActivityIcon(action: string) {
  switch (action) {
    case 'LOGIN':
      return <Shield className="w-4 h-4" />;
    case 'TEAM_CHANGE':
      return <Users className="w-4 h-4" />;
    case 'STATUS_CHANGE':
      return <Activity className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

export async function ActivityLog({ userId }: { userId: string }) {
  const activities = await getActivityLog(userId);

  if (activities.length === 0) {
    return (
      <Card className="p-4 text-center text-muted-foreground">
        No activity recorded yet
      </Card>
    );
  }

  return (
    <ul className="space-y-4">
      {activities.map((activity) => (
        <li
          key={activity.id}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="mt-1">{getActivityIcon(activity.action)}</div>
          <div>
            <p className="font-medium">{activity.details}</p>
            <time className="text-sm text-muted-foreground">
              {new Date(activity.created_at).toLocaleString()}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
} 