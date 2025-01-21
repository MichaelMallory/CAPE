import { createClient } from "../../lib/supabase/server"
import { cookies } from "next/headers"
import { User } from "../../(admin)/users/columns"

interface DatabaseUser {
  id: string
  full_name: string
  email: string
  user_role: User['role']
  status: User['status']
  clearance_level: number
  last_active: string
}

export async function getUsers(): Promise<User[]> {
  const supabase = createClient(cookies())
  
  const { data: users, error } = await supabase
    .from("users")
    .select(`
      id,
      name:full_name,
      email,
      role:user_role,
      status,
      clearance_level,
      last_active
    `)
    .order("last_active", { ascending: false })
    .returns<DatabaseUser[]>()

  if (error) {
    console.error("Error fetching users:", error)
    throw new Error("Failed to fetch users")
  }

  return users.map((user: DatabaseUser) => ({
    id: user.id,
    name: user.full_name,
    email: user.email,
    role: user.user_role,
    status: user.status,
    clearanceLevel: user.clearance_level,
    lastActive: user.last_active,
  }))
} 