"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowRight, Zap, Check, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiriOrb } from "@/components/nexik/siri-orb"
import { Chat } from "@/components/chat"

// Demo AI responses
const AI_RESPONSES: Record<string, string> = {
  "привет": "Привет! Я Nexik — AI-ассистент для бизнеса. Расскажи, чем занимаешься, и я покажу как могу помочь твоим клиентам.",
  "автосервис": "Автосервис — отлично! Я могу:\n\n• Отвечать на вопросы о ценах на ТО\n• Записывать на диагностику\n• Сообщать статус ремонта\n• Вызывать эвакуатор\n\nВсё это 24/7, без выходных. Хочешь запустить?",
  "салон": "Салон красоты — моя тема! Буду:\n\n• Записывать к мастерам\n• Показывать свободные окна\n• Напоминать о записи\n• Отвечать о ценах\n\nКлиенты получат ответ за секунды. Запустим?",
  "ресторан": "Ресторан/кафе — понял! Смогу:\n\n• Показывать меню и цены\n• Принимать заказы\n• Бронировать столики\n• Рассказывать об акциях\n\nНикаких пропущенных заказов. Готов начать?",
  "default": "Интересно! Расскажи подробнее о своём бизнесе — что продаёшь или какие услуги оказываешь? Я быстро пойму как помочь твоим клиентам."
}

function getAIResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes("привет") || lower.includes("здравствуй") || lower.includes("хай")) {
    return AI_RESPONSES["привет"]
  }
  if (lower.includes("авто") || lower.includes("машин") || lower.includes("сто") || lower.includes("ремонт авто")) {
    return AI_RESPONSES["автосервис"]
  }
  if (lower.includes("салон") || lower.includes("красот") || lower.includes("парик") || lower.includes("маник")) {
    return AI_RESPONSES["салон"]
  }
  if (lower.includes("ресторан") || lower.includes("кафе") || lower.includes("еда") || lower.includes("достав")) {
    return AI_RESPONSES["ресторан"]
  }
  return AI_RESPONSES["default"]
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

// Main interactive demo
function InteractiveDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Привет! Я Nexik. Расскажи чем занимаешься — покажу как буду помогать твоим клиентам."
    }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const sendMessage = useCallback(() => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI thinking
    setTimeout(() => {
      const response = getAIResponse(userMessage.content)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant", 
        content: response
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 800)
  }, [input, isTyping])

  const quickActions = [
    { label: "Автосервис", value: "У меня автосервис" },
    { label: "Салон красоты", value: "У меня салон красоты" },
    { label: "Ресторан", value: "У меня ресторан" },
  ]

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Chat container */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-cyan-500/5">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <SiriOrb size={40} state="idle" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Nexik</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400">AI</span>
            </div>
            <span className="text-xs text-zinc-500">демо-режим</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-600">онлайн</span>
          </div>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-cyan-500 text-black rounded-br-sm"
                    : "bg-zinc-800/80 text-white rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-zinc-800/80 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {/* Quick actions after first message */}
          {messages.length === 1 && !isTyping && (
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => {
                    setInput(action.value)
                    setTimeout(() => {
                      const input = document.querySelector('input') as HTMLInputElement
                      if (input) {
                        input.focus()
                      }
                    }, 0)
                  }}
                  className="px-3 py-1.5 text-xs rounded-full border border-white/10 text-zinc-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Расскажи о своём бизнесе..."
              className="flex-1 bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 rounded-xl bg-cyan-500 text-black flex items-center justify-center hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* CTA below chat */}
      <div className="mt-6 text-center">
        <Button size="lg" className="bg-cyan-500 text-black hover:bg-cyan-400 gap-2 h-12 px-8" asChild>
          <Link href="/nexik/start">
            Запустить Nexik
            <Zap className="w-4 h-4" />
          </Link>
        </Button>
        <p className="text-xs text-zinc-600 mt-3">
          Бесплатно при заказе сайта в NetNext
        </p>
      </div>
    </div>
  )
}

export default function NexikPage() {
  const [mounted, setMounted] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsChatOpen(false)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsChatOpen(prev => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/nexik" className="flex items-center gap-2">
            <SiriOrb size={28} state="idle" />
            <span className="font-semibold">Nexik</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/nexik/login" className="text-sm text-zinc-500 hover:text-white transition-colors">
              Войти
            </Link>
            <Button size="sm" className="bg-white text-black hover:bg-zinc-200 h-8" asChild>
              <Link href="/nexik/start">
                Начать
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative pt-14">
        {/* Hero - minimal with chat */}
        <section className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-6 py-16">
          {/* Tagline */}
          <div className="text-center mb-12 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-zinc-400">AI-ассистент для бизнеса</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
              Попробуй прямо сейчас
            </h1>
            <p className="text-zinc-500 text-lg">
              Напиши чем занимаешься — Nexik покажет как будет работать
            </p>
          </div>

          {/* Interactive Demo */}
          <InteractiveDemo />
        </section>

        {/* Features - minimal */}
        <section className="py-24 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                {
                  title: "2 минуты",
                  desc: "на запуск. Без программистов и настроек"
                },
                {
                  title: "24/7",
                  desc: "отвечает клиентам даже ночью"
                },
                {
                  title: "1 строка",
                  desc: "кода для интеграции на сайт"
                }
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">{item.title}</div>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works - minimal */}
        <section className="py-24 px-6 border-t border-white/5">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12">Как это работает</h2>
            <div className="space-y-6">
              {[
                { step: "1", text: "Расскажи о бизнесе в чате" },
                { step: "2", text: "Nexik проанализирует и настроится" },
                { step: "3", text: "Вставь код на сайт — готово" },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-medium text-cyan-400">
                    {item.step}
                  </div>
                  <span className="text-zinc-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 border-t border-white/5">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Готов запустить?</h2>
            <p className="text-zinc-500 mb-8">
              Бесплатно при заказе сайта. Или от 0 руб/мес отдельно.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="bg-cyan-500 text-black hover:bg-cyan-400 gap-2" asChild>
                <Link href="/nexik/start">
                  Начать бесплатно
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/10 hover:bg-white/5" asChild>
                <Link href="/#services">
                  Заказать сайт с Nexik
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
            <div className="flex items-center gap-2">
              <SiriOrb size={20} state="idle" />
              <span>Nexik by NetNext</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/nexik/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/" className="hover:text-white transition-colors">NetNext Studio</Link>
            </div>
          </div>
        </footer>
      </main>

      {/* Chat widget */}
      <Chat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        config={{
          title: "Nexik",
          subtitle: "AI-ассистент",
          welcomeMessage: "Привет! Это демонстрация виджета Nexik. Задайте любой вопрос — я покажу как работаю!",
          placeholder: "Напишите сообщение...",
          position: "bottom-right",
          mode: "modal"
        }}
      />

      {/* Floating orb button */}
      <div className="fixed bottom-6 right-6 z-40">
        <SiriOrb 
          size={64} 
          state="idle"
          onClick={() => setIsChatOpen(true)}
        />
      </div>
    </div>
  )
}
