import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const queryParamsSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  clearance_level: z.coerce.number().min(1).max(10).optional(),
  search: z.string().optional(),
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

// GET /api/admin/users - List users with filtering and pagination
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify admin status
    const isAdmin = await verifyAdmin(supabase);
    if (!isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const { page, limit, status, clearance_level, search } = queryParamsSchema.parse(params);

    // Build query
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (clearance_level) {
      query = query.eq('clearance_level', clearance_level);
    }
    if (search) {
      query = query.ilike('codename', `%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data: users, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      users,
      total: count,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('User list error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid query parameters', errors: error.errors },
        { status: 400 }
      );
    }

    return new NextResponse(
      'Failed to fetch users',
      { status: 500 }
    );
  }
} 