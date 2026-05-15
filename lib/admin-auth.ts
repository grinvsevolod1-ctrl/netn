import { NextRequest, NextResponse } from 'next/server'

const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN

/**
 * Verify admin token from request headers
 * Token should be sent as: Authorization: Bearer <token>
 */
export function verifyAdminToken(request: NextRequest): boolean {
  if (!ADMIN_TOKEN) {
    console.warn('[Admin] ADMIN_API_TOKEN not set - admin access disabled')
    return false
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.slice(7)
  return token === ADMIN_TOKEN
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}

/**
 * Wrapper for admin API routes that require authentication
 */
export function withAdminAuth(
  handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: unknown) => {
    if (!verifyAdminToken(request)) {
      return unauthorizedResponse()
    }
    return handler(request, context)
  }
}
