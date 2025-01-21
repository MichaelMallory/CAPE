// Move debug info to a separate client component
'use client'
function DebugInfo({ profile }: { profile: any }) {
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg max-w-lg overflow-auto">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <pre className="text-sm">
        {JSON.stringify(profile, null, 2)}
      </pre>
    </div>
  )
}

// Server component starts here - remove 'use client'
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Database } from "@/lib/database.types"

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