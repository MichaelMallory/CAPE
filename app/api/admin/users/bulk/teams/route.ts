import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { logBulkAuditEvents } from '@/lib/audit';

// Validation schemas
const bulkTeamAssignmentSchema = z.object({
  user_ids: z.array(z.string()).min(1),
  teams: z.array(z.string()).min(1),
  reason: z.string().min(1).max(500)
});

// Helper function to validate teams
async function validateTeams(supabase: any, teams: string[]) {
  const { data: validTeams, error } = await supabase
    .from('teams')
    .select('name')
    .in('name', teams);

  if (error) throw error;

  const validTeamNames = validTeams.map((team: { name: string }) => team.name);
  const invalidTeams = teams.filter(team => !validTeamNames.includes(team));

  if (invalidTeams.length > 0) {
    throw new Error(`Invalid teams: ${invalidTeams.join(', ')}`);
  }

  return true;
}

// POST /api/admin/users/bulk/teams - Assign teams to multiple users
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const admin = await requireAdmin();

    // Validate request body
    const body = await request.json();
    const { user_ids, teams, reason } = bulkTeamAssignmentSchema.parse(body);

    // Validate teams exist
    await validateTeams(supabase, teams);

    // Verify users exist
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .in('id', user_ids);

    if (fetchError) throw fetchError;
    if (!users || users.length === 0) {
      return NextResponse.json(
        { message: 'No valid users found' },
        { status: 400 }
      );
    }

    // Update users' team affiliations
    const { data: updatedUsers, error: updateError } = await supabase
      .from('users')
      .update({ team_affiliations: teams })
      .in('id', user_ids)
      .select();

    if (updateError) throw updateError;

    // Log the admin actions
    await logBulkAuditEvents(
      user_ids.map(targetId => ({
        actor_id: admin.id,
        action: 'bulk_team_assignment',
        target_id: targetId,
        changes: { teams },
        reason
      }))
    );

    return NextResponse.json({
      updated_count: updatedUsers.length,
      users: updatedUsers
    });
  } catch (error) {
    console.error('Bulk team assignment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message === 'Forbidden') {
        return new NextResponse('Forbidden', { status: 403 });
      }
      if (error.message.startsWith('Invalid teams:')) {
        return NextResponse.json(
          { message: error.message },
          { status: 400 }
        );
      }
    }

    return new NextResponse(
      'Failed to assign teams',
      { status: 500 }
    );
  }
} 