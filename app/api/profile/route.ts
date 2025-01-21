import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

// Validation schemas
const notificationPreferencesSchema = z.object({
  mission_updates: z.boolean(),
  equipment_alerts: z.boolean(),
  team_changes: z.boolean(),
});

const accessibilitySettingsSchema = z.object({
  reduce_motion: z.boolean(),
  high_contrast: z.boolean(),
});

const profileUpdateSchema = z.object({
  notification_preferences: notificationPreferencesSchema.optional(),
  accessibility_settings: accessibilitySettingsSchema.optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const user = await requireAuth();

    // Get profile data
    const { data: profile, error: profileError } = await supabase
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
        avatar_url
      `)
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile) return new NextResponse('Profile not found', { status: 404 });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    return new NextResponse(
      'Failed to fetch profile',
      { status: 500 }
    );
  }
}

// PATCH /api/profile - Update current user's profile
export async function PATCH(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const user = await requireAuth();

    // Validate request body
    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    // Update profile
    const { data: profile, error: updateError } = await supabase
      .from('users')
      .update(validatedData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;
    if (!profile) return new NextResponse('Profile not found', { status: 404 });

    // Log the profile update
    await logAuditEvent({
      actor_id: user.id,
      action: 'profile_update',
      target_id: user.id,
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

    if (error instanceof Error && error.message === 'Unauthorized') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    return new NextResponse(
      'Failed to update profile',
      { status: 500 }
    );
  }
} 