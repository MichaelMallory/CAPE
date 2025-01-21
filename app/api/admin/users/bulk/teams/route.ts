import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const bulkTeamAssignmentSchema = z.object({
  user_ids: z.array(z.string()).min(1),
  team: z.string().min(1)
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

// Helper function to validate team
async function validateTeam(supabase: any, teamName: string) {
  const { data: team, error } = await supabase
    .from('teams')
    .select('name')
    .eq('name', teamName)
    .single();

  if (error) throw error;
  if (!team) {
    throw new Error(`Invalid team: ${teamName}`);
  }

  return true;
}

// POST /api/admin/users/bulk/teams - Assign team to multiple users
export async function POST(request: Request) {
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
    const { user_ids, team } = bulkTeamAssignmentSchema.parse(body);

    // Validate team exists
    await validateTeam(supabase, team);

    // Get users' current teams
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, team_affiliations')
      .in('id', user_ids);

    if (fetchError) throw fetchError;
    if (!users || users.length === 0) {
      return NextResponse.json(
        { message: 'No valid users found' },
        { status: 400 }
      );
    }

    // Update each user's teams
    const updates = users.map(async (user) => {
      const currentTeams = user.team_affiliations || [];
      const updatedTeams = Array.from(new Set([...currentTeams, team])); // Add new team, ensure uniqueness

      const { data, error: updateError } = await supabase
        .from('users')
        .update({ team_affiliations: updatedTeams })
        .eq('id', user.id)
        .select();

      if (updateError) throw updateError;
      return data;
    });

    const updatedUsers = await Promise.all(updates);

    // Log the admin action for each user
    const auditLogs = user_ids.map(targetId => ({
      actor_id: user.id,
      action: 'bulk_team_assignment',
      target_id: targetId,
      changes: { team_added: team }
    }));

    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert(auditLogs);

    if (auditError) throw auditError;

    return NextResponse.json({
      updated_count: updatedUsers.length,
      users: updatedUsers.flat()
    });
  } catch (error) {
    console.error('Bulk team assignment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.startsWith('Invalid team:')) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return new NextResponse(
      'Failed to assign team',
      { status: 500 }
    );
  }
} 