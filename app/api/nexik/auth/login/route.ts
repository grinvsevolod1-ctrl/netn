import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXIK_JWT_SECRET || 'nexik-secret-key-change-in-production'
)

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    // Try to find user in database
    let user = null
    let org = null

    try {
      const { query } = await import('@/lib/db')
      
      // Find member by email
      const members = await query<{
        id: string
        org_id: string
        email: string
        password_hash: string
        name: string
        role: string
      }>(
        `SELECT m.*, o.name as org_name 
         FROM nexik_org_members m
         JOIN nexik_organizations o ON o.id = m.org_id
         WHERE m.email = $1`,
        [email.toLowerCase()]
      )

      if (members.length > 0) {
        const member = members[0]
        
        // Verify password (using bcrypt in production)
        // For now, simple comparison (REPLACE WITH BCRYPT IN PRODUCTION)
        const bcrypt = await import('bcryptjs').catch(() => null)
        
        if (bcrypt && member.password_hash) {
          const valid = await bcrypt.compare(password, member.password_hash)
          if (!valid) {
            return NextResponse.json(
              { error: 'Неверный email или пароль' },
              { status: 401 }
            )
          }
        } else if (member.password_hash !== password) {
          // Fallback for dev without bcrypt
          return NextResponse.json(
            { error: 'Неверный email или пароль' },
            { status: 401 }
          )
        }

        user = member
        
        // Get org
        const orgs = await query<{ id: string; name: string }>(
          'SELECT id, name FROM nexik_organizations WHERE id = $1',
          [member.org_id]
        )
        org = orgs[0]

        // Update last login
        await query(
          'UPDATE nexik_org_members SET last_login_at = NOW() WHERE id = $1',
          [member.id]
        )
      }
    } catch (error) {
      console.error('[Nexik Auth] Database error:', error)
      // Continue with demo mode if DB not available
    }

    // Demo mode - allow test@test.com / test123
    if (!user && email === 'test@test.com' && password === 'test123') {
      user = {
        id: 'demo-user',
        org_id: 'demo-org',
        email: 'test@test.com',
        name: 'Demo User',
        role: 'owner'
      }
      org = {
        id: 'demo-org',
        name: 'Demo Organization'
      }
    }

    if (!user || !org) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      org_id: org.id,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // Set cookies
    const cookieStore = await cookies()
    
    cookieStore.set('nexik_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    cookieStore.set('nexik_org_id', org.id, {
      httpOnly: false, // Allow JS access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      org: {
        id: org.id,
        name: org.name
      }
    })

  } catch (error) {
    console.error('[Nexik Auth] Login error:', error)
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
