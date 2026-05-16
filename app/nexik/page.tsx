"use client"
// Nexik Premium Landing v4
import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Send, Sparkles, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiriOrb } from "@/components/nexik/siri-orb"
import { Chat } from "@/components/chat"

// Demo responses
const AI_RESPONSES: Record<string, string> = {
  "привет": "Привет! Расскажи чем занимаешься — покажу как буду помогать.",
  "автосервис": "Отлично! Буду записывать на ТО, отвечать о ценах, сообщать статус ремонта. 24/7.",
  "салон": "Записываю к мастерам, показываю свободные окна, напоминаю о записи. Всё автоматически.",
  "ресторан": "Принимаю заказы, бронирую столы, показываю меню. Ни один заказ не потеряется.",
  "клиника": "Записываю на приём, отвечаю о врачах и услугах, напоминаю о визите.",
  "магазин": "Помогаю выбрать товар, отвечаю о наличии и доставке, принимаю заказы.",
  "default": "Расскажи подробнее — я быстро пойму как помочь твоим клиентам."
}

function getResponse(input: string): string {
  const lower = input.toLowerCase()
  if (lower.includes("привет")) return AI_RESPONSES["привет"]
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

// Animated gradient orb background
function GradientOrb() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {/* Main orb */}
      <motion.div
        className="w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,255,255,0.15) 0%, rgba(0,255,255,0.05) 40%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Secondary glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,255,255,0.2) 0%, transparent 60%)",
        }}
        animate={{
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}

// Floating chat demo
function FloatingChat() {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Floating chat card with glass effect */}
      <div 
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
          backdropFilter: "blur(40px)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px -20px rgba(0,0,0,0.5), 0 0 100px -50px rgba(0,255,255,0.3)",
        }}
      >
        {/* Glow border */}
        <div className="absolute inset-0 rounded-3xl" style={{
          background: "linear-gradient(135deg, rgba(0,255,255,0.1) 0%, transparent 50%, rgba(0,255,255,0.05) 100%)",
          padding: "1px",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
        }} />

        {/* Header */}
        <div className="relative flex items-center gap-4 p-5 border-b border-white/5">
          <div className="relative">
            <SiriOrb size={48} state={isTyping ? "thinking" : "idle"} />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">Nexik</h3>
            <p className="text-xs text-zinc-500">AI-ассистент для бизнеса</p>
          </div>
        </div>

        {/* Messages */}
        <div className="relative h-72 overflow-y-auto p-5 space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-black rounded-2xl rounded-br-md"
                      : "bg-white/5 text-white/90 rounded-2xl rounded-bl-md border border-white/5"
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
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-cyan-400"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick actions */}
          {messages.length === 1 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 pt-2"
            >
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => sendQuickAction(action)}
                  className="px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all duration-200"
                >
                  {action}
                </button>
              ))}
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="relative p-4 border-t border-white/5">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Напиши чем занимаешься..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all duration-200"
            />
            <button
              onClick={send}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black flex items-center justify-center hover:from-cyan-400 hover:to-cyan-300 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function NexikPage() {
  const [mounted, setMounted] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0">
        {/* Grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        <GradientOrb />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/nexik" className="flex items-center gap-3 group">
            <SiriOrb size={32} state="idle" />
            <span className="font-semibold text-lg tracking-tight">Nexik</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/nexik/login" 
              className="text-sm text-zinc-500 hover:text-white transition-colors duration-200"
            >
              Войти
            </Link>
            <Button 
              className="bg-white text-black hover:bg-zinc-200 h-9 px-4 text-sm font-medium" 
              asChild
            >
              <Link href="/nexik/start">Начать</Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16">
        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-zinc-400 tracking-wide uppercase">AI для бизнеса</span>
          </motion.div>
          
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              Попробуй
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-500 bg-clip-text text-transparent">
              прямо сейчас
            </span>
          </h1>
          
          <p className="text-zinc-500 text-lg max-w-md mx-auto leading-relaxed">
            Напиши чем занимаешься — Nexik покажет как будет работать на твоём сайте
          </p>
        </motion.div>

        {/* Chat Demo */}
        <FloatingChat />

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-zinc-600"
          >
            <span className="text-xs tracking-wider uppercase">Подробнее</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4"
          >
            {[
              { value: "2 мин", label: "на запуск" },
              { value: "24/7", label: "без выходных" },
              { value: "1 сек", label: "время ответа" },
              { value: "1 строка", label: "кода" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-zinc-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-32 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Что умеет Nexik</h2>
            <p className="text-zinc-500">Автоматизирует общение с клиентами</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Отвечает на вопросы мгновенно",
              "Записывает на услуги",
              "Принимает заказы",
              "Бронирует столики",
              "Рассказывает о ценах",
              "Собирает контакты",
              "Напоминает о записи",
              "Передаёт оператору если нужно",
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 hover:bg-cyan-500/5 transition-all duration-300"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <span className="text-zinc-300 text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Как запустить</h2>
            <p className="text-zinc-500">Три простых шага</p>
          </motion.div>

          <div className="space-y-6">
            {[
              { num: "01", title: "Расскажи о бизнесе", desc: "В чате или укажи сайт — Nexik проанализирует" },
              { num: "02", title: "Настрой под себя", desc: "Цвета, стиль общения, расписание работы" },
              { num: "03", title: "Вставь код", desc: "Одна строка на сайт — и Nexik работает" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <span className="text-4xl font-bold text-cyan-500/20">{step.num}</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">{step.title}</h3>
                  <p className="text-zinc-500 text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-6 border-t border-white/5">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Готов запустить?
            </h2>
            <p className="text-zinc-500 mb-10">
              Бесплатно при заказе сайта в NetNext
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-black hover:from-cyan-400 hover:to-cyan-300 h-14 px-8 text-base font-medium shadow-lg shadow-cyan-500/20"
                asChild
              >
                <Link href="/nexik/start">
                  Начать бесплатно
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/10 hover:bg-white/5 h-14 px-8 text-base"
                asChild
              >
                <Link href="/#services">Заказать сайт с Nexik</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-6 border-t border-white/5">
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

      {/* Chat widget */}
      <Chat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        config={{
          title: "Nexik",
          subtitle: "AI-ассистент",
          welcomeMessage: "Привет! Задайте любой вопрос.",
          placeholder: "Напишите сообщение...",
          position: "bottom-right",
          mode: "modal"
        }}
      />

      {/* Floating orb */}
      <motion.div 
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="fixed bottom-6 right-6 z-40"
      >
        <SiriOrb 
          size={64} 
          state="idle"
          onClick={() => setIsChatOpen(true)}
        />
      </motion.div>
    </div>
  )
}
