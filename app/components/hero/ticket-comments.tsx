'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Edit2, MessageSquare, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  parent_id?: string;
  replies?: Comment[];
}

interface TicketCommentsProps {
  ticketId: string;
  comments: Comment[];
  currentUser: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export function TicketComments({ ticketId, comments, currentUser }: TicketCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        ticket_id: ticketId,
        content: newComment,
        author_id: currentUser.id,
      })
      .select('*, author:profiles(*)');

    if (!error && data) {
      setNewComment('');
      // Optimistically update UI
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    const { error } = await supabase
      .from('comments')
      .update({ content: editContent })
      .eq('id', commentId);

    if (!error) {
      setEditingComment(null);
      setEditContent('');
      // Optimistically update UI
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (!error) {
      // Optimistically update UI
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        ticket_id: ticketId,
        content: replyContent,
        author_id: currentUser.id,
        parent_id: parentId,
      })
      .select('*, author:profiles(*)');

    if (!error && data) {
      setReplyingTo(null);
      setReplyContent('');
      // Optimistically update UI
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <article
      key={comment.id}
      className={`rounded-lg border bg-card p-4 ${isReply ? 'ml-8' : ''}`}
    >
      <div className="flex items-start gap-4">
        {comment.author.avatar_url && (
          <img
            src={comment.author.avatar_url}
            alt={comment.author.name}
            className="h-10 w-10 rounded-full"
          />
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{comment.author.name}</span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at))} ago
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-sm text-muted-foreground">(edited)</span>
              )}
            </div>
            {comment.author.id === currentUser.id && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingComment(comment.id);
                    setEditContent(comment.content);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {editingComment === comment.id ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleEditComment(comment.id)}
                >
                  Save changes
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm">{comment.content}</p>
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                  onClick={() => setReplyingTo(comment.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              )}
            </>
          )}

          {replyingTo === comment.id && (
            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleReplySubmit(comment.id)}
                >
                  Post reply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies?.map((reply) => renderComment(reply, true))}
    </article>
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
        />
        <Button onClick={handleSubmitComment}>Post comment</Button>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => !comment.parent_id && renderComment(comment))}
      </div>
    </div>
  );
} 