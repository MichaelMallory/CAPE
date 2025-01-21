import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield } from "lucide-react"
import { Database } from "@/lib/database.types"

async function getUserRole() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .single()

  return profile?.role
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporarily bypass auth
  // const supabase = createServerComponentClient<Database>({ cookies })
  // const { data: { session } } = await supabase.auth.getSession()

  // if (!session) {
  //   redirect("/login")
  // }

  // // Get user's role and ensure they're on the correct dashboard
  // const role = await getUserRole()
  // if (!role) {
  //   redirect("/login")
  // }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">CAPE HQ</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/profile">Profile</Link>
            </Button>
            <form action="/auth/signout" method="post">
              <Button variant="outline" type="submit">Sign Out</Button>
            </form>
          </nav>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  )
} 