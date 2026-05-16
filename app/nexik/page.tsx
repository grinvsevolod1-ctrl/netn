"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiriOrb } from "@/components/nexik/siri-orb"

const AI_RESPONSES: Record<string, string> = {
  "автосервис": "Записываю на ТО, отвечаю о ценах, сообщаю статус ремонта и вызываю эвакуатор. 24/7 без выходных.",
  "салон": "Записываю к мастерам, показываю свободные окна, напоминаю о визите. Всё автоматически.",
  "ресторан": "Принимаю заказы, бронирую столы, показываю меню. Ни один заказ не потеряется.",
  "клиника": "Записываю на приём, отвечаю о врачах и услугах, напоминаю о визите.",
  "магазин": "Помогаю выбрать товар, отвечаю о наличии и доставке, принимаю заказы.",
  "default": "Отвечаю клиентам мгновенно, записываю на услуги, собираю контакты. 24/7."
}

function getResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes("авто") || lower.includes("сто")) return AI_RESPONSES["автосервис"]
  if (lower.includes("салон") || lower.includes("красот")) return AI_RESPONSES["салон"]
  if (lower.includes("ресторан") || lower.includes("кафе")) return AI_RESPONSES["ресторан"]
  if (lower.includes("клиник") || lower.includes("врач")) return AI_RESPONSES["клиника"]
  if (lower.includes("магазин") || lower.includes("товар")) return AI_RESPONSES["магазин"]
  return AI_RESPONSES["default"]
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.05)" />
          </pattern>
          <radialGradient id="gridFade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="gridMask">
            <rect width="100%" height="100%" fill="url(#gridFade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" mask="url(#gridMask)" />
      </svg>
    </div>
  )
}

function ChatDemo({ visible }: { visible: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Привет! Чем занимаешься?" }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = useCallback(() => {
    if (!input.trim() || isTyping) return
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const response = getResponse(userMsg.content)
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: response }])
      setIsTyping(false)
    }, 600)
  }, [input, isTyping])

  const quickActions = ["Автосервис", "Салон", "Ресторан", "Клиника", "Магазин"]

  const sendQuickAction = useCallback((action: string) => {
    if (isTyping) return
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: `У меня ${action.toLowerCase()}` }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    setTimeout(() => {
      const response = getResponse(userMsg.content)
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: response }])
      setIsTyping(false)
    }, 600)
  }, [isTyping])

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg mx-auto"
    >
      <div 
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 40px 80px -20px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 p-5 border-b border-white/5">
          <div className="relative">
            <SiriOrb size={48} state={isTyping ? "thinking" : "idle"} />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">Nexik</h3>
            <p className="text-sm text-zinc-500">Онлайн</p>
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-5 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 text-[15px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-cyan-400 to-cyan-500 text-black font-medium rounded-2xl rounded-br-sm"
                      : "bg-white/[0.08] text-white/90 rounded-2xl rounded-bl-sm border border-white/10"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/[0.08] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-cyan-400"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {messages.length === 1 && !isTyping && (
            <div className="flex flex-wrap gap-2 pt-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => sendQuickAction(action)}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-400 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-300 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Напиши чем занимаешься..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-[15px] placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            <button
              onClick={send}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-500 text-black flex items-center justify-center disabled:opacity-40"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* CTA below chat */}
      <div className="mt-8 text-center">
        <Button 
          className="bg-white text-black hover:bg-zinc-200 h-12 px-8 text-base font-medium" 
          asChild
        >
          <Link href="/nexik/start">
            Запустить Nexik
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
        <p className="mt-4 text-sm text-zinc-600">Бесплатно. Без карты. 2 минуты на настройку.</p>
      </div>
    </motion.div>
  )
}

export default function NexikPage() {
  const [phase, setPhase] = useState<"title" | "chat">("title")
  const [headerTitle, setHeaderTitle] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("chat")
      setHeaderTitle(true)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0">
        <DotGrid />
        <div 
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(0,255,255,0.08) 0%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 sm:mx-6 mt-4 flex items-center justify-between gap-4">
          {/* Left pill - Logo & Title */}
          <div 
            className="rounded-full px-3 py-2 flex items-center gap-3"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Link href="/nexik" className="flex items-center gap-3">
              <SiriOrb size={28} state="idle" />
              <span className="font-semibold text-lg">Nexik</span>
            </Link>
            <AnimatePresence>
              {headerTitle && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  transition={{ duration: 0.4 }}
                  className="hidden sm:flex flex-col leading-tight border-l border-white/10 pl-3 ml-1"
                >
                  <span className="text-xs text-zinc-400">Общение</span>
                  <span className="text-xs text-zinc-500">без ожидания</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Right pill - Actions */}
          <div 
            className="rounded-full px-2 py-2 flex items-center gap-1"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Link 
              href="/nexik/login" 
              className="px-4 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              Войти
            </Link>
            <Button 
              className="bg-white text-black hover:bg-zinc-200 h-8 px-4 text-sm font-medium rounded-full" 
              asChild
            >
              <Link href="/nexik/start">
                Начать
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-12">
        {/* Animated title -> chat transition */}
        <AnimatePresence mode="wait">
          {phase === "title" && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter leading-none">
                <span className="block bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                  Общение
                </span>
                <span className="block mt-2 bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">
                  без ожидания
                </span>
              </h1>
            </motion.div>
          )}

          {phase === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <ChatDemo visible={true} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating orb button */}
      <div className="fixed bottom-6 right-6 z-40">
        <SiriOrb size={64} state="idle" onClick={() => {}} />
      </div>
    </div>
  )
}
