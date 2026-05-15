import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Nexik Dashboard Authorization Middleware
 * Protects /nexik/dashboard/* routes
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes
  if (pathname.startsWith('/nexik/dashboard')) {
    const token = request.cookies.get('nexik_token')?.value
    const orgId = request.cookies.get('nexik_org_id')?.value

    // No token - redirect to start
    if (!token || !orgId) {
      const url = request.nextUrl.clone()
      url.pathname = '/nexik/start'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // Basic JWT validation (check expiry)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const exp = payload.exp * 1000

      if (Date.now() > exp) {
        // Token expired - clear and redirect
        const response = NextResponse.redirect(new URL('/nexik/start', request.url))
        response.cookies.delete('nexik_token')
        response.cookies.delete('nexik_org_id')
        return response
      }
    } catch {
      // Invalid token format - redirect
      const response = NextResponse.redirect(new URL('/nexik/start', request.url))
      response.cookies.delete('nexik_token')
      response.cookies.delete('nexik_org_id')
      return response
    }
  }

  // Widget API - add CORS headers
  if (pathname.startsWith('/api/nexik/v1/')) {
    const response = NextResponse.next()
    
    // Allow requests from any domain (widgets are embedded on client sites)
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-Widget-ID')
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/nexik/dashboard/:path*',
    '/api/nexik/v1/:path*',
  ],
}
