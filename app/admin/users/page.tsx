import { Suspense } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Search } from 'lucide-react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface User {
  id: string;
  codename: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MIA';
  clearance_level: number;
  team_affiliations: string[];
  last_active: string;
  metadata: Record<string, unknown>;
}

async function getUsers(): Promise<User[]> {
  const supabase = createServerComponentClient({ cookies });
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      id,
      codename,
      status,
      clearance_level,
      team_affiliations,
      last_active,
      metadata
    `)
    .order('last_active', { ascending: false });

  if (error) throw error;
  return users;
}

const columns = [
  {
    accessorKey: 'codename',
    header: 'Codename',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => (
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        <span className="font-bold">{row.getValue('codename')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: { getValue: (key: string) => User['status'] } }) => {
      const status = row.getValue('status');
      const colors = {
        ACTIVE: 'bg-green-500',
        INACTIVE: 'bg-gray-500',
        MIA: 'bg-red-500',
      } as const;
      return (
        <Badge className={`${colors[status]} text-white`}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'clearance_level',
    header: 'Clearance Level',
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => (
      <div className="flex items-center gap-1">
        <span className="font-mono">{row.getValue('clearance_level')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'team_affiliations',
    header: 'Team',
    cell: ({ row }: { row: { getValue: (key: string) => string[] } }) => {
      const teams = row.getValue('team_affiliations');
      return (
        <div className="flex gap-1 flex-wrap">
          {teams.map((team) => (
            <Badge key={team} variant="outline">
              {team}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'last_active',
    header: 'Last Active',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const date = new Date(row.getValue('last_active'));
      return date.toLocaleDateString();
    },
  },
];

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Hero Registry</h1>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search heroes..."
                className="pl-9"
                name="Search users"
                type="search"
              />
            </div>
          </div>
          <Select name="Filter by status">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="MIA">MIA</option>
          </Select>
        </div>

        <Suspense fallback={<div>Loading heroes...</div>}>
          <DataTable
            columns={columns}
            data={users}
          />
        </Suspense>
      </Card>
    </div>
  );
} 