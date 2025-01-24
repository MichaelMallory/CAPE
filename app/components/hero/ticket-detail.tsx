'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useQueueSystem } from '@/hooks/use-queue-system';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface TicketDetailProps {
  ticketId: string;
}

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const router = useRouter();
  const { tickets, updateTicket, isLoading } = useQueueSystem();
  const [newComment, setNewComment] = useState('');

  const ticket = tickets.find(t => t.id === ticketId);

  if (isLoading) {
    return <div>Loading ticket details...</div>;
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px]">
        <h2 className="text-2xl font-bold mb-4">Ticket Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested ticket could not be found.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await updateTicket(ticketId, {
        comments: [...(ticket.comments || []), {
          content: newComment,
          created_at: new Date().toISOString(),
          user_type: 'HERO'
        }]
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
          <p className="text-muted-foreground">Ticket #{ticket.id}</p>
        </div>
        <Button onClick={() => router.back()}>Back to Tickets</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
              <CardDescription>Add updates or questions about your ticket</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {ticket.comments?.map((comment, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {comment.user_type === 'HERO' ? 'You' : 'Support Staff'}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    {index < (ticket.comments?.length || 0) - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
                {(!ticket.comments || ticket.comments.length === 0) && (
                  <p className="text-muted-foreground text-sm">No comments yet</p>
                )}
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-4">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button onClick={handleAddComment} className="self-end">
                Add Comment
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Status</h4>
              <Badge variant="secondary">{ticket.status}</Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Priority</h4>
              <Badge>{ticket.priority}</Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Created</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Last Updated</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(ticket.updated_at).toLocaleString()}
              </p>
            </div>
            {ticket.assigned_to && (
              <div>
                <h4 className="text-sm font-medium mb-1">Assigned To</h4>
                <p className="text-sm text-muted-foreground">
                  Support Staff #{ticket.assigned_to}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 