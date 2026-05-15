/**
 * Nexik AI Chat API
 * Endpoint для AI-ответов с поддержкой streaming
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateResponse, streamResponse, type ChatContext } from '@/lib/ai/router'
import { getSession, createSession, addMessage, getSessionMessages } from '@/lib/db/chat'
import { findMatchingAutoResponse, incrementAutoResponseUse } from '@/lib/db/auto-responses'

export const runtime = 'nodejs'
export const maxDuration = 30

interface AIRequestBody {
  sessionId: string
  message: string
  // Опциональный контекст от клиента Nexik
  context?: {
    companyName?: string
    companyDescription?: string
    knowledgeBase?: string
  }
  // Streaming или обычный ответ
  stream?: boolean
}

async function getOrCreateSession(sessionId: string) {
  let session = await getSession(sessionId)
  if (!session) {
    session = await createSession(sessionId, 'website')
  }
  return session
}

export async function POST(request: NextRequest) {
  try {
    const body: AIRequestBody = await request.json()
    const { sessionId, message, context, stream = false } = body

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'sessionId and message are required' },
        { status: 400 }
      )
    }

    // Получаем или создаём сессию
    const session = await getOrCreateSession(sessionId)

    // Проверяем, подключен ли оператор
    if (session.operator_connected) {
      // Если оператор подключен — просто сохраняем сообщение, AI не отвечает
      await addMessage(sessionId, 'user', message)
      return NextResponse.json({ 
        operatorMode: true,
        message: 'Оператор подключен, ожидайте ответ'
      })
    }

    // Сохраняем сообщение пользователя
    await addMessage(sessionId, 'user', message)

    // 1. Сначала проверяем правила автоответов (для точных сценариев)
    const autoResponse = await findMatchingAutoResponse(message)
    if (autoResponse) {
      incrementAutoResponseUse(autoResponse.id).catch(() => {})
      
      // Сохраняем ответ бота
      await addMessage(sessionId, 'bot', autoResponse.response_text)
      
      return NextResponse.json({
        text: autoResponse.response_text,
        buttons: autoResponse.response_buttons || [],
        source: 'auto-response',
        ruleId: autoResponse.id,
      })
    }

    // 2. Если автоответ не найден — используем AI
    // Получаем историю для контекста
    const history = await getSessionMessages(sessionId, 10)
    const previousMessages = history
      .reverse() // От старых к новым
      .slice(0, -1) // Исключаем текущее сообщение
      .map(msg => ({
        role: msg.sender_type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.message,
      }))

    const chatContext: ChatContext = {
      companyName: context?.companyName || 'NetNext',
      companyDescription: context?.companyDescription || 'Веб-студия разработки в Минске',
      knowledgeBase: context?.knowledgeBase,
      previousMessages,
      language: 'ru',
    }

    // Streaming ответ
    if (stream) {
      const result = await streamResponse(message, chatContext)
      
      // Возвращаем stream
      return new Response(result.textStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Обычный ответ
    const { text, model } = await generateResponse(message, chatContext)

    // Сохраняем ответ AI
    await addMessage(sessionId, 'bot', text)

    return NextResponse.json({
      text,
      source: 'ollama',
      model,
      buttons: [], // AI не генерирует кнопки пока
    })

  } catch (error) {
    console.error('[AI Chat API error]', error)
    return NextResponse.json(
      { 
        error: 'AI temporarily unavailable',
        text: 'Извините, произошла ошибка. Попробуйте ещё раз или свяжитесь с оператором.',
      },
      { status: 500 }
    )
  }
}
