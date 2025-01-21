import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface AuditLogEntry {
  actor_id: string;
  action: string;
  target_id?: string;
  changes?: Record<string, any>;
  reason?: string;
}

export async function logAuditEvent(entry: AuditLogEntry) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { error } = await supabase
    .from('audit_logs')
    .insert(entry);

  if (error) {
    console.error('Failed to log audit event:', error);
    throw error;
  }
}

export async function logBulkAuditEvents(entries: AuditLogEntry[]) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { error } = await supabase
    .from('audit_logs')
    .insert(entries);

  if (error) {
    console.error('Failed to log bulk audit events:', error);
    throw error;
  }
} 