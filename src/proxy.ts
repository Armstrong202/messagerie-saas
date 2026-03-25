import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  return NextResponse.next({
    request: {
      headers: request.headers
    }
  })
}

export const config = {
  matcher: ['/dashboard/:path*']
}
