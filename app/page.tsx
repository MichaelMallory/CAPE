import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user's role from the profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  // Redirect based on role
  if (profile?.role === 'support') {
    redirect("/dashboard/support")
  } else if (profile?.role === 'hero') {
    redirect("/dashboard/hero")
  } else if (profile?.role === 'admin') {
    redirect("/dashboard/admin")
  } else {
    redirect("/login")
  }
} 