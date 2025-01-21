'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { createClient } from '@supabase/supabase-js';
import { Search } from 'lucide-react';

interface Hero {
  id: string;
  name: string;
  avatar_url?: string;
}

interface TicketActionsProps {
  ticketId: string;
  currentStatus: 'NEW' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED';
  currentPriority: 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA';
  assignedTo?: Hero;
}

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'RESOLVED', label: 'Resolved' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'OMEGA', label: 'OMEGA - Global Threat' },
  { value: 'ALPHA', label: 'ALPHA - City-wide Emergency' },
  { value: 'BETA', label: 'BETA - Urgent Assistance' },
  { value: 'GAMMA', label: 'GAMMA - Routine Support' },
] as const;

export function TicketActions({
  ticketId,
  currentStatus,
  currentPriority,
  assignedTo,
}: TicketActionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Hero[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleStatusChange = async (newStatus: typeof currentStatus) => {
    const { error } = await supabase
      .from('tickets')
      .update({ status: newStatus })
      .eq('id', ticketId);

    if (!error) {
      // Optimistically update UI
      // Add event to timeline
    }
  };

  const handlePriorityChange = async (newPriority: typeof currentPriority) => {
    const { error } = await supabase
      .from('tickets')
      .update({ priority: newPriority })
      .eq('id', ticketId);

    if (!error) {
      // Optimistically update UI
      // Add event to timeline
    }
  };

  const handleHeroSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const { data, error } = await supabase
      .from('heroes')
      .select('id, name, avatar_url')
      .ilike('name', `%${query}%`)
      .limit(5);

    if (!error && data) {
      setSearchResults(data);
    }
    setIsSearching(false);
  };

  const handleAssign = async (heroId: string) => {
    const { error } = await supabase
      .from('tickets')
      .update({ assigned_to: heroId })
      .eq('id', ticketId);

    if (!error) {
      // Optimistically update UI
      // Add event to timeline
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Status</h3>
        <Select
          value={currentStatus}
          onValueChange={(value) => handleStatusChange(value as typeof currentStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Priority</h3>
        <Select
          value={currentPriority}
          onValueChange={(value) => handlePriorityChange(value as typeof currentPriority)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Assignment</h3>
        {assignedTo ? (
          <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
            {assignedTo.avatar_url && (
              <img
                src={assignedTo.avatar_url}
                alt={assignedTo.name}
                className="h-8 w-8 rounded-full"
              />
            )}
            <div className="flex-1">
              <div className="font-medium">{assignedTo.name}</div>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground"
                onClick={() => handleAssign('')}
              >
                Remove assignment
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search heroes..."
                value={searchQuery}
                onChange={(e) => handleHeroSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            {isSearching ? (
              <div className="rounded-lg border bg-card p-2 text-sm text-muted-foreground">
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="rounded-lg border bg-card">
                {searchResults.map((hero) => (
                  <li key={hero.id}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleAssign(hero.id)}
                    >
                      <div className="flex items-center gap-2">
                        {hero.avatar_url && (
                          <img
                            src={hero.avatar_url}
                            alt={hero.name}
                            className="h-6 w-6 rounded-full"
                          />
                        )}
                        <span>{hero.name}</span>
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : searchQuery && (
              <div className="rounded-lg border bg-card p-2 text-sm text-muted-foreground">
                No heroes found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 