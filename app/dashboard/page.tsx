// Remove client directive from this file since it's a server component
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Database } from "@/lib/database.types"
import { DebugInfo } from "./debug-info"

export default async function DashboardPage() {
  const supabase = createServerComponentClient<Database>({ cookies })
  
  // Get user's role from profiles table
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .single()
  
  if (error) {
    console.error('Profile error:', error)
    redirect('/login')
  }

  if (!profile?.role) {
    console.error('No role found in profile')
    redirect('/login')
  }

  // Convert role to lowercase for URL path
  const dashboardPath = `/dashboard/${profile.role.toLowerCase()}`
  
  return (
    <>
      <DebugInfo profile={profile} />
      <div className="p-4">
        <h1>Redirecting to {dashboardPath}...</h1>
        <p>If you are not redirected, <a href={dashboardPath}>click here</a></p>
      </div>
    </>
  )
} 