import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Shield, Users, Plus } from 'lucide-react';
import { CreateRoleDialog } from './create-role-dialog';
import { RoleActions } from './role-actions';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  member_count: number;
  updated_at: string;
}

async function getRoles(): Promise<Role[]> {
  const supabase = createServerComponentClient({ cookies });
  const { data: roles, error } = await supabase
    .from('roles')
    .select(`
      id,
      name,
      description,
      permissions,
      member_count,
      updated_at
    `)
    .order('name');

  if (error) throw error;
  return roles || [];
}

const columns = [
  {
    accessorKey: 'name',
    header: 'Role Name',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => (
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        <span className="font-bold">{row.getValue('name')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'permissions',
    header: 'Permissions',
    cell: ({ row }: { row: { getValue: (key: string) => string[] } }) => {
      const permissions = row.getValue('permissions');
      return (
        <div className="flex flex-wrap gap-1">
          {permissions.slice(0, 2).map((permission) => (
            <span
              key={permission}
              className="px-2 py-1 text-xs rounded-full bg-muted"
            >
              {permission}
            </span>
          ))}
          {permissions.length > 2 && (
            <span className="px-2 py-1 text-xs rounded-full bg-muted">
              +{permissions.length - 2} more
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'member_count',
    header: 'Members',
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => (
      <div className="flex items-center gap-1">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span>{row.getValue('member_count')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'updated_at',
    header: 'Last Modified',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const date = new Date(row.getValue('updated_at'));
      return date.toLocaleDateString();
    },
  },
  {
    id: 'actions',
    cell: ({ row }: { row: { original: Role } }) => (
      <RoleActions role={row.original} />
    ),
  },
];

export default async function RolesPage() {
  const roles = await getRoles();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Role Management</h1>
        </div>
        <CreateRoleDialog>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </CreateRoleDialog>
      </div>

      <Card className="p-6">
        <Suspense fallback={<div>Loading roles...</div>}>
          <DataTable
            columns={columns}
            data={roles}
          />
        </Suspense>
      </Card>
    </div>
  );
} 