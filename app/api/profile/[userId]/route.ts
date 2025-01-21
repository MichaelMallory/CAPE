import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

const adminProfileUpdateSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  clearance_level: z.number().min(1).max(10).optional(),
  team_affiliations: z.array(z.string()).optional(),
});

// GET /api/profile/[userId] - Get any user's profile (admin only)
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    await requireAdmin();

    // Get target user's profile
    const { data: profile, error: targetProfileError } = await supabase
      .from('users')
      .select(`
        id,
        codename,
        status,
        clearance_level,
        team_affiliations,
        notification_preferences,
        accessibility_settings,
        theme,
        avatar_url,
        created_at,
        last_sign_in_at
      `)
      .eq('id', params.userId)
      .single();

    if (targetProfileError) throw targetProfileError;
    if (!profile) return new NextResponse('Profile not found', { status: 404 });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);

    if (error instanceof Error && error.message === 'Forbidden') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return new NextResponse(
      'Failed to fetch profile',
      { status: 500 }
    );
  }
}

// PATCH /api/profile/[userId] - Update any user's profile (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const admin = await requireAdmin();

    // Validate request body
    const body = await request.json();
    const validatedData = adminProfileUpdateSchema.parse(body);

    // Update target user's profile
    const { data: profile, error: updateError } = await supabase
      .from('users')
      .update(validatedData)
      .eq('id', params.userId)
      .select()
      .single();

    if (updateError) throw updateError;
    if (!profile) return new NextResponse('Profile not found', { status: 404 });

    // Log the admin action
    await logAuditEvent({
      actor_id: admin.id,
      action: 'admin_profile_update',
      target_id: params.userId,
      changes: validatedData
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile update error:', error);
    
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
      'Failed to update profile',
      { status: 500 }
    );
  }
} 