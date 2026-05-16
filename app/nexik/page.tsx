"use client"
// Nexik Ultra-Premium Landing v5
import { useState, useEffect, useCallback, useRef, MouseEvent as ReactMouseEvent } from "react"
import Link from "next/link"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ArrowRight, Send, Sparkles, Check, ChevronDown, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiriOrb } from "@/components/nexik/siri-orb"

// Demo responses
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

// Animated dot grid background
function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotGrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.07)" />
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

// Cursor-following glow
function CursorGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      setVisible(true)
    }
    const handleLeave = () => setVisible(false)
    
    window.addEventListener("mousemove", handleMove)
    document.body.addEventListener("mouseleave", handleLeave)
    return () => {
      window.removeEventListener("mousemove", handleMove)
      document.body.removeEventListener("mouseleave", handleLeave)
    }
  }, [])

  return (
    <motion.div
      className="pointer-events-none fixed z-0"
      animate={{ 
        x: pos.x - 200, 
        y: pos.y - 200,
        opacity: visible ? 1 : 0 
      }}
      transition={{ type: "spring", damping: 30, stiffness: 200 }}
    >
      <div 
        className="w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,255,255,0.08) 0%, transparent 70%)",
        }}
      />
    </motion.div>
  )
}

// Ambient animated orbs
function AmbientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main cyan orb */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,255,255,0.12) 0%, rgba(0,255,255,0.03) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          x: ["-50%", "-48%", "-52%", "-50%"],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Secondary pink/purple orb */}
      <motion.div
        className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      {/* Accent blue orb */}
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1.1, 1, 1.1],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
    </div>
  )
}

