import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import env from '@/lib/env'

export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient(request)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  // Protect dashboard and admin
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Optional: role check for admin
  // TODO: Admin role check from user_metadata
  // if (pathname.startsWith('/admin') && !session.user.user_metadata?.role === 'admin') {
  //   return NextResponse.redirect(new URL('/dashboard', request.url))
  // }
  }

  return NextResponse.next({
    request,
    headers: request.headers,
  })
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
}

