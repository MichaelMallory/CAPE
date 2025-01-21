import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const userUpdateSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  clearance_level: z.number().min(1).max(10).optional(),
  reason: z.string().min(1).max(500).optional(),
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

// GET /api/admin/users/[userId] - Get user details
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify admin status
    const isAdmin = await verifyAdmin(supabase);
    if (!isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get user details
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        codename,
        status,
        clearance_level,
        team_affiliations,
        created_at,
        last_sign_in_at,
        notification_preferences,
        accessibility_settings,
        theme,
        avatar_url
      `)
      .eq('id', params.userId)
      .single();

    if (error) throw error;
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('User fetch error:', error);
    return new NextResponse(
      'Failed to fetch user',
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[userId] - Update user details
export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
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
    const validatedData = userUpdateSchema.parse(body);

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(validatedData)
      .eq('id', params.userId)
      .select()
      .single();

    if (updateError) throw updateError;
    if (!updatedUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Log the admin action
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'user_status_update',
      target_id: params.userId,
      changes: validatedData,
      reason: validatedData.reason
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('User update error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    return new NextResponse(
      'Failed to update user',
      { status: 500 }
    );
  }
} 