import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { getUsers } from "@/lib/api/users"

export const metadata = {
  title: "User Management | CAPE HQ",
  description: "Manage hero and support staff accounts",
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage hero and support staff accounts
          </p>
        </div>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  )
} 