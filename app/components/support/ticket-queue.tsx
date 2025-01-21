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
import { ArrowUpDown, Filter, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TicketFilters } from './ticket-filters';

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
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'T-001',
    title: 'Alien Invasion in Downtown',
    priority: 'OMEGA',
    status: 'NEW',
    created_at: '2024-01-21T10:00:00Z',
    location: 'Downtown Metro City'
  },
  {
    id: 'T-002',
    title: 'Supervillain Prison Break',
    priority: 'ALPHA',
    status: 'IN_PROGRESS',
    hero: 'Captain Thunder',
    created_at: '2024-01-21T09:30:00Z',
    location: 'Maximum Security Prison'
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
        <div className="flex gap-2">
          {selectedTickets.size > 0 && (
            <>
              <Button variant="outline" size="sm">
                Assign Selected
              </Button>
              <Button variant="outline" size="sm">
                Update Status
              </Button>
              <Button variant="outline" size="sm">
                Update Priority
              </Button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {(filters.priorities.length > 0 || 
              filters.statuses.length > 0 || 
              filters.assignedOnly || 
              filters.unassignedOnly) && (
              <Badge variant="secondary" className="ml-2">
                {filters.priorities.length + 
                  filters.statuses.length + 
                  (filters.assignedOnly ? 1 : 0) + 
                  (filters.unassignedOnly ? 1 : 0)}
              </Badge>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleSort('priority')}>
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('created_at')}>
                Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('status')}>
                Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-grow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTickets.size === tickets.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all tickets"
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hero</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="cursor-pointer hover:bg-gray-700/50"
                onClick={() => setSelectedTicket(ticket)}
              >
                <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedTickets.has(ticket.id)}
                    onCheckedChange={(checked) => handleSelectTicket(ticket.id, !!checked)}
                    aria-label={`Select ticket ${ticket.id}`}
                  />
                </TableCell>
                <TableCell>{ticket.id}</TableCell>
                <TableCell>{ticket.title}</TableCell>
                <TableCell>
                  <Badge
                    role="status"
                    aria-label={`${ticket.priority} Priority`}
                    className={cn(
                      'font-bold',
                      PRIORITY_COLORS[ticket.priority]
                    )}
                  >
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{ticket.hero || '-'}</TableCell>
                <TableCell>{ticket.location || '-'}</TableCell>
                <TableCell className="w-12">
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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