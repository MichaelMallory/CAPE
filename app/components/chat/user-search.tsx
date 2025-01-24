'use client';

import { useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  codename: string;
  real_name: string | null;
  avatar_url: string | null;
}

interface UserSearchProps {
  currentUserId: string;
  onSelectUser: (user: User) => void;
  className?: string;
}

export function UserSearch({ currentUserId, onSelectUser, className }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const supabase = createClientComponentClient();

  const searchUsers = useCallback(async (query: string) => {
    console.log('Searching users with term:', query);
    if (!query) {
      console.log('Empty search term, clearing results');
      setUsers([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Making Supabase query with params:', {
        query,
        currentUserId
      });

      const { data, error } = await supabase
        .from('profiles')
        .select('id, codename, real_name')
        .or(`codename.ilike.%${query}%,real_name.ilike.%${query}%`)
        .neq('id', currentUserId)
        .eq('status', 'ACTIVE')
        .limit(5);

      console.log('Query results:', { 
        data: data ? JSON.stringify(data, null, 2) : null,
        error 
      });

      if (error) {
        console.error('Search error:', error);
        return;
      }

      if (data) {
        const mappedUsers = data.map(user => ({
          ...user,
          avatar_url: null
        }));
        console.log('Mapped users:', JSON.stringify(mappedUsers, null, 2));
        setUsers(mappedUsers);
      }
    } finally {
      setIsSearching(false);
    }
  }, [currentUserId, supabase]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            searchUsers(e.target.value);
          }}
          className={cn("pl-8", className)}
        />
      </div>
      
      {isSearching ? (
        <div className="fixed z-[9999] w-full mt-1 rounded-md border bg-white dark:bg-gray-800 p-2 text-sm text-muted-foreground shadow-md" style={{ width: 'inherit' }}>
          Searching...
        </div>
      ) : users.length > 0 ? (
        <div className="fixed z-[9999] w-full mt-1 rounded-md border bg-white dark:bg-gray-800 shadow-md" style={{ width: 'inherit' }}>
          <div className="max-h-[200px] overflow-y-auto py-1">
            {users.map((user) => (
              <button
                key={user.id}
                className="w-full px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2 bg-white dark:bg-gray-800"
                onClick={() => {
                  onSelectUser(user);
                  setSearchQuery('');
                  setUsers([]);
                }}
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {user.codename.charAt(0)}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium truncate">{user.codename}</span>
                  {user.real_name && (
                    <span className="text-xs text-muted-foreground truncate">{user.real_name}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : searchQuery && (
        <div className="fixed z-[9999] w-full mt-1 rounded-md border bg-white dark:bg-gray-800 p-2 text-sm text-muted-foreground shadow-md" style={{ width: 'inherit' }}>
          No users found
        </div>
      )}
    </div>
  );
} 