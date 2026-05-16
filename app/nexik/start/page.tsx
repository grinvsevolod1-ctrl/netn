"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Send, ArrowRight, Check, Loader2, Globe, Copy, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { SiriOrb } from "@/components/nexik/siri-orb"

type Step = "chat" | "website" | "done"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const businessResponses: Record<string, string> = {
  автосервис: "Автосервис - отлично! Я буду отвечать на вопросы о ценах на ТО, записывать на диагностику, сообщать статус ремонта.",
  салон: "Салон красоты - моя тема! Запись к мастерам, цены на услуги, свободные окна - всё за секунды.",
  ресторан: "Ресторан - понял! Бронирование столов, меню, время работы, доставка - отвечу мгновенно.",
  клиника: "Медицинская клиника - серьезная тема! Запись к врачам, расписание, подготовка к анализам.",
  магазин: "Интернет-магазин - супер! Наличие товаров, статус заказа, доставка, возвраты.",
  фитнес: "Фитнес-клуб - знаю! Расписание тренировок, цены, свободные слоты у тренеров.",
  default: "Интересная ниша! Я быстро изучу специфику и буду отвечать клиентам профессионально."
}

function getResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const [key, response] of Object.entries(businessResponses)) {
    if (key !== "default" && lower.includes(key)) {
      return response
    }
  }
  return businessResponses.default
}

export default function NexikStartPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("chat")
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Привет! Расскажи о своем бизнесе в одном предложении." }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [widgetId, setWidgetId] = useState("")
  const [copied, setCopied] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // Focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [step])

  const sendMessage = useCallback(() => {
    if (!input.trim() || isTyping) return

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const response = getResponse(userMsg.content)
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: "assistant", 
        content: response + "\n\nУ тебя есть сайт?" 
      }])
      setIsTyping(false)
      setStep("website")
    }, 800)
  }, [input, isTyping])

  const handleWebsiteSubmit = useCallback(async () => {
    if (!websiteUrl.trim()) {
      // No website - generate widget directly
      const id = `nxk_${Math.random().toString(36).slice(2, 10)}`
      setWidgetId(id)
      setStep("done")
      return
    }

    setIsAnalyzing(true)
    
    // Simulate analysis
    await new Promise(r => setTimeout(r, 2000))
    
    const id = `nxk_${Math.random().toString(36).slice(2, 10)}`
    setWidgetId(id)
    setIsAnalyzing(false)
    setStep("done")
  }, [websiteUrl])

  const skipWebsite = useCallback(() => {
    const id = `nxk_${Math.random().toString(36).slice(2, 10)}`
    setWidgetId(id)
    setStep("done")
  }, [])

  const copyCode = useCallback(() => {
    const code = `<script src="https://nexik.io/widget.js" data-id="${widgetId}"></script>`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [widgetId])

  return (
    <div className="min-h-screen bg-[#030305] text-white flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/nexik" className="flex items-center gap-3">
            <SiriOrb size={32} color="#00ffff" state="idle" />
            <span className="font-semibold">Nexik</span>
          </Link>
          <Link href="/nexik/login" className="text-sm text-zinc-500 hover:text-white transition-colors">
            Войти
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Chat Step */}
          {step === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col"
            >
              {/* Messages */}
              <div ref={chatRef} className="flex-1 space-y-4 mb-6 overflow-y-auto">
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mr-3 flex-shrink-0">
                        <Zap className="w-4 h-4 text-black" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-line",
                      msg.role === "user"
                        ? "bg-cyan-500 text-black rounded-br-sm"
                        : "bg-white/5 border border-white/10 rounded-bl-sm"
                    )}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-black" />
                    </div>
                    <div className="flex gap-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Например: у меня автосервис..."
                  className="w-full px-5 py-4 pr-14 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-cyan-500 text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-400 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Website Step */}
          {step === "website" && (
            <motion.div
              key="website"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-black" />
              </div>

              <h2 className="text-2xl font-bold mb-2">Есть сайт?</h2>
              <p className="text-zinc-400 mb-8 max-w-sm">
                Я проанализирую его и сразу пойму специфику твоего бизнеса
              </p>

              <div className="w-full max-w-md space-y-4">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleWebsiteSubmit()}
                    placeholder="https://example.com"
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>

                <button
                  onClick={handleWebsiteSubmit}
                  disabled={isAnalyzing}
                  className="w-full py-4 bg-white text-black font-medium rounded-2xl hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Анализирую...
                    </>
                  ) : (
                    <>
                      Продолжить
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <button
                  onClick={skipWebsite}
                  className="w-full py-3 text-zinc-400 hover:text-white transition-colors text-sm"
                >
                  Пропустить, нет сайта
                </button>
              </div>
            </motion.div>
          )}

          {/* Done Step */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mb-6"
              >
                <Check className="w-10 h-10 text-black" />
              </motion.div>

              <h2 className="text-2xl font-bold mb-2">Готово!</h2>
              <p className="text-zinc-400 mb-8">
                Вставь этот код на сайт перед {"</body>"}
              </p>

              <div className="w-full max-w-md">
                <div className="relative bg-[#0a0a0f] border border-white/10 rounded-2xl p-4 mb-4">
                  <code className="text-sm text-cyan-400 break-all">
                    {`<script src="https://nexik.io/widget.js" data-id="${widgetId}"></script>`}
                  </code>
                  <button
                    onClick={copyCode}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => router.push("/nexik/dashboard")}
                  className="w-full py-4 bg-white text-black font-medium rounded-2xl hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2"
                >
                  Открыть Dashboard
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating orb */}
      <div className="fixed bottom-6 right-6 z-50">
        <SiriOrb size={56} color="#00ffff" state={isTyping || isAnalyzing ? "thinking" : "idle"} />
      </div>
    </div>
  )
}
