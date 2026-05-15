/**
 * Nexik Onboarding API
 * Handles business analysis and widget creation
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateResponse } from '@/lib/ai/router'
import { query } from '@/lib/db'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXIK_JWT_SECRET || 'nexik-secret-key-change-in-production'
)

// Analyze business description and generate AI config
async function analyzeBusiness(description: string): Promise<{
  businessName: string
  businessType: string
  systemPrompt: string
  welcomeMessage: string
  quickReplies: string[]
}> {
  const analysisPrompt = `Проанализируй описание бизнеса и верни JSON (только JSON, без markdown):

Описание: "${description}"

Формат ответа:
{
  "businessName": "короткое название бизнеса (2-4 слова)",
  "businessType": "тип бизнеса (услуги/товары/доставка/консалтинг/другое)",
  "systemPrompt": "промпт для AI-ассистента этого бизнеса (2-3 предложения, как он должен общаться, что знать)",
  "welcomeMessage": "приветственное сообщение для посетителей сайта (1-2 предложения)",
  "quickReplies": ["3-4 типичных вопроса которые могут задать клиенты"]
}`

  const { text } = await generateResponse(analysisPrompt, {
    useRAG: false,
    language: 'ru'
  }, {
    temperature: 0.7
  })

  // Parse JSON from response
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('[Onboarding] Failed to parse AI response:', e)
  }

  // Fallback
  return {
    businessName: description.slice(0, 50),
    businessType: 'другое',
    systemPrompt: `Ты AI-ассистент. ${description}. Помогай клиентам и отвечай на вопросы.`,
    welcomeMessage: 'Здравствуйте! Чем могу помочь?',
    quickReplies: ['Расскажите о услугах', 'Какие цены?', 'Как связаться?']
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, data } = body

    switch (action) {
      case 'analyze_business': {
        const { description } = data
        if (!description || description.length < 10) {
          return NextResponse.json({ 
            error: 'Опиши бизнес подробнее (минимум 10 символов)' 
          }, { status: 400 })
        }

        const analysis = await analyzeBusiness(description)
        return NextResponse.json({ success: true, analysis })
      }

      case 'create_widget': {
        const { 
          businessDescription,
          businessName,
          systemPrompt,
          welcomeMessage,
          quickReplies,
          schedule,
          contact 
        } = data

        // Validate required fields
        if (!contact?.email) {
          return NextResponse.json({ error: 'Email обязателен' }, { status: 400 })
        }

        // Generate password and IDs
        const generatedPassword = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 4).toUpperCase()
        const passwordHash = await bcrypt.hash(generatedPassword, 10)
        const orgId = uuid()
        const memberId = uuid()
        const widgetId = `nxk_${Math.random().toString(36).substring(2, 12)}`
        const apiKey = `nxk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`

        // Create organization
        await query(`
          INSERT INTO nexik_organizations (
            id, name, plan, owner_email, owner_name, owner_phone,
            business_description, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `, [
          orgId,
          businessName,
          'free',
          contact.email,
          contact.name || null,
          contact.phone || null,
          businessDescription
        ])

        // Create API key
        await query(`
          INSERT INTO nexik_api_keys (
            id, org_id, key_hash, key_prefix, name, created_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())
        `, [
          uuid(),
          orgId,
          apiKey, // In production, hash this
          apiKey.substring(0, 12),
          'Default Key'
        ])

        // Create widget
        await query(`
          INSERT INTO nexik_widgets (
            id, org_id, name, domains, 
            welcome_message, system_prompt, quick_replies,
            ai_enabled, theme,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        `, [
          widgetId,
          orgId,
          businessName,
          [contact.website || ''].filter(Boolean),
          welcomeMessage,
          systemPrompt,
          JSON.stringify(quickReplies),
          true,
          JSON.stringify({
            position: 'bottom-right',
            primaryColor: '#00ffff',
            theme: 'dark'
          })
        ])

        // Create owner member
        await query(`
          INSERT INTO nexik_org_members (
            id, org_id, email, password_hash, name, role, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
        `, [
          memberId,
          orgId,
          contact.email.toLowerCase(),
          passwordHash,
          contact.name || null,
          'owner'
        ])

        // Create schedule if provided
        if (schedule && !schedule.aiOnly) {
          await query(`
            INSERT INTO nexik_schedules (
              id, org_id, widget_id, mode, work_hours, work_days, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
          `, [
            uuid(),
            orgId,
            widgetId,
            'hybrid',
            JSON.stringify(schedule.workHours),
            JSON.stringify(schedule.workDays || ['mon', 'tue', 'wed', 'thu', 'fri'])
          ])
        }

        // Create JWT and set cookies
        const token = await new SignJWT({
          sub: memberId,
          email: contact.email.toLowerCase(),
          org_id: orgId,
          role: 'owner'
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('7d')
          .sign(JWT_SECRET)

        const cookieStore = await cookies()
        
        cookieStore.set('nexik_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7
        })

        cookieStore.set('nexik_org_id', orgId, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7
        })

        return NextResponse.json({
          success: true,
          widget: {
            id: widgetId,
            orgId,
            apiKey,
            embedCode: `<script src="https://netnext.site/nexik/widget.js" data-id="${widgetId}"></script>`
          },
          credentials: {
            email: contact.email.toLowerCase(),
            password: generatedPassword // Show once to user
          }
        })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('[Onboarding API] Error:', error)
    return NextResponse.json({ 
      error: 'Произошла ошибка. Попробуйте позже.' 
    }, { status: 500 })
  }
}
