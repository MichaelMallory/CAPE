'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQueueSystem, Ticket } from '@/hooks/use-queue-system';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ComicDialog } from '@/components/ui/comic-dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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

interface TicketWithForm extends Ticket {
  newComment?: string;
}

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

export function TicketList() {
  const router = useRouter();
  const { tickets, isLoading, updateTicket } = useQueueSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketWithForm | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sortField, setSortField] = useState<keyof Ticket>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user.id);
      }
    };
    getCurrentUser();
  }, []);

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

  // Filter tickets to only show created tickets
  const filteredTickets = tickets.filter(ticket => 
    ticket.created_by === currentUser &&
    ticket.status !== 'CLOSED' &&
    (statusFilter === 'all' || ticket.status === statusFilter) &&
    (priorityFilter === 'all' || ticket.priority === priorityFilter) &&
    (searchQuery === '' || 
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter and sort tickets
  const sortedAndFilteredTickets = [...filteredTickets].sort((a, b) => {
    if (sortField === 'priority') {
      const priorityOrder = { OMEGA: 4, ALPHA: 3, BETA: 2, GAMMA: 1 };
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

  const handleSort = (field: keyof Ticket) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
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

  if (isLoading) {
    return <div>Loading tickets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[300px] flex items-center gap-2">
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
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
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="OMEGA">Omega</SelectItem>
              <SelectItem value="ALPHA">Alpha</SelectItem>
              <SelectItem value="BETA">Beta</SelectItem>
              <SelectItem value="GAMMA">Gamma</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1">
        <ScrollArea className="h-[400px] border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="w-[150px] cursor-pointer hover:text-primary"
                  onClick={() => handleSort('title')}
                >
                  Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="w-[120px] cursor-pointer hover:text-primary"
                  onClick={() => handleSort('priority')}
                >
                  Priority {sortField === 'priority' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="w-[120px] cursor-pointer hover:text-primary"
                  onClick={() => handleSort('status')}
                >
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="w-[180px] cursor-pointer hover:text-primary"
                  onClick={() => handleSort('created_at')}
                >
                  Created {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <TableCell 
                    className="max-w-[150px] whitespace-normal break-words px-2"
                  >
                    {ticket.title}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-2">
                    <Badge variant="secondary" className={cn(
                      PRIORITY_COLORS[ticket.priority],
                      "text-white"
                    )}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-2">
                    <Badge className={cn(
                      STATUS_COLORS[ticket.status],
                      "text-white"
                    )}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-2">
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No tickets found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

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
    </div>
  );
} 