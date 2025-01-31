'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQueueSystem } from '@/hooks/use-queue-system';
import { TicketDetailsModal } from './ticket-details-modal';
import { AISuggestions } from './ai-suggestions';
import type { Ticket } from '@/hooks/use-queue-system';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { CreateTicketForm } from '@/components/hero/create-ticket-form';
import { ComicDialog } from '@/components/ui/comic-dialog';
import { Textarea } from '@/components/ui/textarea';

type SortableFields = keyof Pick<Ticket, 'id' | 'title' | 'priority' | 'status' | 'created_at'>;

interface Profile {
  codename: string | null;
  real_name: string | null;
  role: string;
}

interface TicketComment {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  author_name?: string;
  profiles: Profile;
}

type DatabaseTicketComment = {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  profiles: {
    codename: string | null;
    real_name: string | null;
    role: string;
  };
};

const PRIORITY_COLORS = {
  OMEGA: 'bg-red-500',
  ALPHA: 'bg-orange-500',
  BETA: 'bg-yellow-500',
  GAMMA: 'bg-blue-500',
} as const;

const STATUS_COLORS = {
  NEW: 'bg-blue-500',
  IN_PROGRESS: 'bg-yellow-500',
  RESOLVED: 'bg-green-500',
  CLOSED: 'bg-gray-500'
} as const;

