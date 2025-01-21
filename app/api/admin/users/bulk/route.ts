import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const bulkUpdateSchema = z.object({
  user_ids: z.array(z.string()).min(1),
  status: z.enum(['active', 'inactive', 'suspended']),
  reason: z.string().min(1).max(500)
});

// Helper function to verify admin status
async function verifyAdmin(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) return false;

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('clearance_level')
    .eq('id', user.id)
    .single();

  if (profileError) throw profileError;
  return profile?.clearance_level >= 8;
}

// PATCH /api/admin/users/bulk - Update multiple users
export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user and verify admin status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const isAdmin = await verifyAdmin(supabase);
    if (!isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Validate request body
    const body = await request.json();
    const { user_ids, status, reason } = bulkUpdateSchema.parse(body);

    // Verify users exist and get their current data
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, status')
      .in('id', user_ids);

    if (fetchError) throw fetchError;
    if (!users || users.length === 0) {
      return NextResponse.json(
        { message: 'No valid users found' },
        { status: 400 }
      );
    }

    // Update users
    const { data: updatedUsers, error: updateError } = await supabase
      .from('users')
      .update({ status })
      .in('id', user_ids)
      .select();

    if (updateError) throw updateError;

    // Log the admin action for each user
    const auditLogs = user_ids.map(targetId => ({
      actor_id: user.id,
      action: 'bulk_user_status_update',
      target_id: targetId,
      changes: { status },
      reason
    }));

    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert(auditLogs);

    if (auditError) throw auditError;

    return NextResponse.json({
      updated_count: updatedUsers.length,
      users: updatedUsers
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    return new NextResponse(
      'Failed to update users',
      { status: 500 }
    );
  }
} 