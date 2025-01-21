'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

type Status = 'ACTIVE' | 'INACTIVE' | 'MIA';

interface Props {
  userId: string;
  initialStatus: Status;
}

const statusColors = {
  ACTIVE: 'bg-green-500',
  INACTIVE: 'bg-gray-500',
  MIA: 'bg-red-500',
} as const;

export function UserStatusSelect({ userId, initialStatus }: Props) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: Status) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      setStatus(newStatus);
      toast({
        title: 'Status updated',
        description: `Hero status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select
      value={status}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="w-[130px]">
        <SelectValue>
          <Badge className={`${statusColors[status]} text-white`}>
            {status}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ACTIVE">
          <Badge className={statusColors.ACTIVE + ' text-white'}>ACTIVE</Badge>
        </SelectItem>
        <SelectItem value="INACTIVE">
          <Badge className={statusColors.INACTIVE + ' text-white'}>INACTIVE</Badge>
        </SelectItem>
        <SelectItem value="MIA">
          <Badge className={statusColors.MIA + ' text-white'}>MIA</Badge>
        </SelectItem>
      </SelectContent>
    </Select>
  );
} 