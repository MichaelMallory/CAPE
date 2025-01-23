import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

export async function middleware(req: NextRequest) {
  try {
    // Create a response to modify
    const res = NextResponse.next()
    
    // Create middleware client
    const supabase = createMiddlewareClient<Database>({ req, res })

    // Get and refresh session
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('🔒 Middleware - Session Error:', error);
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Handle auth protected routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      if (!session) {
        console.log('🔒 Middleware - No Session for Dashboard');
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Verify role matches the dashboard
      const role = session.user.user_metadata.role?.toLowerCase() || 'hero'
      const requestedPath = req.nextUrl.pathname.split('/')[2] // Get 'hero' or 'support'
      
      if (requestedPath && requestedPath !== role) {
        console.log('🔒 Middleware - Role Mismatch:', { role, requestedPath });
        return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url))
      }
    }

    // Handle auth public routes
    if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register') {
      if (session) {
        const role = session.user.user_metadata.role?.toLowerCase() || 'hero'
        console.log('🔒 Middleware - Redirecting Authenticated User:', { role });
        return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url))
      }
    }

    return res
  } catch (error) {
    console.error('🔒 Middleware - Error:', error);
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard/:path*'
  ],
} 