import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
  }

  try {
    // Test database connection
    await query('SELECT 1')
    checks.database = true
  } catch {
    checks.database = false
  }

  const healthy = checks.database

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'unhealthy',
      checks,
    },
    { status: healthy ? 200 : 503 }
  )
}
