import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { invalidateCache, buildCacheKey } from './cache';

// Tables that affect dashboard metrics
const MONITORED_TABLES = [
  'heroes',
  'missions',
  'equipment',
  'tickets',
  'alerts'
] as const;

type MonitoredTable = typeof MONITORED_TABLES[number];

interface TableChange {
  table: MonitoredTable;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  record: Record<string, any>;
  old_record: Record<string, any> | null;
}

// Create a Supabase client for real-time subscriptions
const supabase = createClient<Database>(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Subscribe to changes on monitored tables
export function subscribeToTableChanges(callback: (change: TableChange) => void) {
  MONITORED_TABLES.forEach(table => {
    supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload) => {
          const change: TableChange = {
            table: table,
            type: payload.eventType.toUpperCase() as TableChange['type'],
            record: payload.new,
            old_record: payload.old
          };
          callback(change);
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${table}:`, status);
      });
  });
}

// Handle table changes and invalidate relevant caches
export async function handleTableChange(change: TableChange) {
  const cacheKeys: string[] = [];

  // Always invalidate the main dashboard metrics cache
  cacheKeys.push(buildCacheKey('dashboard', 'metrics'));

  // Add specific cache keys based on the changed table
  switch (change.table) {
    case 'heroes':
      if (change.type === 'UPDATE' && 
          change.record.status !== change.old_record?.status) {
        cacheKeys.push(buildCacheKey('heroes', 'active'));
      }
      break;

    case 'missions':
      if (change.type === 'UPDATE' && 
          change.record.status !== change.old_record?.status) {
        cacheKeys.push(buildCacheKey('missions', 'active'));
      }
      break;

    case 'equipment':
      if (change.type === 'UPDATE' && 
          change.record.status !== change.old_record?.status) {
        cacheKeys.push(buildCacheKey('equipment', 'status'));
      }
      break;

    case 'tickets':
      if (change.type === 'UPDATE') {
        const statusChanged = change.record.status !== change.old_record?.status;
        const priorityChanged = change.record.priority !== change.old_record?.priority;
        
        if (statusChanged) {
          cacheKeys.push(buildCacheKey('tickets', 'status'));
        }
        if (priorityChanged) {
          cacheKeys.push(buildCacheKey('tickets', 'priority'));
        }
        if (change.record.resolved_at && !change.old_record?.resolved_at) {
          cacheKeys.push(buildCacheKey('tickets', 'resolution'));
        }
      }
      break;

    case 'alerts':
      if (change.type !== 'DELETE') {
        cacheKeys.push(buildCacheKey('alerts', 'recent'));
      }
      break;
  }

  // Invalidate all affected caches
  await Promise.all(cacheKeys.map(key => invalidateCache(key)));
} 