// 3D Perspective Chat Card
function FloatingChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Привет! Чем занимаешься?" }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  
  // 3D tilt effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

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
    }, 800)
  }, [input, isTyping])

  const quickActions = [
    { label: "Автосервис", icon: "🚗" },
    { label: "Салон", icon: "💅" },
    { label: "Ресторан", icon: "🍽️" },
    { label: "Клиника", icon: "🏥" },
    { label: "Магазин", icon: "🛍️" },
  ]

  const sendQuickAction = useCallback((action: string) => {
    if (isTyping) return
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: `У меня ${action.toLowerCase()}` }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    setTimeout(() => {
      const response = getResponse(userMsg.content)
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: response }])
      setIsTyping(false)
    }, 800)
  }, [isTyping])

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto perspective-1000"
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative"
      >
        {/* Glow layer behind card */}
        <div 
          className="absolute -inset-4 rounded-[40px] opacity-50"
          style={{
            background: "radial-gradient(ellipse at center, rgba(0,255,255,0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
            transform: "translateZ(-50px)",
          }}
        />
        
        {/* Main card */}
        <div 
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(40px)",
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.1),
              0 0 0 1px inset rgba(255,255,255,0.05),
              0 50px 100px -30px rgba(0,0,0,0.6),
              0 0 80px -20px rgba(0,255,255,0.2)
            `,
            transform: "translateZ(0)",
          }}
        >
          {/* Shine effect */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)",
            }}
          />

          {/* Header */}
          <div className="relative flex items-center gap-4 p-6 border-b border-white/5">
            <div className="relative">
              <SiriOrb size={52} state={isTyping ? "thinking" : "idle"} />
              <motion.div 
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-white text-xl tracking-tight">Nexik</h3>
              <p className="text-sm text-zinc-500">Онлайн</p>
            </div>
            <div className="ml-auto flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-white/20" />
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="relative h-80 overflow-y-auto p-6 space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-5 py-3 text-[15px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-cyan-400 to-cyan-500 text-black font-medium rounded-2xl rounded-br-sm shadow-lg shadow-cyan-500/20"
                        : "bg-white/[0.08] text-white/95 rounded-2xl rounded-bl-sm border border-white/10"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/[0.08] border border-white/10 rounded-2xl rounded-bl-sm px-5 py-4">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full bg-cyan-400"
                        animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick actions */}
            {messages.length === 1 && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-wrap gap-2 pt-4"
              >
                {quickActions.map((action, i) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
                    onClick={() => sendQuickAction(action.label)}
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-300 transition-all duration-300"
                  >
                    <span className="text-base">{action.icon}</span>
                    <span className="text-sm font-medium">{action.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="relative p-5 border-t border-white/5">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Напиши чем занимаешься..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-[15px] placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] focus:shadow-[0_0_30px_-5px_rgba(0,255,255,0.2)] transition-all duration-300"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={send}
                disabled={!input.trim() || isTyping}
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-500 text-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Animated counter
function Counter({ value, suffix = "" }: { value: string; suffix?: string }) {
  return (
    <span className="tabular-nums">
      {value}{suffix}
    </span>
  )
}

export default function NexikPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden">
      {/* Background layers */}
      <div className="fixed inset-0">
        <DotGrid />
        <AmbientOrbs />
        <CursorGlow />
      </div>

      {/* Noise overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div 
          className="mx-6 mt-4 rounded-2xl"
          style={{
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/nexik" className="flex items-center gap-3 group">
              <SiriOrb size={28} state="idle" />
              <span className="font-semibold text-lg tracking-tight">Nexik</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <Link 
                href="/nexik/login" 
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200"
              >
                Войти
              </Link>
              <Button 
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white h-9 px-5 text-sm font-medium backdrop-blur-sm" 
                asChild
              >
                <Link href="/nexik/start">
                  Начать
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </motion.div>
            <span className="text-sm text-zinc-400">AI-ассистент нового поколения</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-6"
        >
          <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter leading-none">
            <span className="block bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
              Общение
            </span>
            <span className="block mt-2 bg-gradient-to-r from-cyan-300 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              без ожидания
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg sm:text-xl text-zinc-500 max-w-lg text-center mb-12 leading-relaxed"
        >
          Клиенты получают ответы мгновенно.
          <br className="hidden sm:block" />
          <span className="text-zinc-400">Попробуй прямо сейчас.</span>
        </motion.p>

        {/* Chat Demo */}
        <FloatingChat />

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-3 text-zinc-600"
          >
            <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative py-40 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-12"
          >
            {[
              { value: "2", suffix: " мин", label: "на запуск" },
              { value: "24", suffix: "/7", label: "без выходных" },
              { value: "<1", suffix: " сек", label: "время ответа" },
              { value: "1", suffix: " строка", label: "кода" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <div className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-white to-zinc-600 bg-clip-text text-transparent mb-3">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-zinc-600 tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-40 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                Что умеет
              </span>
            </h2>
            <p className="text-xl text-zinc-600">Автоматизирует рутину</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: "⚡", title: "Мгновенные ответы", desc: "Клиенты не ждут ни секунды" },
              { icon: "📅", title: "Запись на услуги", desc: "Автоматическое бронирование" },
              { icon: "🛒", title: "Приём заказов", desc: "Ни один заказ не потеряется" },
              { icon: "💬", title: "Сбор контактов", desc: "Лиды прямо в CRM" },
              { icon: "🔔", title: "Напоминания", desc: "Клиенты не забывают о визите" },
              { icon: "👤", title: "Передача оператору", desc: "Когда нужен человек" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-cyan-500/20 transition-all duration-500"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-start gap-4">
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-zinc-500">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-40 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                Готов начать?
              </span>
            </h2>
            <p className="text-xl text-zinc-500 mb-12">
              Бесплатно при заказе сайта в NetNext
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-black hover:from-cyan-300 hover:to-cyan-400 h-14 px-10 text-base font-semibold shadow-xl shadow-cyan-500/25"
                  asChild
                >
                  <Link href="/nexik/start">
                    <Zap className="w-5 h-5 mr-2" />
                    Запустить Nexik
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/10 bg-white/5 hover:bg-white/10 h-14 px-10 text-base"
                  asChild
                >
                  <Link href="/">
                    NetNext Studio
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <SiriOrb size={24} state="idle" />
            <span className="text-sm text-zinc-500">Nexik by NetNext</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-zinc-600">
            <Link href="/" className="hover:text-white transition-colors">NetNext</Link>
            <Link href="/nexik/login" className="hover:text-white transition-colors">Войти</Link>
            <Link href="/nexik/start" className="hover:text-white transition-colors">Начать</Link>
          </div>
        </div>
      </footer>

      {/* Floating orb button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <SiriOrb 
          size={64} 
          state="idle"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
      </motion.div>
    </div>
  )
}
