import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Priority = 'OMEGA' | 'ALPHA' | 'BETA' | 'GAMMA';
type Status = 'NEW' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED';

interface TicketFilters {
  priorities: Priority[];
  statuses: Status[];
  assignedOnly: boolean;
  unassignedOnly: boolean;
}

interface TicketFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TicketFilters;
  onFiltersChange: (filters: TicketFilters) => void;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  OMEGA: 'bg-red-500',
  ALPHA: 'bg-orange-500',
  BETA: 'bg-yellow-500',
  GAMMA: 'bg-green-500'
};

export function TicketFilters({
  open,
  onOpenChange,
  filters,
  onFiltersChange
}: TicketFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TicketFilters>(filters);

  const handlePriorityChange = (priority: Priority) => {
    const newPriorities = localFilters.priorities.includes(priority)
      ? localFilters.priorities.filter((p) => p !== priority)
      : [...localFilters.priorities, priority];
    setLocalFilters({ ...localFilters, priorities: newPriorities });
  };

  const handleStatusChange = (status: Status) => {
    const newStatuses = localFilters.statuses.includes(status)
      ? localFilters.statuses.filter((s) => s !== status)
      : [...localFilters.statuses, status];
    setLocalFilters({ ...localFilters, statuses: newStatuses });
  };

  const handleAssignedChange = (checked: boolean) => {
    setLocalFilters({
      ...localFilters,
      assignedOnly: checked,
      unassignedOnly: false,
    });
  };

  const handleUnassignedChange = (checked: boolean) => {
    setLocalFilters({
      ...localFilters,
      unassignedOnly: checked,
      assignedOnly: false,
    });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    const resetFilters: TicketFilters = {
      priorities: [],
      statuses: [],
      assignedOnly: false,
      unassignedOnly: false
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Tickets</SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-8">
          <div className="space-y-4">
            <h3 className="font-semibold">Priority</h3>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(PRIORITY_COLORS) as Priority[]).map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={localFilters.priorities.includes(priority)}
                    onCheckedChange={() => handlePriorityChange(priority)}
                  />
                  <Label htmlFor={`priority-${priority}`} className="flex items-center">
                    <Badge className={cn('font-bold ml-2', PRIORITY_COLORS[priority])}>
                      {priority}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Status</h3>
            <div className="grid grid-cols-2 gap-4">
              {(['NEW', 'IN_PROGRESS', 'PENDING', 'RESOLVED'] as Status[]).map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={localFilters.statuses.includes(status)}
                    onCheckedChange={() => handleStatusChange(status)}
                  />
                  <Label htmlFor={`status-${status}`}>
                    {status.replace('_', ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Assignment</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="assigned-only"
                  checked={localFilters.assignedOnly}
                  onCheckedChange={handleAssignedChange}
                />
                <Label htmlFor="assigned-only">Show assigned tickets only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unassigned-only"
                  checked={localFilters.unassignedOnly}
                  onCheckedChange={handleUnassignedChange}
                />
                <Label htmlFor="unassigned-only">Show unassigned tickets only</Label>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>
            <Button onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 