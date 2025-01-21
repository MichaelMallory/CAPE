'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { useToast } from '@/components/ui/use-toast';

const availablePermissions = [
  'View Missions',
  'Create Missions',
  'Approve Missions',
  'View Equipment',
  'Manage Equipment',
  'Assign Teams',
  'View Reports',
  'Generate Reports',
  'Manage Users',
  'Manage Roles',
];

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  member_count: number;
  updated_at: string;
}

interface Props {
  role: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRoleDialog({ role, open, onOpenChange }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role.permissions);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('roles')
        .update({
          name,
          description,
          permissions: selectedPermissions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', role.id);

      if (error) throw error;

      toast({
        title: 'Role updated',
        description: `Role "${name}" has been updated successfully.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((current) =>
      current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Role Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Field Commander"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role's responsibilities..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <Command className="border rounded-lg">
              <CommandInput placeholder="Search permissions..." />
              <CommandEmpty>No permissions found.</CommandEmpty>
              <CommandGroup className="max-h-[200px] overflow-y-auto">
                {availablePermissions.map((permission) => (
                  <CommandItem
                    key={permission}
                    onSelect={() => togglePermission(permission)}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission)}
                      readOnly
                      className="h-4 w-4"
                    />
                    {permission}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedPermissions.map((permission) => (
                <span
                  key={permission}
                  className="px-2 py-1 text-xs rounded-full bg-muted"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 