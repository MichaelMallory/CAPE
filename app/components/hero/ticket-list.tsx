'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQueueSystem, Ticket } from '@/hooks/use-queue-system';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

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
  CLOSED: 'bg-gray-500',
  ESCALATED: 'bg-purple-500',
  ASSIGNED: 'bg-indigo-500',
} as const;

interface TicketWithForm extends Ticket {
  newComment?: string;
}

export function TicketList() {
  const router = useRouter();
  const { tickets, isLoading, updateTicket } = useQueueSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketWithForm | null>(null);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  if (isLoading) {
    return <div>Loading tickets...</div>;
  }

  return (
    <div className="h-full flex flex-col gap-4">
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
              <SelectItem value="ESCALATED">Escalated</SelectItem>
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

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead className="w-[120px]">Priority</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[180px]">Created</TableHead>
                <TableHead className="w-[180px]">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell className="truncate max-w-[300px]">{ticket.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn(
                      PRIORITY_COLORS[ticket.priority],
                      "text-white"
                    )}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      STATUS_COLORS[ticket.status],
                      "text-white"
                    )}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {ticket.updated_at ? new Date(ticket.updated_at).toLocaleString('en-US', {
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

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="flex-1 overflow-auto">
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-semibold">{selectedTicket.title}</h3>
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

                {selectedTicket.comments && selectedTicket.comments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Comments</h4>
                    <div className="space-y-4">
                      {selectedTicket.comments.map((comment, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {comment.user_type === 'HERO' ? 'You' : 'Support Staff'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {comment.created_at ? new Date(comment.created_at).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '-'}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <h4 className="text-sm font-medium">Add Comment</h4>
                  <Textarea
                    placeholder="Add a comment to your ticket..."
                    value={selectedTicket.newComment || ''}
                    onChange={(e) => {
                      setSelectedTicket({
                        ...selectedTicket,
                        newComment: e.target.value
                      });
                    }}
                  />
                  <Button
                    className="w-full"
                    onClick={async () => {
                      if (!selectedTicket.newComment?.trim()) return;
                      
                      try {
                        await updateTicket(selectedTicket.id, {
                          comments: [
                            ...(selectedTicket.comments || []),
                            {
                              content: selectedTicket.newComment,
                              created_at: new Date().toISOString(),
                              user_id: selectedTicket.created_by,
                              user_type: 'HERO'
                            }
                          ]
                        });
                        
                        setSelectedTicket({
                          ...selectedTicket,
                          newComment: ''
                        });
                        
                        toast({
                          title: 'Comment added',
                          description: 'Your comment has been added to the ticket.',
                        });
                      } catch (error) {
                        toast({
                          title: 'Error',
                          description: 'Failed to add comment. Please try again.',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    Add Comment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 