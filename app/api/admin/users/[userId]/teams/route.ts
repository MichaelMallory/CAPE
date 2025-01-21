import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const teamAssignmentSchema = z.object({
  teams: z.array(z.string()).min(1),
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

// POST /api/admin/users/[userId]/teams - Assign teams to user
export async function POST(
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
    const { teams } = teamAssignmentSchema.parse(body);

    // Validate teams exist
    await validateTeams(supabase, teams);

    // Update user's team affiliations
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ team_affiliations: teams })
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
      action: 'team_assignment',
      target_id: params.userId,
      changes: { teams }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Team assignment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.startsWith('Invalid teams:')) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }

    return new NextResponse(
      'Failed to assign teams',
      { status: 500 }
    );
  }
}

// GET /api/admin/users/[userId]/teams - Get user's teams
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

    // Get user's teams
    const { data: user, error } = await supabase
      .from('users')
      .select('team_affiliations')
      .eq('id', params.userId)
      .single();

    if (error) throw error;
    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get full team details
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('name', user.team_affiliations || []);

    if (teamsError) throw teamsError;

    return NextResponse.json({ teams });
  } catch (error) {
    console.error('Teams fetch error:', error);
    return new NextResponse(
      'Failed to fetch teams',
      { status: 500 }
    );
  }
} 