/**
 * Nexik Chat API for External Clients
 * Requires clientId for authentication
 * Falls back to demo mode if no database
 */

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

interface ChatRequestBody {
  clientId: string
  sessionId: string
  message: string
  context?: {
    companyName?: string
    assistantName?: string
    isConnectedToOperator?: boolean
  }
  previousMessages?: Array<{ role: string; content: string }>
}

// Demo responses - same as local but customizable
const createDemoResponses = (companyName: string, assistantName: string) => ({
  услуги: `Привет! Я ${assistantName} — виртуальный помощник ${companyName}.

Я могу помочь вам с информацией о наших услугах и ответить на вопросы.

Чем могу помочь?`,

  цена: `Стоимость зависит от ваших требований. 

Для точной оценки оставьте заявку — наш менеджер свяжется с вами и обсудит детали.

Хотите оставить заявку?`,

  консультация: `Отлично! Оставьте ваши контактные данные и мы свяжемся с вами в ближайшее время.

Что вам удобнее — телефон или email?`,

  оператор: `Понял, сейчас подключу оператора!

Пожалуйста, подождите — среднее время ожидания 1-2 минуты.`,

  default: `Спасибо за сообщение! Я ${assistantName} — виртуальный помощник ${companyName}.

Чем могу помочь?`,
})

function findResponse(message: string, companyName: string, assistantName: string): string {
  const lowerMessage = message.toLowerCase()
  const responses = createDemoResponses(companyName, assistantName)
  
  if (lowerMessage.includes('услуг') || lowerMessage.includes('делает') || lowerMessage.includes('предлага')) {
    return responses.услуги
  }
  if (lowerMessage.includes('цен') || lowerMessage.includes('стоим') || lowerMessage.includes('скольк')) {
    return responses.цена
  }
  if (lowerMessage.includes('консультац') || lowerMessage.includes('запис') || lowerMessage.includes('встреч') || lowerMessage.includes('заявк')) {
    return responses.консультация
  }
  if (lowerMessage.includes('оператор') || lowerMessage.includes('человек') || lowerMessage.includes('менеджер')) {
    return responses.оператор
  }
  if (lowerMessage.includes('привет') || lowerMessage.includes('здравств') || lowerMessage.includes('добр')) {
    return `Привет! Рад вас видеть! Я ${assistantName}. Чем могу помочь сегодня?`
  }
  if (lowerMessage.includes('спасибо') || lowerMessage.includes('благодар')) {
    return 'Пожалуйста! Рад был помочь. Если возникнут ещё вопросы — обращайтесь!'
  }
  
  return responses.default
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json()
    const { clientId, message, context } = body

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      )
    }

    if (!message) {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 }
      )
    }

    // TODO: In production, validate clientId against database
    // and fetch company-specific settings (knowledge base, prompts, etc.)
    // For now, use demo mode
    
    const companyName = context?.companyName || 'Company'
    const assistantName = context?.assistantName || 'Nexik'

    // Simulate AI thinking
    await delay(600 + Math.random() * 600)

    const responseText = findResponse(message, companyName, assistantName)

    // Log chat for analytics (in production, save to database)
    console.log(`[Nexik Chat] clientId=${clientId} message="${message.substring(0, 50)}..."`)

    return NextResponse.json({
      text: responseText,
      source: 'nexik',
      clientId,
      buttons: [],
    })

  } catch (error) {
    console.error('[Nexik Chat API error]', error)
    return NextResponse.json(
      { 
        error: 'Chat temporarily unavailable',
        text: 'Извините, произошла ошибка. Попробуйте ещё раз.',
      },
      { status: 500 }
    )
  }
}

// GET - health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'nexik-chat',
    version: '1.0.0',
  })
}
