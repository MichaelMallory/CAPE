'use client';

import { useState, useEffect } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import { Shield, Search } from 'lucide-react';

interface User {
  id: string;
  codename: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MIA';
}

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

export function AssignUsersDialog({ role, open, onOpenChange }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [currentMembers, setCurrentMembers] = useState<Set<string>>(new Set());
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  // Load current role members
  useEffect(() => {
    async function loadRoleMembers() {
      const { data, error } = await supabase
        .from('role_assignments')
        .select('user_id')
        .eq('role_id', role.id);

      if (!error && data) {
        setCurrentMembers(new Set(data.map((d) => d.user_id)));
      }
    }

    loadRoleMembers();
  }, [role.id, supabase]);

  // Load and filter users based on search
  useEffect(() => {
    async function searchUsers() {
      const query = supabase
        .from('users')
        .select('id, codename, status')
        .order('codename');

      if (searchQuery) {
        query.ilike('codename', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (!error && data) {
        setUsers(data);
      }
    }

    searchUsers();
  }, [searchQuery, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Remove users who were unselected
      const usersToRemove = Array.from(currentMembers).filter(
        (id) => !selectedUsers.has(id)
      );
      if (usersToRemove.length > 0) {
        await supabase
          .from('role_assignments')
          .delete()
          .eq('role_id', role.id)
          .in('user_id', usersToRemove);
      }

      // Add newly selected users
      const usersToAdd = Array.from(selectedUsers).filter(
        (id) => !currentMembers.has(id)
      );
      if (usersToAdd.length > 0) {
        await supabase.from('role_assignments').insert(
          usersToAdd.map((userId) => ({
            role_id: role.id,
            user_id: userId,
          }))
        );
      }

      // Update role member count
      await supabase
        .from('roles')
        .update({ member_count: selectedUsers.size })
        .eq('id', role.id);

      toast({
        title: 'Users assigned',
        description: `Successfully updated role assignments for "${role.name}".`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role assignments. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((current) => {
      const next = new Set(current);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Users to Role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by codename..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Users</Label>
            <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
              {users.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="h-4 w-4"
                  />
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="font-medium">{user.codename}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        user.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : user.status === 'INACTIVE'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                </label>
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
              {isLoading ? 'Saving...' : 'Save Assignments'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 