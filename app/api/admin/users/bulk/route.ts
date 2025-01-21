import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { logBulkAuditEvents } from '@/lib/audit';

// Validation schemas
const bulkUpdateSchema = z.object({
  user_ids: z.array(z.string()).min(1),
  status: z.enum(['active', 'inactive', 'suspended']),
  reason: z.string().min(1).max(500)
});

// PATCH /api/admin/users/bulk - Update multiple users
export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify admin status
    const user = await requireAdmin();

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

    // Log the admin actions
    await logBulkAuditEvents(
      user_ids.map(targetId => ({
        actor_id: user.id,
        action: 'bulk_user_status_update',
        target_id: targetId,
        changes: { status },
        reason
      }))
    );

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

    if (error instanceof Error && error.message === 'Forbidden') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return new NextResponse(
      'Failed to update users',
      { status: 500 }
    );
  }
} 