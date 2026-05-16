/**
 * Nexik Operator Request API
 * Notifies when a user requests to speak with an operator
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

interface OperatorRequestBody {
  clientId: string
  sessionId: string
  messages?: Array<{ role: string; content: string }>
  userInfo?: {
    name?: string
    email?: string
    phone?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: OperatorRequestBody = await request.json()
    const { clientId, sessionId, messages, userInfo } = body

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      )
    }

    // TODO: In production:
    // 1. Save operator request to database
    // 2. Send notification via webhook (Telegram, Slack, email)
    // 3. Add to operator queue in real-time dashboard
    
    console.log(`[Nexik Operator] Request from clientId=${clientId} sessionId=${sessionId}`)
    console.log(`[Nexik Operator] Last messages:`, messages?.slice(-3))
    
    if (userInfo) {
      console.log(`[Nexik Operator] User info:`, userInfo)
    }

    // Simulate webhook notification
    // In production, this would send to client's configured webhook URL
    // await sendWebhook(clientWebhookUrl, { type: 'operator_request', sessionId, messages })

    return NextResponse.json({
      success: true,
      message: 'Operator notified',
      estimatedWaitTime: '1-2 minutes',
      queuePosition: 1, // Placeholder
    })

  } catch (error) {
    console.error('[Nexik Operator API error]', error)
    return NextResponse.json(
      { error: 'Failed to notify operator' },
      { status: 500 }
    )
  }
}
