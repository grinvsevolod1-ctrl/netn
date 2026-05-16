"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Brain, 
  ArrowRight, 
  Send,
  Check,
  Loader2,
  Copy,
  Sparkles,
  Globe,
  Eye,
  EyeOff,
  Mic,
  MessageSquare,
  ExternalLink,
  HelpCircle,
  ChevronRight,
  Settings,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Steps in onboarding
type OnboardingStep = 
  | "register"           // Email + password
  | "business"           // Tell about business
  | "website"            // Do you have a website?
  | "analyzing"          // Analyzing website
  | "review"             // Review what Nexik learned
  | "integration"        // Integration method selection
  | "integration_help"   // Help with integration
  | "done"               // All done!

interface WebsiteAnalysis {
  platform: string | null
  platformConfidence: number
  businessName: string
  description: string
  services: string[]
  contacts: {
    phone?: string
    email?: string
    address?: string
  }
  workingHours?: string
  socialLinks: string[]
}

// Chat bubble component
function ChatBubble({ 
  role, 
  children, 
  typing = false,
  actions
}: { 
  role: "nexik" | "user" 
  children: React.ReactNode
  typing?: boolean
  actions?: React.ReactNode
}) {
  const [showContent, setShowContent] = useState(!typing)
  
  useEffect(() => {
    if (typing) {
      const timer = setTimeout(() => setShowContent(true), 600)
      return () => clearTimeout(timer)
    }
  }, [typing])

  return (
    <div className={cn("flex gap-3", role === "user" ? "justify-end" : "justify-start")}>
      {role === "nexik" && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00ffff] to-[#00cc99] flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-black" />
        </div>
      )}
      <div className="flex flex-col gap-2 max-w-[85%]">
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm",
          role === "user" 
            ? "bg-[#00ffff] text-black rounded-br-sm" 
            : "bg-[#1a1a2e] text-white rounded-bl-sm"
        )}>
          {!showContent ? (
            <div className="flex gap-1 py-1">
              <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <div className="whitespace-pre-line leading-relaxed">{children}</div>
          )}
        </div>
        {showContent && actions && (
          <div className="flex flex-wrap gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// Quick action button
function QuickAction({ 
  children, 
  onClick, 
  icon: Icon,
  variant = "default"
}: { 
  children: React.ReactNode
  onClick: () => void
  icon?: React.ElementType
  variant?: "default" | "primary" | "outline"
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
        variant === "primary" && "bg-[#00ffff] text-black hover:bg-[#00ffff]/90",
        variant === "outline" && "border border-[#2a2a3e] text-white hover:bg-[#1a1a2e]",
        variant === "default" && "bg-[#12121a] border border-[#2a2a3e] text-white hover:border-[#00ffff]/50"
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  )
}

// Platform detection display
const platformIcons: Record<string, string> = {
  "tilda": "Tilda",
  "wordpress": "WordPress", 
  "wix": "Wix",
  "shopify": "Shopify",
  "squarespace": "Squarespace",
  "bitrix": "Битрикс",
  "html": "HTML/CSS",
  "react": "React",
  "nextjs": "Next.js"
}

export default function NexikStartPage() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>("register")
  const chatRef = useRef<HTMLDivElement>(null)
  
  // Form state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState("")
  
  // Business state
  const [businessInput, setBusinessInput] = useState("")
  const [businessDescription, setBusinessDescription] = useState("")
  const [aiBusinessSummary, setAiBusinessSummary] = useState("")
  
  // Website state
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [hasWebsite, setHasWebsite] = useState<boolean | null>(null)
  const [websiteAnalysis, setWebsiteAnalysis] = useState<WebsiteAnalysis | null>(null)
  const [analyzingProgress, setAnalyzingProgress] = useState(0)
  
  // Integration state
  const [widgetId, setWidgetId] = useState("")
  const [copied, setCopied] = useState(false)
  const [integrationMethod, setIntegrationMethod] = useState<"auto" | "manual" | "help" | null>(null)

  // Auto scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [step, aiBusinessSummary, websiteAnalysis, analyzingProgress])

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError("")
    setRegisterLoading(true)

    try {
      const res = await fetch("/api/nexik/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setRegisterError(data.error || "Ошибка регистрации")
        setRegisterLoading(false)
        return
      }

      // Success - move to business step
      setStep("business")
    } catch {
      setRegisterError("Ошибка соединения")
    } finally {
      setRegisterLoading(false)
    }
  }

  // Handle business description
  const handleBusinessSubmit = async (inputValue?: string) => {
    const value = inputValue || businessInput
    if (!value.trim()) return
    
    setBusinessDescription(value)
    setBusinessInput("")
    
    // Simulate AI quick response (in production - real AI call)
    setTimeout(() => {
      const businessLower = businessInput.toLowerCase()
      let summary = ""
      
      if (businessLower.includes("авто") || businessLower.includes("машин") || businessLower.includes("сервис")) {
        summary = "Автосервис - отличная ниша! Клиенты часто спрашивают о ценах на ТО, диагностику, наличии запчастей и записи на ремонт."
      } else if (businessLower.includes("фитнес") || businessLower.includes("спорт") || businessLower.includes("трениро")) {
        summary = "Фитнес-клуб - супер! Знаю что важно клиентам: расписание тренировок, цены на абонементы, свободные слоты у тренеров."
      } else if (businessLower.includes("доставк") || businessLower.includes("еда") || businessLower.includes("ресторан") || businessLower.includes("кафе")) {
        summary = "Доставка еды - понял! Клиенты хотят знать меню, время доставки, минимальный заказ и акции."
      } else if (businessLower.includes("салон") || businessLower.includes("красот") || businessLower.includes("маникюр") || businessLower.includes("парикмах")) {
        summary = "Салон красоты - моя тема! Запись к мастерам, цены на услуги, свободные окна - всё отвечу за секунды."
      } else if (businessLower.includes("ремонт") || businessLower.includes("строи") || businessLower.includes("мастер")) {
        summary = "Ремонтные услуги - разобрался! Стоимость работ, выезд мастера, сроки - буду отвечать мгновенно."
      } else if (businessLower.includes("юрист") || businessLower.includes("адвокат") || businessLower.includes("консульт")) {
        summary = "Юридические услуги - понятно! Консультации, стоимость услуг, запись на прием - всё организую."
      } else {
        summary = `Понял! ${businessInput.slice(0, 50)}${businessInput.length > 50 ? '...' : ''} - интересная ниша! Я быстро изучу специфику и буду отвечать клиентам профессионально.`
      }
      
      setAiBusinessSummary(summary)
      setStep("website")
    }, 800)
  }

  // Handle website answer
  const handleWebsiteAnswer = (has: boolean) => {
    setHasWebsite(has)
    if (!has) {
      // Skip to creating widget without website analysis
      createWidget(null)
    }
  }

  // Handle website URL submit
  const handleWebsiteSubmit = async () => {
    if (!websiteUrl.trim()) return
    
    setStep("analyzing")
    setAnalyzingProgress(0)
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalyzingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 300)
    
    try {
      const res = await fetch("/api/nexik/analyze-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      })
      
      const data = await res.json()
      
      clearInterval(progressInterval)
      setAnalyzingProgress(100)
      
      if (data.success && data.analysis) {
        setWebsiteAnalysis(data.analysis)
      } else {
        // Fallback analysis
        setWebsiteAnalysis({
          platform: "unknown",
          platformConfidence: 0,
          businessName: businessDescription.slice(0, 30),
          description: businessDescription,
          services: [],
          contacts: {},
          socialLinks: []
        })
      }
      
      setTimeout(() => setStep("review"), 500)
    } catch (error) {
      clearInterval(progressInterval)
      setAnalyzingProgress(100)
      
      // Fallback
      setWebsiteAnalysis({
        platform: "unknown",
        platformConfidence: 0,
        businessName: businessDescription.slice(0, 30),
        description: businessDescription,
        services: [],
        contacts: {},
        socialLinks: []
      })
      
      setTimeout(() => setStep("review"), 500)
    }
  }

  // Create widget
  const createWidget = async (analysis: WebsiteAnalysis | null) => {
    try {
      const res = await fetch("/api/nexik/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_widget",
          data: {
            businessDescription,
            websiteUrl: websiteUrl || null,
            websiteAnalysis: analysis,
            email
          }
        })
      })
      
      const data = await res.json()
      
      if (data.success && data.widget) {
        setWidgetId(data.widget.id)
        localStorage.setItem('nexik_widget_id', data.widget.id)
      } else {
        // Fallback ID
        const fallbackId = `nxk_${Math.random().toString(36).substring(2, 10)}`
        setWidgetId(fallbackId)
        localStorage.setItem('nexik_widget_id', fallbackId)
      }
    } catch {
      const fallbackId = `nxk_${Math.random().toString(36).substring(2, 10)}`
      setWidgetId(fallbackId)
      localStorage.setItem('nexik_widget_id', fallbackId)
    }
    
    setStep("integration")
  }

  // Handle review confirmation
  const handleReviewConfirm = () => {
    createWidget(websiteAnalysis)
  }

  // Copy widget code
  const copyCode = () => {
    const code = `<script src="https://nexik.io/widget.js" data-id="${widgetId}"></script>`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Get integration instructions based on platform
  const getIntegrationInstructions = () => {
    const platform = websiteAnalysis?.platform?.toLowerCase()
    
    if (platform === "tilda") {
      return {
        title: "Установка на Tilda",
        steps: [
          "Откройте настройки сайта в Tilda",
          "Перейдите в раздел «Еще» → «HTML-код для вставки»",
          "Вставьте код в поле «Код перед </body>»",
          "Сохраните и опубликуйте сайт"
        ]
      }
    }
    
    if (platform === "wordpress") {
      return {
        title: "Установка на WordPress",
        steps: [
          "Войдите в админ-панель WordPress",
          "Перейдите в «Внешний вид» → «Редактор тем»",
          "Откройте footer.php",
          "Вставьте код перед закрывающим тегом </body>",
          "Сохраните изменения"
        ]
      }
    }
    
    return {
      title: "Установка на сайт",
      steps: [
        "Откройте HTML-код вашего сайта",
        "Найдите закрывающий тег </body>",
        "Вставьте код виджета перед этим тегом",
        "Сохраните и обновите сайт"
      ]
    }
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00ffff] to-[#00cc99] flex items-center justify-center">
                <Brain className="w-5 h-5 text-black" />
              </div>
              <span className="font-bold text-lg">Nexik</span>
            </Link>
            
            {step !== "done" && step !== "register" && (
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <span className={cn(step === "business" || step === "website" || step === "analyzing" || step === "review" || step === "integration" || step === "integration_help" ? "text-[#00ffff]" : "")}>Бизнес</span>
                <ChevronRight className="w-3 h-3" />
                <span className={cn(step === "website" || step === "analyzing" || step === "review" || step === "integration" || step === "integration_help" ? "text-[#00ffff]" : "")}>Сайт</span>
                <ChevronRight className="w-3 h-3" />
                <span className={cn(step === "integration" || step === "integration_help" || step === "done" ? "text-[#00ffff]" : "")}>Интеграция</span>
              </div>
            )}
            
            {step !== "register" && (
              <Link href="/nexik/login" className="text-sm text-zinc-500 hover:text-white transition-colors">
                Уже есть аккаунт?
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-12 min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          
          {/* Registration Step */}
          {step === "register" && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00ffff] to-[#00cc99] flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-8 h-8 text-black" />
                </div>
                <h1 className="text-3xl font-bold mb-3">Создайте аккаунт Nexik</h1>
                <p className="text-zinc-400">Настроим AI-ассистента за 2 минуты</p>
              </div>
              
              <form onSubmit={handleRegister} className="space-y-4 bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-[#00ffff]/50 focus:ring-1 focus:ring-[#00ffff]/50"
                    placeholder="you@company.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Пароль</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-[#00ffff]/50 focus:ring-1 focus:ring-[#00ffff]/50 pr-12"
                      placeholder="Минимум 6 символов"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                {registerError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {registerError}
                  </div>
                )}
                
                <Button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full h-12 bg-[#00ffff] text-black hover:bg-[#00ffff]/90 font-semibold"
                >
                  {registerLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Продолжить
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
                
                <p className="text-center text-zinc-500 text-sm">
                  Уже есть аккаунт?{" "}
                  <Link href="/nexik/login" className="text-[#00ffff] hover:underline">
                    Войти
                  </Link>
                </p>
              </form>
            </div>
          )}

          {/* Chat-based steps */}
          {step !== "register" && (
            <div className="rounded-2xl border border-[#1a1a2e] bg-[#0a0a0f]/90 backdrop-blur-xl overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a1a2e] bg-[#0d0d14]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ffff] to-[#00cc99] flex items-center justify-center">
                  <Brain className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="font-semibold">Nexik</h4>
                  <p className="text-xs text-[#00ffff]">Настройка AI-ассистента</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                  <span className="text-xs text-zinc-500">онлайн</span>
                </div>
              </div>

              {/* Chat messages */}
              <div ref={chatRef} className="h-[450px] overflow-y-auto p-5 space-y-4">
                
                {/* Business step */}
                {(step === "business" || businessDescription) && (
                  <>
                    <ChatBubble role="nexik">
                      Отлично, {email.split('@')[0]}! Расскажи о своем бизнесе.{"\n\n"}
                      Чем занимаешься? Что продаешь или какие услуги оказываешь?
                    </ChatBubble>
                    
                    {businessDescription && (
                      <ChatBubble role="user">{businessDescription}</ChatBubble>
                    )}
                    
                    {aiBusinessSummary && (
                      <ChatBubble 
                        role="nexik"
                        actions={
                          step === "website" && hasWebsite === null && (
                            <>
                              <QuickAction onClick={() => handleWebsiteAnswer(true)} icon={Globe} variant="primary">
                                Да, есть сайт
                              </QuickAction>
                              <QuickAction onClick={() => handleWebsiteAnswer(false)} variant="outline">
                                Нет сайта
                              </QuickAction>
                            </>
                          )
                        }
                      >
                        {aiBusinessSummary}{"\n\n"}
                        У тебя уже есть сайт? Я могу его проанализировать и сразу настроить ответы на основе информации с сайта.
                      </ChatBubble>
                    )}
                  </>
                )}

                {/* Website URL input */}
                {step === "website" && hasWebsite === true && (
                  <>
                    <ChatBubble role="user">Да, есть сайт</ChatBubble>
                    <ChatBubble role="nexik">
                      Отлично! Скинь ссылку на сайт - я его изучу и автоматически настрою базу знаний.
                    </ChatBubble>
                  </>
                )}

                {/* No website flow */}
                {hasWebsite === false && step !== "integration" && step !== "done" && (
                  <>
                    <ChatBubble role="user">Нет сайта</ChatBubble>
                    <ChatBubble role="nexik">
                      Не проблема! Создам виджет на основе того, что ты рассказал. Потом добавишь его когда появится сайт.{"\n\n"}
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Настраиваю AI...
                    </ChatBubble>
                  </>
                )}

                {/* Analyzing step */}
                {step === "analyzing" && (
                  <>
                    <ChatBubble role="user">{websiteUrl}</ChatBubble>
                    <ChatBubble role="nexik">
                      <div className="space-y-3">
                        <p>Анализирую сайт...</p>
                        <div className="bg-[#12121a] rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-zinc-400">Прогресс</span>
                            <span className="text-xs text-[#00ffff]">{Math.round(analyzingProgress)}%</span>
                          </div>
                          <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#00ffff] to-[#00ff88] rounded-full transition-all duration-300"
                              style={{ width: `${analyzingProgress}%` }}
                            />
                          </div>
                          <div className="mt-2 text-xs text-zinc-500">
                            {analyzingProgress < 30 && "Загружаю страницу..."}
                            {analyzingProgress >= 30 && analyzingProgress < 60 && "Определяю платформу..."}
                            {analyzingProgress >= 60 && analyzingProgress < 90 && "Извлекаю информацию..."}
                            {analyzingProgress >= 90 && "Формирую базу знаний..."}
                          </div>
                        </div>
                      </div>
                    </ChatBubble>
                  </>
                )}

                {/* Review step */}
                {step === "review" && websiteAnalysis && (
                  <>
                    <ChatBubble 
                      role="nexik"
                      actions={
                        <>
                          <QuickAction onClick={handleReviewConfirm} icon={Check} variant="primary">
                            Все верно!
                          </QuickAction>
                          <QuickAction onClick={() => setStep("integration")} variant="outline">
                            Откорректирую позже
                          </QuickAction>
                        </>
                      }
                    >
                      <div className="space-y-3">
                        <p className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#00ff88]" />
                          Готово! Вот что я узнал о твоем бизнесе:
                        </p>
                        
                        <div className="bg-[#12121a] rounded-lg p-3 space-y-2">
                          {websiteAnalysis.platform && websiteAnalysis.platform !== "unknown" && (
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400 text-xs">Платформа</span>
                              <span className="text-[#00ffff] font-medium">
                                {platformIcons[websiteAnalysis.platform.toLowerCase()] || websiteAnalysis.platform}
                              </span>
                            </div>
                          )}
                          
                          {websiteAnalysis.businessName && (
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400 text-xs">Название</span>
                              <span className="font-medium">{websiteAnalysis.businessName}</span>
                            </div>
                          )}
                          
                          {websiteAnalysis.services.length > 0 && (
                            <div>
                              <span className="text-zinc-400 text-xs block mb-1">Услуги/Товары</span>
                              <div className="flex flex-wrap gap-1">
                                {websiteAnalysis.services.slice(0, 5).map((s, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-[#1a1a2e] rounded text-xs">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {(websiteAnalysis.contacts.phone || websiteAnalysis.contacts.email) && (
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-400 text-xs">Контакты</span>
                              <span className="text-xs">
                                {websiteAnalysis.contacts.phone || websiteAnalysis.contacts.email}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-zinc-400 text-xs">
                          Я уже настроил ответы на основе этих данных. Ты можешь откорректировать их в личном кабинете.
                        </p>
                      </div>
                    </ChatBubble>
                  </>
                )}

                {/* Integration step */}
                {step === "integration" && (
                  <>
                    <ChatBubble 
                      role="nexik"
                      actions={
                        integrationMethod === null && (
                          <>
                            {websiteAnalysis?.platform && websiteAnalysis.platform !== "unknown" && (
                              <QuickAction onClick={() => setIntegrationMethod("auto")} icon={Zap} variant="primary">
                                Автоматически
                              </QuickAction>
                            )}
                            <QuickAction onClick={() => setIntegrationMethod("manual")} icon={Copy}>
                              Скопировать код
                            </QuickAction>
                            <QuickAction onClick={() => {
                              setIntegrationMethod("help")
                              setStep("integration_help")
                            }} icon={HelpCircle} variant="outline">
                              Помогите мне
                            </QuickAction>
                          </>
                        )
                      }
                    >
                      <div className="space-y-3">
                        <p className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#00ffff]" />
                          Твой AI-ассистент готов!
                        </p>
                        <p>Теперь добавим его на сайт. Выбери способ:</p>
                      </div>
                    </ChatBubble>

                    {/* Auto integration selected */}
                    {integrationMethod === "auto" && (
                      <>
                        <ChatBubble role="user">Автоматически</ChatBubble>
                        <ChatBubble 
                          role="nexik"
                          actions={
                            <>
                              <QuickAction onClick={() => setStep("done")} icon={Check} variant="primary">
                                Готово, добавил!
                              </QuickAction>
                            </>
                          }
                        >
                          <div className="space-y-3">
                            <p>{getIntegrationInstructions().title}</p>
                            
                            <div className="bg-[#12121a] rounded-lg p-3 space-y-2">
                              {getIntegrationInstructions().steps.map((step, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                  <span className="w-5 h-5 rounded-full bg-[#00ffff]/20 text-[#00ffff] flex items-center justify-center flex-shrink-0 text-xs">
                                    {i + 1}
                                  </span>
                                  <span className="text-zinc-300">{step}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="bg-[#12121a] rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-zinc-400">Код для вставки</span>
                                <button
                                  onClick={copyCode}
                                  className="flex items-center gap-1 text-xs text-[#00ffff] hover:underline"
                                >
                                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  {copied ? "Скопировано!" : "Копировать"}
                                </button>
                              </div>
                              <code className="text-xs text-[#00ff88] break-all">
                                {`<script src="https://nexik.io/widget.js" data-id="${widgetId}"></script>`}
                              </code>
                            </div>
                          </div>
                        </ChatBubble>
                      </>
                    )}

                    {/* Manual integration selected */}
                    {integrationMethod === "manual" && (
                      <>
                        <ChatBubble role="user">Скопировать код</ChatBubble>
                        <ChatBubble 
                          role="nexik"
                          actions={
                            <>
                              <QuickAction onClick={() => setStep("done")} icon={Check} variant="primary">
                                Готово, добавил!
                              </QuickAction>
                              <QuickAction onClick={() => {
                                setIntegrationMethod("help")
                                setStep("integration_help")
                              }} icon={HelpCircle} variant="outline">
                                Помогите мне
                              </QuickAction>
                            </>
                          }
                        >
                          <div className="space-y-3">
                            <p>Вот код виджета. Добавь его на сайт перед закрывающим тегом {"</body>"}:</p>
                            
                            <div className="bg-[#12121a] rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-zinc-400">Код виджета</span>
                                <button
                                  onClick={copyCode}
                                  className="flex items-center gap-1 text-xs text-[#00ffff] hover:underline"
                                >
                                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  {copied ? "Скопировано!" : "Копировать"}
                                </button>
                              </div>
                              <code className="text-xs text-[#00ff88] break-all">
                                {`<script src="https://nexik.io/widget.js" data-id="${widgetId}"></script>`}
                              </code>
                            </div>
                          </div>
                        </ChatBubble>
                      </>
                    )}
                  </>
                )}

                {/* Help integration step */}
                {step === "integration_help" && (
                  <>
                    <ChatBubble role="user">Помогите мне</ChatBubble>
                    <ChatBubble 
                      role="nexik"
                      actions={
                        <>
                          <QuickAction onClick={() => window.open('mailto:support@nexik.io?subject=Помощь с интеграцией&body=Widget ID: ' + widgetId, '_blank')} icon={MessageSquare} variant="primary">
                            Написать в поддержку
                          </QuickAction>
                          <QuickAction onClick={() => setStep("done")} variant="outline">
                            Настрою позже
                          </QuickAction>
                        </>
                      }
                    >
                      <div className="space-y-3">
                        <p>Без проблем! Мы поможем установить виджет.</p>
                        
                        <div className="bg-[#12121a] rounded-lg p-3 space-y-3">
                          <p className="text-sm">Варианты:</p>
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-2 text-sm">
                              <span className="w-5 h-5 rounded-full bg-[#00ffff]/20 text-[#00ffff] flex items-center justify-center flex-shrink-0 text-xs">1</span>
                              <span className="text-zinc-300">Напишите нам - мы сами все настроим (нужен доступ к сайту)</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                              <span className="w-5 h-5 rounded-full bg-[#00ffff]/20 text-[#00ffff] flex items-center justify-center flex-shrink-0 text-xs">2</span>
                              <span className="text-zinc-300">Созвон с демонстрацией экрана</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                              <span className="w-5 h-5 rounded-full bg-[#00ffff]/20 text-[#00ffff] flex items-center justify-center flex-shrink-0 text-xs">3</span>
                              <span className="text-zinc-300">Видео-инструкция под вашу платформу</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-xs text-zinc-400">
                          Ваш Widget ID: <span className="text-[#00ffff] font-mono">{widgetId}</span>
                        </p>
                      </div>
                    </ChatBubble>
                  </>
                )}

                {/* Done step */}
                {step === "done" && (
                  <ChatBubble 
                    role="nexik"
                    actions={
                      <>
                        <QuickAction onClick={() => router.push("/nexik/dashboard")} icon={Settings} variant="primary">
                          Открыть Dashboard
                        </QuickAction>
                        <QuickAction onClick={() => window.open(websiteUrl, '_blank')} icon={ExternalLink} variant="outline">
                          Проверить на сайте
                        </QuickAction>
                      </>
                    }
                  >
                    <div className="space-y-3">
                      <p className="flex items-center gap-2 text-lg">
                        <span className="text-2xl">🎉</span>
                        Поздравляю! Nexik готов к работе!
                      </p>
                      
                      <div className="bg-[#12121a] rounded-lg p-3 space-y-2">
                        <p className="text-sm font-medium text-[#00ffff]">Что делать дальше:</p>
                        <ul className="space-y-1 text-sm text-zinc-300">
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#00ff88]" />
                            Проверь виджет на своем сайте
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#00ff88]" />
                            Настрой ответы в личном кабинете
                          </li>
                          <li className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#00ff88]" />
                            Добавь базу знаний для точных ответов
                          </li>
                        </ul>
                      </div>
                      
                      <p className="text-zinc-400 text-sm">
                        Я уже начал отвечать клиентам! Все диалоги будешь видеть в Dashboard.
                      </p>
                    </div>
                  </ChatBubble>
                )}
              </div>

              {/* Input area */}
              {step === "business" && !businessDescription && (
                <div className="p-4 border-t border-[#1a1a2e] bg-[#0d0d14]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={businessInput}
                      onChange={(e) => setBusinessInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleBusinessSubmit()}
                      placeholder="Например: автосервис, ремонт BMW и Mercedes..."
                      className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#00ffff]/50"
                    />
                    <button
                      onClick={handleBusinessSubmit}
                      disabled={!businessInput.trim()}
                      className="px-4 rounded-xl bg-[#00ffff] text-black flex items-center justify-center hover:bg-[#00ffff]/90 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a2e] text-zinc-400 text-xs hover:bg-[#2a2a3e] transition-colors">
                      <Mic className="w-3.5 h-3.5" />
                      Голосом
                    </button>
                  </div>
                </div>
              )}

              {/* Website URL input */}
              {step === "website" && hasWebsite === true && (
                <div className="p-4 border-t border-[#1a1a2e] bg-[#0d0d14]">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleWebsiteSubmit()}
                        placeholder="https://example.com"
                        className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#00ffff]/50"
                      />
                    </div>
                    <button
                      onClick={handleWebsiteSubmit}
                      disabled={!websiteUrl.trim()}
                      className="px-4 rounded-xl bg-[#00ffff] text-black flex items-center justify-center hover:bg-[#00ffff]/90 transition-colors disabled:opacity-50"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
