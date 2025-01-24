'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = createServerActionClient({ cookies })
  
  // Sign out the user
  await supabase.auth.signOut()
  
  // Redirect to login page
  redirect('/login')
} 