export function TicketQueue() {
  const { tickets, isLoading, updateTicket, createTicket } = useQueueSystem();
  const [filter, setFilter] = useState<'all' | Ticket['status']>('all');
  const [sortField, setSortField] = useState<SortableFields>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [assigneeNames, setAssigneeNames] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [closedTicketsCount, setClosedTicketsCount] = useState(0);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();

  const priorityOrder = { OMEGA: 4, ALPHA: 3, BETA: 2, GAMMA: 1 };

  // Fetch closed tickets count for current user
  useEffect(() => {
    const fetchClosedTicketsCount = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { count, error } = await supabase
        .from('support_closed_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('support_id', session.user.id);

      if (!error && count !== null) {
        setClosedTicketsCount(count);
      }
    };

    fetchClosedTicketsCount();
  }, [tickets]); // Re-fetch when tickets change

  // Fetch hero names for assigned tickets
  useEffect(() => {
    const fetchHeroNames = async () => {
      const assignedHeroIds = tickets
        .filter(t => t.assigned_to)
        .map(t => t.assigned_to as string);

      if (assignedHeroIds.length === 0) return;

      const { data: heroes, error } = await supabase
        .from('profiles')
        .select('id, codename, real_name')
        .in('id', assignedHeroIds);

      if (!error && heroes) {
        const nameMap = heroes.reduce((acc: Record<string, string>, hero: { id: string; codename: string | null; real_name: string | null }) => ({
          ...acc,
          [hero.id]: hero.codename || hero.real_name || 'Unknown'
        }), {});
        setAssigneeNames(nameMap);
      }
    };

    fetchHeroNames();
  }, [tickets]);

  // Calculate status counts excluding closed tickets count
  const statusCounts = tickets.reduce((acc, ticket) => {
    if (ticket.status !== 'CLOSED') {
      const status = ticket.status as keyof typeof acc;
      acc[status] = (acc[status] || 0) + 1;
    }
    return acc;
  }, {} as Record<Ticket['status'], number>);

  const filteredTickets = tickets
    .filter(ticket => 
      filter === 'all' 
        ? ticket.status !== 'CLOSED' // Hide closed tickets when showing 'all'
        : ticket.status === filter   // Show specific status when filtered
    )
    .sort((a, b) => {
      if (sortField === 'priority') {
        return sortDirection === 'desc'
          ? priorityOrder[b.priority] - priorityOrder[a.priority]
          : priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      const aValue = a[sortField]?.toString() || '';
      const bValue = b[sortField]?.toString() || '';
      
      return sortDirection === 'desc'
        ? bValue.localeCompare(aValue)
        : aValue.localeCompare(bValue);
    });

  // Fetch comments when a ticket is selected
  useEffect(() => {
    const fetchComments = async () => {
      if (!selectedTicket) return;

      const { data: commentsData, error: commentsError } = await supabase
        .from('ticket_comments')
        .select(`
          id,
          content,
          author_id,
          created_at,
          profiles!inner (
            codename,
            real_name,
            role
          )
        `)
        .eq('ticket_id', selectedTicket.id)
        .order('created_at', { ascending: true });

      if (!commentsError && commentsData) {
        const typedComments = commentsData as unknown as DatabaseTicketComment[];
        setComments(typedComments.map(comment => ({
          ...comment,
          author_name: comment.profiles.codename || comment.profiles.real_name || 'Unknown User'
        })));
      }
    };

    fetchComments();
  }, [selectedTicket]);

  const handleSort = (field: SortableFields) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleClose = async (ticket: Ticket, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the details modal
    e.preventDefault(); // Prevent any other handlers
    
    if (!ticket || !ticket.id) {
      console.error('Invalid ticket:', ticket);
      return;
    }

    try {
      setIsUpdating(true);
      console.log('Closing ticket:', ticket.id);
      
      await updateTicket(ticket.id, {
        status: 'CLOSED'
      });

      toast({ 
        title: 'Ticket closed',
        description: 'The ticket has been moved to closed status'
      });
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast({ 
        title: 'Error',
        description: 'Failed to close the ticket',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data: commentData, error } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: selectedTicket.id,
          author_id: session.user.id,
          content: newComment.trim()
        })
        .select(`
          id,
          content,
          author_id,
          created_at,
          profiles!inner (
            codename,
            real_name,
            role
          )
        `)
        .single();

      if (error) throw error;

      if (commentData) {
        const comment = commentData as unknown as DatabaseTicketComment;
        setComments(prev => [...prev, {
          ...comment,
          author_name: comment.profiles.codename || comment.profiles.real_name || 'Unknown User'
        }]);
        setNewComment('');
        toast({
          title: "Comment added",
          description: "Your comment has been added to the ticket.",
          className: "font-comic"
        });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCreateForm(true)}
            className="font-comic hover:bg-primary/10"
          >
            New Ticket
          </Button>
          <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
            <SelectTrigger className="w-[160px] font-comic">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 px-4 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg border shadow-sm">
          <div className="flex flex-col items-center">
            <Badge className={cn(STATUS_COLORS.NEW, "text-white font-comic")}>
              {statusCounts.NEW || 0}
            </Badge>
            <span className="text-xs font-comic mt-1">New</span>
          </div>
          <div className="flex flex-col items-center">
            <Badge className={cn(STATUS_COLORS.IN_PROGRESS, "text-white font-comic")}>
              {statusCounts.IN_PROGRESS || 0}
            </Badge>
            <span className="text-xs font-comic mt-1">In Progress</span>
          </div>
          <div className="flex flex-col items-center">
            <Badge className={cn(STATUS_COLORS.RESOLVED, "text-white font-comic")}>
              {statusCounts.RESOLVED || 0}
            </Badge>
            <span className="text-xs font-comic mt-1">Resolved</span>
          </div>
          <div className="flex flex-col items-center">
            <Badge className={cn(STATUS_COLORS.CLOSED, "text-white font-comic")}>
              {closedTicketsCount}
            </Badge>
            <span className="text-xs font-comic mt-1">My Closed</span>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <CreateTicketForm
          onSuccess={() => {
            setShowCreateForm(false);
            toast({
              title: "Ticket Created",
              description: "The ticket has been added to the queue.",
              className: "font-comic border-2 border-black shadow-lg bg-green-100",
            });
          }}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      <ScrollArea className="h-[calc(100vh-280px)] border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:text-primary sticky top-0 bg-background"
                onClick={() => handleSort('title')}
              >
                Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-primary sticky top-0 bg-background"
                onClick={() => handleSort('status')}
              >
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:text-primary sticky top-0 bg-background"
                onClick={() => handleSort('priority')}
              >
                Priority {sortField === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="sticky top-0 bg-background">Assigned To</TableHead>
              <TableHead 
                className="cursor-pointer hover:text-primary sticky top-0 bg-background"
                onClick={() => handleSort('created_at')}
              >
                Created {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="sticky top-0 bg-background">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => {
              console.log('🎫 Rendering ticket:', { 
                ticketId: ticket.id, 
                status: ticket.status, 
                showCloseButton: ticket.status === 'RESOLVED' 
              });
              return (
                <TableRow 
                  key={ticket.id} 
                  data-testid="ticket-item"
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <TableCell 
                    data-testid="ticket-title" 
                    className="max-w-[150px] whitespace-normal break-words px-2"
                  >
                    {ticket.title}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-2">
                    <Badge 
                      data-testid="status-badge"
                      className={cn(STATUS_COLORS[ticket.status], "text-white")}
                    >
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-2">
                    <Badge 
                      data-testid="ticket-priority"
                      className={cn(PRIORITY_COLORS[ticket.priority], "text-white")}
                    >
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2">
                    {ticket.assigned_to ? (
                      <span data-testid="ticket-assignee">
                        {assigneeNames[ticket.assigned_to] || 'Loading...'}
                      </span>
                    ) : (
                      <Badge 
                        data-testid="ticket-unassigned"
                        variant="outline"
                      >
                        Unassigned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-2">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {ticket.status === 'RESOLVED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={(e) => handleClose(ticket, e)}
                        disabled={isUpdating}
                        data-testid="close-ticket-button"
                      >
                        Close Ticket
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>

      {selectedTicket && (
        <ComicDialog onClose={() => setSelectedTicket(null)}>
          <div className="flex-1 overflow-auto">
            <div className="grid gap-6">
              <div>
                <h3 className="text-2xl font-comic font-bold">{selectedTicket.title}</h3>
                <p className="text-sm text-muted-foreground">Ticket #{selectedTicket.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Status</h4>
                  <Badge className={cn(STATUS_COLORS[selectedTicket.status], "text-white")}>
                    {selectedTicket.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Priority</h4>
                  <Badge className={cn(PRIORITY_COLORS[selectedTicket.priority], "text-white")}>
                    {selectedTicket.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Comments</h4>
                  <span className="text-xs text-muted-foreground">{comments.length} comments</span>
                </div>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-3 bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-comic text-sm">{comment.author_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button 
                    onClick={handleAddComment}
                    className="w-full font-comic"
                    disabled={!newComment.trim()}
                  >
                    Add Comment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ComicDialog>
      )}

      <TicketDetailsModal
        ticket={selectedTicket}
        open={!!selectedTicket && !showCreateForm}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      />

      {selectedTicket && !showCreateForm && (
        <div className="mt-6">
          <AISuggestions ticketId={selectedTicket.id} />
        </div>
      )}
    </div>
  );
} 