import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const commentCreateSchema = z.object({
  content: z.string().min(1),
  parent_id: z.string().uuid().optional(),
  mentioned_heroes: z.array(z.string().uuid()).optional(),
});

const queryParamsSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(25),
  parent_id: z.string().uuid().optional(),
});

// Helper function to extract mentions from content
function extractMentions(content: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[2]); // UUID from the mention format @[name](uuid)
  }
  return mentions;
}

// Helper function to create notifications for mentions
async function createMentionNotifications(
  supabase: any,
  ticketId: string,
  commentId: string,
  authorId: string,
  mentionedHeroes: string[]
) {
  if (!mentionedHeroes.length) return;

  const notifications = mentionedHeroes.map((heroId) => ({
    recipient_id: heroId,
    sender_id: authorId,
    type: 'MENTION',
    ticket_id: ticketId,
    comment_id: commentId,
    read: false,
  }));

  await supabase.from('notifications').insert(notifications);
}

// GET /api/tickets/[id]/comments - List comments for a ticket
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const { page, limit, parent_id } = queryParamsSchema.parse(
      Object.fromEntries(searchParams)
    );

    // Start building the query
    let query = supabase
      .from('ticket_comments')
      .select(`
        *,
        author:heroes(id, codename, avatar_url),
        replies:ticket_comments!parent_id(
          *,
          author:heroes(id, codename, avatar_url)
        )
      `, { count: 'exact' })
      .eq('ticket_id', params.id)
      .order('created_at', { ascending: false });

    // Filter by parent_id
    if (parent_id) {
      query = query.eq('parent_id', parent_id);
    } else {
      query = query.is('parent_id', null);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Execute query
    const { data: comments, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total: count,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Comments fetch error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request parameters', errors: error.errors },
        { status: 400 }
      );
    }
    return new NextResponse(
      'Failed to fetch comments',
      { status: 500 }
    );
  }
}

// POST /api/tickets/[id]/comments - Create a new comment
export async function POST(
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

    // Validate request body
    const body = await request.json();
    const commentData = commentCreateSchema.parse(body);

    // Extract mentions from content
    const mentionedHeroes = commentData.mentioned_heroes || extractMentions(commentData.content);

    // Create comment
    const { data: comment, error } = await supabase
      .from('ticket_comments')
      .insert({
        ticket_id: params.id,
        author_id: user.id,
        content: commentData.content,
        parent_id: commentData.parent_id,
      })
      .select(`
        *,
        author:heroes(id, codename, avatar_url),
        replies:ticket_comments!parent_id(
          *,
          author:heroes(id, codename, avatar_url)
        )
      `)
      .single();

    if (error) throw error;

    // Create notifications for mentions
    await createMentionNotifications(
      supabase,
      params.id,
      comment.id,
      user.id,
      mentionedHeroes
    );

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Comment creation error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid comment data', errors: error.errors },
        { status: 400 }
      );
    }
    return new NextResponse(
      'Failed to create comment',
      { status: 500 }
    );
  }
} 