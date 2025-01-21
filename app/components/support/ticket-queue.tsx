import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Filter, MoreVertical, AlertTriangle, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TicketFilters } from './ticket-filters';
import { ScrollArea } from '@/components/ui/scroll-area';

type Priority = 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA';
type Status = 'NEW' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED';

interface Ticket {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  hero?: string;
  created_at: string;
  location?: string;
  timeAgo: string;
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'T-001',
    title: 'Alien Invasion in Downtown',
    priority: 'OMEGA',
    status: 'NEW',
    created_at: '2024-01-21T10:00:00Z',
    location: 'Downtown Metro City',
    timeAgo: '5m'
  },
  {
    id: 'T-002',
    title: 'Supervillain Prison Break',
    priority: 'ALPHA',
    status: 'IN_PROGRESS',
    hero: 'Captain Thunder',
    created_at: '2024-01-21T09:30:00Z',
    location: 'Maximum Security Prison',
    timeAgo: '15m'
  },
  {
    id: 'T-003',
    title: 'Backup Required',
    priority: 'OMEGA',
    status: 'IN_PROGRESS',
    hero: 'Frost Queen',
    created_at: '2024-01-21T09:30:00Z',
    location: 'Maximum Security Prison',
    timeAgo: '2m'
  },
  // Add more mock tickets as needed
];

const PRIORITY_COLORS: Record<Priority, string> = {
  OMEGA: 'bg-red-500',
  ALPHA: 'bg-orange-500',
  BETA: 'bg-yellow-500',
  GAMMA: 'bg-green-500'
};

type SortableFields = keyof Pick<Ticket, 'priority' | 'created_at' | 'status'>;

interface TicketFiltersState {
  priorities: Priority[];
  statuses: Status[];
  assignedOnly: boolean;
  unassignedOnly: boolean;
}

export function TicketQueue() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortableFields>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TicketFiltersState>({
    priorities: [],
    statuses: [],
    assignedOnly: false,
    unassignedOnly: false
  });

  const handleSort = (column: SortableFields) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filters.priorities.length > 0 && !filters.priorities.includes(ticket.priority)) {
      return false;
    }
    if (filters.statuses.length > 0 && !filters.statuses.includes(ticket.status)) {
      return false;
    }
    if (filters.assignedOnly && !ticket.hero) {
      return false;
    }
    if (filters.unassignedOnly && ticket.hero) {
      return false;
    }
    return true;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const priorityOrder: Record<Priority, number> = {
      OMEGA: 4,
      ALPHA: 3,
      BETA: 2,
      GAMMA: 1
    };

    if (sortBy === 'priority') {
      return sortDirection === 'asc'
        ? priorityOrder[a.priority] - priorityOrder[b.priority]
        : priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    const aValue = String(a[sortBy]);
    const bValue = String(b[sortBy]);
    
    return sortDirection === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTickets(new Set(tickets.map(t => t.id)));
    } else {
      setSelectedTickets(new Set());
    }
  };

  const handleSelectTicket = (ticketId: string, checked: boolean) => {
    const newSelected = new Set(selectedTickets);
    if (checked) {
      newSelected.add(ticketId);
    } else {
      newSelected.delete(ticketId);
    }
    setSelectedTickets(newSelected);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-2">
          <Badge variant="outline">Active: {tickets.filter(t => t.status === 'IN_PROGRESS').length}</Badge>
          <Badge variant="outline">Pending: {tickets.filter(t => t.status === 'NEW').length}</Badge>
        </div>
        <Button variant="outline" size="sm">
          New Ticket
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {sortedTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-gray-900/50 p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm">{ticket.title}</h3>
                <Badge
                  variant={
                    ticket.priority === 'OMEGA'
                      ? 'destructive'
                      : ticket.priority === 'ALPHA'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {ticket.priority}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <User className="h-3 w-3" />
                  <span>{ticket.hero || 'Unassigned'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-3 w-3" />
                  <span>{ticket.timeAgo} ago</span>
                </div>
              </div>

              {ticket.priority === 'OMEGA' && (
                <div className="mt-2 flex items-center text-xs text-red-400">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Immediate attention required
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <Sheet open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Ticket Information</SheetTitle>
          </SheetHeader>
          {selectedTicket && (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold">ID</h3>
                <p>{selectedTicket.id}</p>
              </div>
              <div>
                <h3 className="font-semibold">Title</h3>
                <p>{selectedTicket.title}</p>
              </div>
              <div>
                <h3 className="font-semibold">Priority</h3>
                <Badge
                  className={cn(
                    'font-bold',
                    PRIORITY_COLORS[selectedTicket.priority]
                  )}
                >
                  {selectedTicket.priority}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <Badge variant="outline">
                  {selectedTicket.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold">Assigned Hero</h3>
                <p>{selectedTicket.hero || 'Unassigned'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Location</h3>
                <p>{selectedTicket.location || 'No location specified'}</p>
              </div>
              <div className="flex gap-2 mt-6">
                <Button>Assign Hero</Button>
                <Button variant="outline">Update Status</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <TicketFilters
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </div>
  );
} 