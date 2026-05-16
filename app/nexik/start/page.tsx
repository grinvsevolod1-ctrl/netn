"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Brain, 
  ArrowRight, 
  ArrowLeft,
  Send,
  Check,
  Loader2,
  Copy,
  Sparkles,
  Clock,
  Building2,
  MessageSquare,
  User,
  Mail,
  Phone,
  Globe
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type Step = "business" | "schedule" | "contact" | "done"

interface FormData {
  businessDescription: string
  businessName: string
  schedule: {
    aiOnly: boolean
    workHours?: { start: string; end: string }
    workDays?: string[]
  }
  contact: {
    name: string
    email: string
    phone: string
    website: string
  }
}

// Chat message component
function ChatMessage({ 
  role, 
  children, 
  typing = false 
}: { 
  role: "nexik" | "user" | "system"
  children: React.ReactNode
  typing?: boolean
}) {
  const [showContent, setShowContent] = useState(!typing)
  
  useEffect(() => {
    if (typing) {
      const timer = setTimeout(() => setShowContent(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [typing])

  if (role === "system") {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-sm">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      {role === "nexik" && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ffff] to-[#ff00aa] flex items-center justify-center mr-3 flex-shrink-0">
          <Brain className="w-4 h-4 text-black" />
        </div>
      )}
      <div className={cn(
        "max-w-[80%] rounded-2xl px-5 py-4 text-sm",
        role === "user" 
          ? "bg-[#00ffff] text-black rounded-br-md" 
          : "bg-[#1a1a2e] text-white rounded-bl-md"
      )}>
        {!showContent ? (
          <div className="flex gap-1.5 py-1">
            <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <div className="whitespace-pre-line leading-relaxed">{children}</div>
        )}
      </div>
    </div>
  )
}

export default function NexikStartPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("business")
  const [formData, setFormData] = useState<FormData>({
    businessDescription: "",
    businessName: "",
    schedule: { aiOnly: true },
    contact: { name: "", email: "", phone: "", website: "" }
  })
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [widgetId, setWidgetId] = useState("")
  const [copied, setCopied] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  // Auto scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [step, isProcessing])

  // AI analysis result
  const [aiAnalysis, setAiAnalysis] = useState<{
    businessName: string
    businessType: string
    systemPrompt: string
    welcomeMessage: string
    quickReplies: string[]
  } | null>(null)

  // Handle business description submit
  const handleBusinessSubmit = async () => {
    if (!input.trim()) return
    setFormData(prev => ({ ...prev, businessDescription: input }))
    setInput("")
    setIsProcessing(true)
    
    try {
      const res = await fetch('/api/nexik/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_business',
          data: { description: input }
        })
      })
      
      const data = await res.json()
      
      if (data.success && data.analysis) {
        setAiAnalysis(data.analysis)
        setFormData(prev => ({ ...prev, businessName: data.analysis.businessName }))
      } else {
        // Fallback
        setFormData(prev => ({ ...prev, businessName: input.slice(0, 30) }))
      }
    } catch (error) {
      console.error('[Onboarding] Analysis failed:', error)
      setFormData(prev => ({ ...prev, businessName: input.slice(0, 30) }))
    }
    
    setIsProcessing(false)
    setStep("schedule")
  }

  // Handle schedule selection
  const handleScheduleSelect = (aiOnly: boolean, hours?: { start: string; end: string }) => {
    setFormData(prev => ({
      ...prev,
      schedule: { aiOnly, workHours: hours }
    }))
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setStep("contact")
    }, 1000)
  }

  // Handle contact submit
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.contact.email) return
    
    setIsProcessing(true)
    
    try {
      const res = await fetch('/api/nexik/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_widget',
          data: {
            businessDescription: formData.businessDescription,
            businessName: formData.businessName,
            systemPrompt: aiAnalysis?.systemPrompt || `Ты AI-ассистент. ${formData.businessDescription}`,
            welcomeMessage: aiAnalysis?.welcomeMessage || 'Здравствуйте! Чем могу помочь?',
            quickReplies: aiAnalysis?.quickReplies || ['Расскажите подробнее', 'Какие цены?'],
            schedule: formData.schedule,
            contact: formData.contact
          }
        })
      })
      
      const data = await res.json()
      
      if (data.success && data.widget) {
        setWidgetId(data.widget.id)
        // Save org_id for dashboard access
        const orgId = data.widget.org_id || data.widget.id
        localStorage.setItem('nexik_org_id', orgId)
        localStorage.setItem('nexik_widget_id', data.widget.id)
        document.cookie = `nexik_org_id=${orgId}; path=/; max-age=31536000`
      } else {
        // Fallback - generate local ID for demo
        const fallbackId = `nxk_${Math.random().toString(36).substring(2, 10)}`
        setWidgetId(fallbackId)
        localStorage.setItem('nexik_org_id', fallbackId)
        localStorage.setItem('nexik_widget_id', fallbackId)
        document.cookie = `nexik_org_id=${fallbackId}; path=/; max-age=31536000`
      }
    } catch (error) {
      console.error('[Onboarding] Widget creation failed:', error)
      // Fallback
      setWidgetId(`nxk_${Math.random().toString(36).substring(2, 10)}`)
    }
    
    setIsProcessing(false)
    setStep("done")
  }

  // Copy widget code
  const copyCode = () => {
    const code = `<script src="https://netnext.site/nexik/widget.js" data-id="${widgetId}"></script>`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#030305] text-white">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00ffff]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#ff00aa]/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030305]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/nexik" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00ffff] to-[#ff00aa] flex items-center justify-center">
                <Brain className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-lg">Nexik</span>
            </Link>
            
            {step !== "done" && (
              <div className="flex items-center gap-2">
                {["business", "schedule", "contact"].map((s, i) => (
                  <div key={s} className="flex items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                      step === s ? "bg-[#00ffff] text-black" :
                      ["business", "schedule", "contact"].indexOf(step) > i ? "bg-[#00ff88] text-black" :
                      "bg-[#1a1a2e] text-[#888]"
                    )}>
                      {["business", "schedule", "contact"].indexOf(step) > i ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    {i < 2 && <div className="w-8 h-px bg-[#1a1a2e] mx-1" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-12 min-h-screen flex items-center">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          
          {/* Chat container */}
          <div className="rounded-2xl border border-[#1a1a2e] bg-[#0a0a0f]/90 backdrop-blur-xl overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#1a1a2e] bg-[#0d0d14]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ffff] to-[#ff00aa] flex items-center justify-center">
                <Brain className="w-5 h-5 text-black" />
              </div>
              <div>
                <h4 className="font-semibold">Настройка Nexik</h4>
                <p className="text-xs text-[#888]">
                  {step === "business" && "Шаг 1: Расскажи о бизнесе"}
                  {step === "schedule" && "Шаг 2: Настрой расписание"}
                  {step === "contact" && "Шаг 3: Контактные данные"}
                  {step === "done" && "Готово!"}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                <span className="text-xs text-[#888]">онлайн</span>
              </div>
            </div>

            {/* Chat messages */}
            <div ref={chatRef} className="h-[500px] overflow-y-auto p-6 space-y-4">
              
              {/* Step 1: Business */}
              <ChatMessage role="nexik">
                Привет! Я Nexik — твой AI бизнес-директор.{"\n\n"}
                Расскажи, какой у тебя бизнес? Чем занимаешься, что продаёшь или какие услуги оказываешь?{"\n\n"}
                <span className="text-[#888] text-xs">Чем подробнее опишешь — тем лучше я смогу помогать клиентам.</span>
              </ChatMessage>

              {formData.businessDescription && (
                <>
                  <ChatMessage role="user">{formData.businessDescription}</ChatMessage>
                  
                  {step !== "business" && (
                    <ChatMessage role="nexik" typing={isProcessing && step === "schedule"}>
                      Отлично! Я изучил твой бизнес: <span className="text-[#00ffff]">{formData.businessName}</span>{"\n\n"}
                      {aiAnalysis ? (
                        <>
                          Теперь я понимаю:{"\n"}
                          • Тип бизнеса: {aiAnalysis.businessType}{"\n"}
                          • Буду приветствовать: {`"${aiAnalysis.welcomeMessage}"`}{"\n"}
                          • Подготовил быстрые ответы на типичные вопросы{"\n\n"}
                        </>
                      ) : (
                        <>
                          Теперь я знаю:{"\n"}
                          • Чем ты занимаешься{"\n"}
                          • Какие вопросы могут задавать клиенты{"\n"}
                          • Как правильно на них отвечать{"\n\n"}
                        </>
                      )}
                      Теперь давай настроим расписание — когда отвечаю я, а когда ты?
                    </ChatMessage>
                  )}
                </>
              )}

              {/* Step 2: Schedule */}
              {step === "schedule" && !isProcessing && (
                <div className="space-y-3 pl-11">
                  <button
                    onClick={() => handleScheduleSelect(true)}
                    className="w-full p-4 rounded-xl border border-[#1a1a2e] bg-[#0d0d14] hover:border-[#00ffff]/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-[#00ffff]/10 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-[#00ffff]" />
                      </div>
                      <div>
                        <p className="font-medium">Nexik отвечает всегда</p>
                        <p className="text-xs text-[#888]">AI работает 24/7, уведомляет тебя о важном</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#888] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>

                  <button
                    onClick={() => handleScheduleSelect(false, { start: "09:00", end: "18:00" })}
                    className="w-full p-4 rounded-xl border border-[#1a1a2e] bg-[#0d0d14] hover:border-[#ff00aa]/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-[#ff00aa]/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#ff00aa]" />
                      </div>
                      <div>
                        <p className="font-medium">Совместная работа</p>
                        <p className="text-xs text-[#888]">Ты отвечаешь в рабочее время, AI — в остальное</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#888] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                </div>
              )}

              {/* Schedule selected */}
              {formData.schedule.aiOnly !== undefined && step !== "business" && step !== "schedule" && (
                <>
                  <ChatMessage role="user">
                    {formData.schedule.aiOnly 
                      ? "Nexik отвечает всегда, 24/7" 
                      : "Совместная работа — я в рабочее время, Nexik в остальное"}
                  </ChatMessage>
                  
                  {step !== "schedule" && (
                    <ChatMessage role="nexik" typing={isProcessing && step === "contact"}>
                      Отлично! {formData.schedule.aiOnly 
                        ? "Буду работать 24/7 и уведомлять тебя о важных диалогах." 
                        : "Буду подключаться когда ты офлайн и мгновенно передавать диалог когда ты онлайн."}{"\n\n"}
                      Последний шаг — оставь контакты, чтобы я мог отправлять тебе уведомления и отчёты.
                    </ChatMessage>
                  )}
                </>
              )}

              {/* Step 3: Contact */}
              {step === "contact" && !isProcessing && (
                <div className="pl-11">
                  <form onSubmit={handleContactSubmit} className="space-y-4 p-4 rounded-xl border border-[#1a1a2e] bg-[#0d0d14]">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-[#888] mb-1.5 block">Имя</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                          <input
                            type="text"
                            value={formData.contact.name}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              contact: { ...prev.contact, name: e.target.value }
                            }))}
                            placeholder="Как тебя зовут"
                            className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-[#555] focus:outline-none focus:border-[#00ffff]/50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-[#888] mb-1.5 block">Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                          <input
                            type="email"
                            required
                            value={formData.contact.email}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              contact: { ...prev.contact, email: e.target.value }
                            }))}
                            placeholder="email@example.com"
                            className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-[#555] focus:outline-none focus:border-[#00ffff]/50"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-[#888] mb-1.5 block">Телефон</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                          <input
                            type="tel"
                            value={formData.contact.phone}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              contact: { ...prev.contact, phone: e.target.value }
                            }))}
                            placeholder="+7 (___) ___-__-__"
                            className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-[#555] focus:outline-none focus:border-[#00ffff]/50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-[#888] mb-1.5 block">Сайт</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
                          <input
                            type="url"
                            value={formData.contact.website}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              contact: { ...prev.contact, website: e.target.value }
                            }))}
                            placeholder="https://example.com"
                            className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-[#555] focus:outline-none focus:border-[#00ffff]/50"
                          />
                        </div>
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-[#00ffff] text-black hover:bg-[#00ffff]/90">
                      Создать Nexik
                      <Sparkles className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </div>
              )}

              {/* Step 4: Done */}
              {step === "done" && (
                <>
                  <ChatMessage role="system">
                    <Check className="w-4 h-4 inline mr-2" />
                    Nexik создан и готов к работе!
                  </ChatMessage>

                  <ChatMessage role="nexik">
                    Поздравляю! Твой AI бизнес-директор готов.{"\n\n"}
                    <span className="text-[#00ffff]">ID виджета: {widgetId}</span>{"\n\n"}
                    Добавь этот код на свой сайт перед закрывающим тегом {"</body>"}:
                  </ChatMessage>

                  <div className="pl-11">
                    <div className="rounded-xl border border-[#1a1a2e] bg-[#0d0d14] overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1a1a2e] bg-[#0a0a0f]">
                        <span className="text-xs text-[#888] font-mono">HTML</span>
                        <button 
                          onClick={copyCode}
                          className="flex items-center gap-1.5 text-xs text-[#00ffff] hover:text-[#00ffff]/80 transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Скопировано
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Копировать
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 overflow-x-auto">
                        <code className="text-sm font-mono">
                          <span className="text-[#ff00aa]">{"<script "}</span>
                          <span className="text-[#ffaa00]">src</span>
                          <span className="text-white">=</span>
                          <span className="text-[#00ff88]">{'"https://netnext.site/nexik/widget.js"'}</span>
                          {"\n        "}
                          <span className="text-[#ffaa00]">data-id</span>
                          <span className="text-white">=</span>
                          <span className="text-[#00ff88]">{`"${widgetId}"`}</span>
                          <span className="text-[#ff00aa]">{"></script>"}</span>
                        </code>
                      </pre>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Link href="/nexik/dashboard" className="flex-1">
                        <Button className="w-full bg-[#00ffff] text-black hover:bg-[#00ffff]/90">
                          Открыть Dashboard
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                      <Link href="/nexik/demo">
                        <Button variant="outline" className="border-[#1a1a2e] bg-transparent hover:bg-[#1a1a2e]">
                          Тест виджета
                        </Button>
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {/* Loading indicator */}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ffff] to-[#ff00aa] flex items-center justify-center">
                      <Brain className="w-4 h-4 text-black" />
                    </div>
                    <div className="bg-[#1a1a2e] rounded-2xl rounded-bl-md px-5 py-4">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            {step === "business" && (
              <div className="p-4 border-t border-[#1a1a2e] bg-[#0d0d14]">
                <div className="flex gap-3">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleBusinessSubmit()
                      }
                    }}
                    placeholder="Опиши свой бизнес... Например: У меня автосервис в Минске, ремонтируем все марки авто, специализируемся на немецких машинах..."
                    rows={3}
                    className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm placeholder:text-[#555] focus:outline-none focus:border-[#00ffff]/50 resize-none"
                  />
                  <Button
                    onClick={handleBusinessSubmit}
                    disabled={!input.trim() || isProcessing}
                    className="self-end bg-[#00ffff] text-black hover:bg-[#00ffff]/90 h-12 w-12 p-0"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-[#555] mt-2">
                  Нажми Enter для отправки или Shift+Enter для новой строки
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
