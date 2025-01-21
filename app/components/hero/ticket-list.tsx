'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  status: 'NEW' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED';
  priority: 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA';
  category: 'MISSION' | 'EQUIPMENT' | 'INTELLIGENCE';
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const STATUS_COLORS = {
  NEW: 'bg-blue-500',
  IN_PROGRESS: 'bg-yellow-500',
  PENDING: 'bg-purple-500',
  RESOLVED: 'bg-green-500',
} as const;

const PRIORITY_COLORS = {
  OMEGA: 'bg-red-500',
  ALPHA: 'bg-orange-500',
  BETA: 'bg-yellow-500',
  GAMMA: 'bg-blue-500',
} as const;

export function TicketList() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'created_at' | 'updated_at' | 'priority'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data - replace with real API call
  const tickets: Ticket[] = [
    {
      id: '1',
      title: 'Equipment Malfunction',
      status: 'NEW',
      priority: 'BETA',
      category: 'EQUIPMENT',
      created_at: '2024-01-21T12:00:00Z',
      updated_at: '2024-01-21T12:00:00Z',
    },
    // Add more mock tickets...
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || ticket.category === selectedCategory;
    const matchesPriority = !selectedPriority || ticket.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    if (sortField === 'priority') {
      const priorityOrder = { OMEGA: 0, ALPHA: 1, BETA: 2, GAMMA: 3 };
      return (priorityOrder[a.priority] - priorityOrder[b.priority]) * direction;
    }
    return (new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()) * direction;
  });

  const paginatedTickets = sortedTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleTicketSelection = (ticketId: string) => {
    const newSelection = new Set(selectedTickets);
    if (newSelection.has(ticketId)) {
      newSelection.delete(ticketId);
    } else {
      newSelection.add(ticketId);
    }
    setSelectedTickets(newSelection);
  };

  const handleBulkAction = async (action: 'resolve' | 'delete') => {
    // Implement bulk actions
    console.log(`Bulk ${action} for tickets:`, Array.from(selectedTickets));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="search"
          placeholder="Search tickets..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select
          value={selectedCategory ?? ''}
          onValueChange={(value) => setSelectedCategory(value || null)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="MISSION">Mission Support</SelectItem>
            <SelectItem value="EQUIPMENT">Equipment</SelectItem>
            <SelectItem value="INTELLIGENCE">Intelligence</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={selectedPriority ?? ''}
          onValueChange={(value) => setSelectedPriority(value || null)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="OMEGA">OMEGA</SelectItem>
            <SelectItem value="ALPHA">ALPHA</SelectItem>
            <SelectItem value="BETA">BETA</SelectItem>
            <SelectItem value="GAMMA">GAMMA</SelectItem>
          </SelectContent>
        </Select>
        {selectedTickets.size > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Bulk actions ({selectedTickets.size})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleBulkAction('resolve')}>
                Mark as resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('delete')}>
                Delete tickets
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTickets(new Set(paginatedTickets.map(t => t.id)));
                    } else {
                      setSelectedTickets(new Set());
                    }
                  }}
                  checked={selectedTickets.size === paginatedTickets.length}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Category</TableHead>
              <TableHead onClick={() => toggleSort('created_at')} className="cursor-pointer">
                Created
                {sortField === 'created_at' && (
                  sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                )}
              </TableHead>
              <TableHead onClick={() => toggleSort('updated_at')} className="cursor-pointer">
                Updated
                {sortField === 'updated_at' && (
                  sortDirection === 'asc' ? <ChevronUp className="inline ml-1" /> : <ChevronDown className="inline ml-1" />
                )}
              </TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTickets.map((ticket) => (
              <TableRow key={ticket.id} data-state={selectedTickets.has(ticket.id) ? 'selected' : undefined}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedTickets.has(ticket.id)}
                    onChange={() => toggleTicketSelection(ticket.id)}
                  />
                </TableCell>
                <TableCell>
                  <button
                    className="hover:underline text-left"
                    onClick={() => router.push(`/hero/tickets/${ticket.id}`)}
                  >
                    {ticket.title}
                  </button>
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[ticket.status]}>
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={PRIORITY_COLORS[ticket.priority]}>
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>{ticket.category}</TableCell>
                <TableCell>{new Date(ticket.created_at).toLocaleString()}</TableCell>
                <TableCell>{new Date(ticket.updated_at).toLocaleString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/hero/tickets/${ticket.id}`)}
                      >
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem>Update status</DropdownMenuItem>
                      <DropdownMenuItem>Change priority</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value} items
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, sortedTickets.length)} of{' '}
            {sortedTickets.length} tickets
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
} 