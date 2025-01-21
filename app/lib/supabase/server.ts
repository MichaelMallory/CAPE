import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
} 