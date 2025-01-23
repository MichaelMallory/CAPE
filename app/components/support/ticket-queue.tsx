'use client';

import { useState } from 'react';
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

type SortableFields = keyof Pick<Ticket, 'id' | 'title' | 'priority' | 'status' | 'created_at'>;

export function TicketQueue() {
  const { tickets, isLoading } = useQueueSystem();
  const [filter, setFilter] = useState<'all' | Ticket['status']>('all');
  const [sortField, setSortField] = useState<SortableFields>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const priorityOrder = { OMEGA: 4, ALPHA: 3, BETA: 2, GAMMA: 1 };

  const filteredTickets = tickets
    .filter(ticket => filter === 'all' ? true : ticket.status === filter)
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

  const handleSort = (field: SortableFields) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value as 'all' | Ticket['status'])}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="ESCALATED">Escalated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('id')}
              >
                ID
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('title')}
              >
                Title
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('priority')}
              >
                Priority
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('created_at')}
              >
                Created
              </TableHead>
              <TableHead>AI Triage Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow 
                key={ticket.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedTicket(ticket)}
              >
                <TableCell>{ticket.id}</TableCell>
                <TableCell>{ticket.title}</TableCell>
                <TableCell>
                  <Badge variant={
                    ticket.priority === 'OMEGA' ? 'destructive' :
                    ticket.priority === 'ALPHA' ? 'default' :
                    ticket.priority === 'BETA' ? 'secondary' :
                    'outline'
                  }>
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    ticket.status === 'NEW' ? 'default' :
                    ticket.status === 'IN_PROGRESS' ? 'secondary' :
                    ticket.status === 'RESOLVED' ? 'success' :
                    'destructive'
                  }>
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(ticket.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={
                    ticket.metadata?.ai_triage_score === 'High' ? 'destructive' :
                    ticket.metadata?.ai_triage_score === 'Medium' ? 'default' :
                    'secondary'
                  }>
                    {ticket.metadata?.ai_triage_score || 'Low'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTicket(ticket);
                    }}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      <TicketDetailsModal
        ticket={selectedTicket}
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      />

      {selectedTicket && (
        <div className="mt-6">
          <AISuggestions ticketId={selectedTicket.id} />
        </div>
      )}
    </div>
  );
} 