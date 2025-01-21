'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  userId: string;
  initialLevel: number;
}

export function ClearanceEditor({ userId, initialLevel }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [level, setLevel] = useState(initialLevel);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ clearance_level: level })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Clearance Updated',
        description: `Clearance level set to ${level}`,
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update clearance level. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          max={10}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          className="w-20"
          disabled={isUpdating}
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isUpdating}
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setLevel(initialLevel);
            setIsEditing(false);
          }}
          disabled={isUpdating}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Shield className="w-4 h-4" />
      <span className="font-mono">{level}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
      >
        Edit
      </Button>
    </div>
  );
} 