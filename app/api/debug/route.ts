import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/lib/database.types'

export async function GET() {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  
  // Get session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  // Get profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .single()
  
  return NextResponse.json({
    session: {
      exists: !!session,
      user: session?.user,
      error: sessionError
    },
    profile: {
      data: profile,
      error: profileError
    }
  })
} 