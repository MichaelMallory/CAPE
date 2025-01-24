import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, User } from "lucide-react"
import { Database } from "@/lib/database.types"
import { signOut } from '@/actions/auth'

async function getUserProfile() {
  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, codename, real_name')
    .eq('id', session.user.id)
    .single()

  return profile
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()
  
  if (!profile) {
    redirect("/login")
  }

  const displayName = profile.codename || profile.real_name || 'Unknown Hero'

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed header */}
      <div className="bg-white fixed top-0 left-0 right-0 z-50">
        {/* Main header with borders */}
        <header className="border-b-4 border-t-4 border-black shadow-lg relative">
          {/* Comic panel corner effects */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-black" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-black" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-black" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-black" />
          
          {/* Left and right borders */}
          <div className="absolute top-0 bottom-0 left-0 w-4 border-l-4 border-black" />
          <div className="absolute top-0 bottom-0 right-0 w-4 border-r-4 border-black" />
          
          <div className="container mx-auto px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-comic font-bold">CAPE HQ</h1>
            </div>
            <nav className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{displayName}</span>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
              <form action={signOut}>
                <Button variant="outline" type="submit">Sign Out</Button>
              </form>
            </nav>
          </div>
        </header>
      </div>
      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-[72px]" />
      <main className="relative">
        {children}
      </main>
    </div>
  )
} 