import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const ticketUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  priority: z.enum(['OMEGA', 'ALPHA', 'BETA', 'GAMMA']).optional(),
  status: z.enum(['NEW', 'IN_PROGRESS', 'PENDING', 'RESOLVED']).optional(),
  type: z.enum(['MISSION', 'EQUIPMENT', 'INTELLIGENCE']).optional(),
  location: z.object({}).passthrough().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
  related_mission_id: z.string().uuid().optional(),
  related_equipment_id: z.string().uuid().optional(),
  metadata: z.object({}).passthrough().optional(),
});

// Helper function to verify ticket access
async function verifyTicketAccess(supabase: any, ticketId: string, userId: string) {
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('created_by, assigned_to')
    .eq('id', ticketId)
    .single();

  if (error) throw error;
  if (!ticket) return false;

  // Check if user is creator or assignee
  if (ticket.created_by === userId || ticket.assigned_to === userId) {
    return true;
  }

  // Check if user is support staff
  const { data: user } = await supabase
    .from('heroes')
    .select('clearance_level')
    .eq('id', userId)
    .single();

  return user?.clearance_level >= 5;
}

// GET /api/tickets/[id] - Get ticket details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify access
    const hasAccess = await verifyTicketAccess(supabase, params.id, user.id);
    if (!hasAccess) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get ticket details with related data
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        assigned_to:heroes(id, codename),
        created_by:heroes(id, codename),
        related_mission:missions(id, name, status),
        related_equipment:equipment(id, name, status)
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;
    if (!ticket) {
      return new NextResponse('Ticket not found', { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Ticket fetch error:', error);
    return new NextResponse(
      'Failed to fetch ticket',
      { status: 500 }
    );
  }
}

// PATCH /api/tickets/[id] - Update ticket
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify access
    const hasAccess = await verifyTicketAccess(supabase, params.id, user.id);
    if (!hasAccess) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Validate request body
    const body = await request.json();
    const updates = ticketUpdateSchema.parse(body);

    // Update ticket
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select(`
        *,
        assigned_to:heroes(id, codename),
        created_by:heroes(id, codename),
        related_mission:missions(id, name, status),
        related_equipment:equipment(id, name, status)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Ticket update error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid update data', errors: error.errors },
        { status: 400 }
      );
    }
    return new NextResponse(
      'Failed to update ticket',
      { status: 500 }
    );
  }
}

// DELETE /api/tickets/[id] - Delete ticket
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Only support staff can delete tickets
    const { data: hero } = await supabase
      .from('heroes')
      .select('clearance_level')
      .eq('id', user.id)
      .single();

    if (!hero || hero.clearance_level < 5) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Delete ticket
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Ticket deletion error:', error);
    return new NextResponse(
      'Failed to delete ticket',
      { status: 500 }
    );
  }
} 