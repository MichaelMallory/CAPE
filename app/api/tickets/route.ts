import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const ticketCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  priority: z.enum(['OMEGA', 'ALPHA', 'BETA', 'GAMMA']).default('BETA'),
  type: z.enum(['MISSION', 'EQUIPMENT', 'INTELLIGENCE']),
  location: z.object({}).passthrough().optional(),
  related_mission_id: z.string().uuid().optional(),
  related_equipment_id: z.string().uuid().optional(),
  metadata: z.object({}).passthrough().optional(),
});

const queryParamsSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  status: z.enum(['NEW', 'IN_PROGRESS', 'PENDING', 'RESOLVED']).optional(),
  priority: z.enum(['OMEGA', 'ALPHA', 'BETA', 'GAMMA']).optional(),
  type: z.enum(['MISSION', 'EQUIPMENT', 'INTELLIGENCE']).optional(),
  search: z.string().optional(),
  sort: z.enum(['created_at', 'updated_at', 'priority']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// GET /api/tickets - List tickets with filtering, search, and pagination
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const {
      page,
      limit,
      status,
      priority,
      type,
      search,
      sort,
      order,
    } = queryParamsSchema.parse(Object.fromEntries(searchParams));

    // Start building the query
    let query = supabase
      .from('tickets')
      .select('*, assigned_to:heroes(id, codename)', { count: 'exact' });

    // Apply filters
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (type) query = query.eq('type', type);
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    if (sort === 'priority') {
      const priorityOrder = order === 'asc' 
        ? ['GAMMA', 'BETA', 'ALPHA', 'OMEGA']
        : ['OMEGA', 'ALPHA', 'BETA', 'GAMMA'];
      query = query.order('priority', { ascending: order === 'asc', nullsFirst: false });
    } else {
      query = query.order(sort, { ascending: order === 'asc', nullsFirst: false });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data: tickets, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total: count,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Ticket fetch error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request parameters', errors: error.errors },
        { status: 400 }
      );
    }
    return new NextResponse(
      'Failed to fetch tickets',
      { status: 500 }
    );
  }
}

// POST /api/tickets - Create a new ticket
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const ticketData = ticketCreateSchema.parse(body);

    // Create ticket
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        ...ticketData,
        created_by: user.id,
        status: 'NEW',
      })
      .select('*, assigned_to:heroes(id, codename)')
      .single();

    if (error) throw error;

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Ticket creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid ticket data', errors: error.errors },
        { status: 400 }
      );
    }
    return new NextResponse(
      'Failed to create ticket',
      { status: 500 }
    );
  }
} 