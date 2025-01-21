import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/lib/database.types'

export async function middleware(req: NextRequest) {
  // Allow all requests to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run middleware on auth routes
    '/(auth)/:path*',
    '/login',
    '/register'
  ],
} 