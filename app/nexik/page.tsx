"use client"
// Nexik Landing Page v3 - NetNext branding
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SiriOrb } from "@/components/nexik/siri-orb"
import { NetNextLogo } from "@/components/netnext-logo"
import { 
  Zap, 
  MessageSquare, 
  ArrowRight,
  Check,
  Play,
  Clock,
  Users,
  Building2,
  Sparkles,
  Globe,
  Calendar,
  TrendingUp,
  Shield,
  Gift,
  Send,
  Mic,
  Car,
  Dumbbell,
  Pizza,
  Scissors,
  Wrench,
  Store,
  LogIn
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Chat } from "@/components/chat"

// Typewriter effect for hero
function TypewriterBusiness() {
  const businesses = [
    "кондиционеры",
    "автосервис", 
    "доставку еды",
    "юридические услуги",
    "салон красоты",
    "стоматологию",
    "ремонт квартир",
    "фитнес-клуб",
    "что угодно"
  ]
  const [index, setIndex] = useState(0)
  const [text, setText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const current = businesses[index]
    const timeout = isDeleting ? 30 : 80

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setText(current.substring(0, text.length + 1))
        if (text.length + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        setText(current.substring(0, text.length - 1))
        if (text.length === 0) {
          setIsDeleting(false)
          setIndex((prev) => (prev + 1) % businesses.length)
        }
      }
    }, timeout)

    return () => clearTimeout(timer)
  }, [text, isDeleting, index, businesses])

  return (
    <span className="text-[#00ffff]">
      {text}
      <span className="animate-pulse">|</span>
    </span>
  )
}

// Business example buttons for demo
const businessExamples = [
  { id: 'auto', icon: Car, label: 'Автосервис', description: 'Ремонт и обслуживание авто' },
  { id: 'fitness', icon: Dumbbell, label: 'Фитнес', description: 'Тренировки и абонементы' },
  { id: 'food', icon: Pizza, label: 'Доставка еды', description: 'Ресторан или кафе' },
  { id: 'beauty', icon: Scissors, label: 'Салон красоты', description: 'Парикмахерские услуги' },
  { id: 'repair', icon: Wrench, label: 'Ремонт', description: 'Бытовая техника или квартиры' },
  { id: 'other', icon: Store, label: 'Другое', description: 'Любой бизнес' },
]

// Demo responses based on business type
const demoResponses: Record<string, { greeting: string; features: string[] }> = {
  auto: {
    greeting: "Автосервис - отлично! Я уже знаю эту нишу. Ваши клиенты спрашивают о ценах на ТО, записи на диагностику, наличии запчастей.",
    features: ["Запись на ТО и ремонт", "Цены на услуги", "Статус готовности авто", "Вызов эвакуатора"]
  },
  fitness: {
    greeting: "Фитнес-клуб - супер! Знаю что важно вашим клиентам: расписание тренировок, цены на абонементы, свободные слоты у тренеров.",
    features: ["Расписание занятий", "Цены на абонементы", "Запись к тренеру", "Заморозка карты"]
  },
  food: {
    greeting: "Доставка еды - понял! Клиенты хотят знать меню, время доставки, минимальный заказ и акции.",
    features: ["Меню и цены", "Время доставки", "Оформление заказа", "Акции и скидки"]
  },
  beauty: {
    greeting: "Салон красоты - моя тема! Запись к мастерам, цены на услуги, свободные окна - всё отвечу за секунды.",
    features: ["Запись к мастеру", "Цены на услуги", "Свободные окна", "Отмена записи"]
  },
  repair: {
    greeting: "Ремонтные услуги - разобрался! Стоимость работ, выезд мастера, сроки - буду отвечать мгновенно.",
    features: ["Стоимость работ", "Выезд мастера", "Сроки ремонта", "Гарантия"]
  },
  other: {
    greeting: "Расскажите подробнее о вашем бизнесе, и я мгновенно пойму как помочь вашим клиентам!",
    features: ["Ответы 24/7", "Запись на услуги", "Информация о ценах", "Сбор заявок"]
  }
}

// Interactive Demo Chat with business selection
function DemoChat() {
  const router = useRouter()
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)
  const [showResponse, setShowResponse] = useState(false)
  const [customInput, setCustomInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSelectBusiness = (id: string) => {
    setSelectedBusiness(id)
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setShowResponse(true)
    }, 800)
  }

  const handleCustomSubmit = () => {
    if (!customInput.trim()) return
    setSelectedBusiness('other')
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setShowResponse(true)
    }, 800)
  }

  const resetDemo = () => {
    setSelectedBusiness(null)
    setShowResponse(false)
    setCustomInput("")
  }

  const response = selectedBusiness ? demoResponses[selectedBusiness] : null

  return (
    <div className="rounded-2xl border border-[#1a1a2e] bg-[#0a0a0f]/90 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a1a2e] bg-[#0d0d14]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ffff] to-[#00cc99] flex items-center justify-center">
          <NetNextLogo size={20} />
        </div>
        <div>
          <h4 className="font-semibold text-white">Nexik</h4>
          <p className="text-xs text-[#00ffff]">Демо-режим</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="text-xs text-zinc-500">готов к работе</span>
        </div>
      </div>

      {/* Chat area */}
      <div className="h-80 overflow-y-auto p-5 space-y-4">
        {/* Initial message */}
        <div className="flex justify-start">
          <div className="max-w-[90%] rounded-2xl rounded-bl-md px-4 py-3 bg-[#1a1a2e] text-white text-sm">
            <p className="mb-3">Привет! Я Nexik. Покажу как работаю за 10 секунд.</p>
            <p className="text-zinc-400">Выбери свой бизнес или напиши свой вариант:</p>
          </div>
        </div>

        {/* Business selection buttons */}
        {!selectedBusiness && (
          <div className="grid grid-cols-2 gap-2">
            {businessExamples.map((biz) => (
              <button
                key={biz.id}
                onClick={() => handleSelectBusiness(biz.id)}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#12121a] border border-[#2a2a3e] hover:border-[#00ffff]/50 hover:bg-[#1a1a2e] transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-[#00ffff]/10 flex items-center justify-center group-hover:bg-[#00ffff]/20 transition-colors">
                  <biz.icon className="w-4 h-4 text-[#00ffff]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{biz.label}</div>
                  <div className="text-xs text-zinc-500">{biz.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* User selection message */}
        {selectedBusiness && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-3 bg-[#00ffff] text-black text-sm">
              {selectedBusiness === 'other' && customInput ? customInput : businessExamples.find(b => b.id === selectedBusiness)?.label}
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a2e] rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-[#00ffff] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {/* Nexik response */}
        {showResponse && response && (
          <div className="space-y-3">
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-2xl rounded-bl-md px-4 py-3 bg-[#1a1a2e] text-white text-sm">
                <p className="mb-3">{response.greeting}</p>
                <p className="text-[#00ffff] font-medium mb-2">Я буду отвечать на вопросы:</p>
                <ul className="space-y-1">
                  {response.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-[#00ff88]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* CTA */}
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-2xl rounded-bl-md px-4 py-3 bg-gradient-to-r from-[#00ffff]/20 to-[#00ff88]/20 border border-[#00ffff]/30 text-white text-sm">
                <p className="font-medium mb-2">Готов работать на твоём сайте!</p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[#00ffff] text-black hover:bg-[#00ffff]/90 gap-1.5" asChild>
                    <Link href="/nexik/start">
                      <Zap className="w-3.5 h-3.5" />
                      Запустить
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetDemo} className="border-[#2a2a3e] hover:bg-[#1a1a2e]">
                    Попробовать снова
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1a1a2e] bg-[#0d0d14]">
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            placeholder={selectedBusiness ? "Демо завершено" : "Или напиши свой бизнес..."}
            disabled={!!selectedBusiness}
            className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#00ffff]/50 disabled:opacity-50"
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customInput.trim() || !!selectedBusiness}
            className="w-12 h-12 rounded-xl bg-[#00ffff] text-black flex items-center justify-center hover:bg-[#00ffff]/90 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Stats counter
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 2000
          const startTime = performance.now()
          
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * value))
            if (progress < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, hasAnimated])

  return <div ref={ref}>{count}{suffix}</div>
}

// Pricing plans
const pricingPlans = [
  {
    name: "Старт",
    price: "0",
    period: "навсегда",
    description: "Попробуй Nexik бесплатно",
    features: [
      "500 сообщений в месяц",
      "1 виджет на сайт",
      "Базовый AI",
      "Email поддержка",
    ],
    notIncluded: [
      "Анализ сайта",
      "База знаний",
      "Аналитика",
    ],
    accent: "#888",
    popular: false,
    cta: "Начать бесплатно"
  },
  {
    name: "Бизнес",
    price: "1 490",
    period: "/мес",
    description: "Для растущего бизнеса",
    features: [
      "10 000 сообщений в месяц",
      "3 виджета",
      "Продвинутый AI",
      "Анализ сайта и соцсетей",
      "База знаний (RAG)",
      "Автоинтеграция",
      "Приоритетная поддержка",
    ],
    notIncluded: [],
    accent: "#00ffff",
    popular: true,
    cta: "Подключить"
  },
  {
    name: "Корпорация",
    price: "4 990",
    period: "/мес",
    description: "Для крупных компаний",
    features: [
      "Безлимит сообщений",
      "Безлимит виджетов",
      "Выделенный AI сервер",
      "API доступ",
      "Webhook интеграции",
      "Мультиязычность",
      "SLA 99.9%",
      "Персональный менеджер",
    ],
    notIncluded: [],
    accent: "#ff00aa",
    popular: false,
    cta: "Связаться"
  },
]

export default function NexikLandingPage() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#030305] text-white">
      {/* Ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#00ffff]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ff00aa]/5 rounded-full blur-[120px]" />
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030305]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 lg:px-20">
          <div className="flex items-center justify-between h-16">
            <Link href="/nexik" className="flex items-center gap-3 group">
              <NetNextLogo size={36} showText={false} />
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg">Nexik</span>
                <span className="text-xs text-zinc-600 font-mono">by NetNext</span>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              <Link href="/#services" className="hidden md:block text-sm text-zinc-500 hover:text-white transition-colors">
                Заказать сайт
              </Link>
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-2" asChild>
                <Link href="/nexik/login">
                  <LogIn className="w-4 h-4" />
                  Войти
                </Link>
              </Button>
              <Button className="bg-[#00ffff] text-black hover:bg-[#00ffff]/90 gap-2" asChild>
                <Link href="/nexik/start">
                  Начать
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center relative pt-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-20 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - text */}
            <div>
              {/* NetNext badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff00aa]/10 border border-[#ff00aa]/20 mb-8">
                <Gift className="w-4 h-4 text-[#ff00aa]" />
                <span className="text-sm text-[#ff00aa]">Бесплатно при заказе сайта в NetNext</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
                <span className="text-white">AI который продает</span>
                <br />
                <TypewriterBusiness />
              </h1>

              <p className="text-xl text-zinc-400 mb-8 leading-relaxed max-w-xl">
                Nexik — AI-ассистент для бизнеса. Отвечает клиентам 24/7, 
                записывает на встречи, знает все о твоем бизнесе. 
                <span className="text-white"> Скажи чем занимаешься — и он готов.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" className="bg-[#00ffff] text-black hover:bg-[#00ffff]/90 text-base px-8 h-14 w-full sm:w-auto gap-2 group" asChild>
                  <Link href="/nexik/start">
                    Запустить за 2 минуты
                    <Zap className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => setIsChatOpen(true)}
                  className="border-[#1a1a2e] bg-transparent text-white hover:bg-[#1a1a2e] text-base px-8 h-14 w-full sm:w-auto gap-2"
                >
                  <Play className="w-5 h-5" />
                  Попробовать виджет
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00ff88]" />
                  <span>Без программистов</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00ff88]" />
                  <span>Автоинтеграция</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00ff88]" />
                  <span>Анализ сайта</span>
                </div>
              </div>
            </div>

            {/* Right - demo chat */}
            <div id="demo" className="relative">
              {/* Glow behind */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#00ffff]/20 via-transparent to-[#ff00aa]/20 rounded-3xl blur-2xl opacity-50" />
              <DemoChat />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ffff]/10 border border-[#00ffff]/20 mb-6">
              <Sparkles className="w-4 h-4 text-[#00ffff]" />
              <span className="text-sm text-[#00ffff]">Простота — наш принцип</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Как это работает
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Расскажи о бизнесе — Nexik сам настроит все остальное
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                step: "01",
                icon: <MessageSquare className="w-7 h-7" />,
                title: "Расскажи о бизнесе",
                description: "Напиши или скажи голосом чем занимаешься. AI поймет любую нишу.",
                accent: "#00ffff"
              },
              {
                step: "02", 
                icon: <Globe className="w-7 h-7" />,
                title: "Укажи сайт",
                description: "Nexik проанализирует твой сайт и сам изучит информацию о бизнесе.",
                accent: "#ff00aa"
              },
              {
                step: "03",
                icon: <Zap className="w-7 h-7" />,
                title: "Автоинтеграция",
                description: "Виджет появится на сайте автоматически. Tilda, WordPress, Shopify — любая платформа.",
                accent: "#00ff88"
              },
              {
                step: "04",
                icon: <TrendingUp className="w-7 h-7" />,
                title: "Nexik работ��ет",
                description: "AI общается с клиентами, собирает заявки и передает тебе горячих лидов.",
                accent: "#ffaa00"
              }
            ].map((item, index) => (
              <div key={item.step} className="relative group">
                {/* Connection line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-[calc(100%+0.5rem)] w-[calc(100%-1rem)] h-px bg-gradient-to-r from-[#1a1a2e] to-transparent" />
                )}
                
                <div className="rounded-2xl border border-[#1a1a2e] bg-[#0a0a0f]/80 p-6 h-full transition-all duration-300 hover:border-[#2a2a3e] hover:bg-[#0d0d14]">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                    style={{ background: `${item.accent}15`, color: item.accent }}
                  >
                    {item.icon}
                  </div>
                  <div 
                    className="inline-block px-2.5 py-1 rounded-full text-xs font-bold font-mono mb-3"
                    style={{ background: `${item.accent}20`, color: item.accent }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Что умеет Nexik
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Не просто чат-бот, а AI бизнес-ассистент
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <MessageSquare className="w-6 h-6" />,
                title: "Отвечает 24/7",
                description: "Пока ты спишь — Nexik общается с клиентами и собирает заявки",
                accent: "#00ffff"
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                title: "Записывает на встречи",
                description: "Автоматически назначает консультации и отправляет напоминания",
                accent: "#ff00aa"
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Продает",
                description: "Знает цены, услуги, акции. Отвечает на возражения и закрывает сделки",
                accent: "#00ff88"
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Передает тебе",
                description: "Сложный клиент? Nexik мгновенно подключает тебя к диалогу",
                accent: "#ffaa00"
              },
              {
                icon: <NetNextLogo size={24} />,
                title: "Изучает сайт",
                description: "Сам парсит твой сайт и соцсети. Знает все о бизнесе без обучения",
                accent: "#aa00ff"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Фильтрует спам",
                description: "Отсеивает нецелевые обращения и экономит твое время",
                accent: "#ff6b35"
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Любая платформа",
                description: "Tilda, WordPress, Shopify, Wix — интегрируется за секунды",
                accent: "#00aaff"
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Мгновенно",
                description: "Клиент получает ответ за секунды, не минуты",
                accent: "#ff0066"
              }
            ].map((feature) => (
              <div 
                key={feature.title}
                className="rounded-xl border border-[#1a1a2e] bg-[#0a0a0f]/80 p-6 transition-all duration-300 hover:border-[#2a2a3e] group"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: `${feature.accent}15`, color: feature.accent }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 relative border-y border-[#1a1a2e]">
        <div className="container mx-auto px-4 md:px-6 lg:px-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 24, suffix: "/7", label: "Работает без выходных" },
              { value: 2, suffix: " мин", label: "На запуск" },
              { value: 100, suffix: "%", label: "Автоматизации" },
              { value: 0, suffix: "₽", label: "При заказе сайта" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#00ffff] mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NetNext integration */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-20">
          <div className="rounded-3xl border border-[#ff00aa]/20 bg-gradient-to-br from-[#ff00aa]/5 to-transparent p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff00aa]/10 rounded-full blur-[100px]" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff00aa]/10 border border-[#ff00aa]/20 mb-6">
                  <Gift className="w-4 h-4 text-[#ff00aa]" />
                  <span className="text-sm text-[#ff00aa]">Эксклюзив для клиентов</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Закажи сайт в NetNext — <br />
                  <span className="text-[#ff00aa]">получи Nexik бесплатно на год</span>
                </h2>
                <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                  Мы создаем не просто сайты, а готовые бизнес-инструменты. 
                  Каждый сайт от NetNext получает AI-ассистента Nexik.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/#services">
                    <Button size="lg" className="bg-[#ff00aa] text-white hover:bg-[#ff00aa]/90 gap-2">
                      <Building2 className="w-5 h-5" />
                      Заказать сайт + Nexik
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  "Сайт + Nexik = полный автопилот",
                  "AI изучает твой сайт автоматически",
                  "Интеграция уже настроена",
                  "12 месяцев бесплатно",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[#0a0a0f]/80 border border-[#1a1a2e]">
                    <div className="w-8 h-8 rounded-lg bg-[#ff00aa]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-[#ff00aa]" />
                    </div>
                    <span className="text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Простые тарифы
            </h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Без скрытых платежей. Цены для СНГ.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.name}
                className={cn(
                  "relative rounded-2xl border bg-[#0a0a0f]/80 p-8 transition-all duration-300",
                  plan.popular 
                    ? "border-[#00ffff]/50 scale-105 shadow-[0_0_60px_rgba(0,255,255,0.15)]" 
                    : "border-[#1a1a2e] hover:border-[#2a2a3e]"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#00ffff] text-black">
                    Популярный
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <p className="text-sm text-zinc-500">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{ color: plan.accent }}>
                    {plan.price === "0" ? "Бесплатно" : `${plan.price}₽`}
                  </span>
                  {plan.period && plan.price !== "0" && (
                    <span className="text-zinc-500">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#00ff88] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-zinc-300">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 opacity-50">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                      </div>
                      <span className="text-sm text-zinc-600 line-through">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.name === "Корпорация" ? "/#contact" : "/nexik/start"}>
                  <Button 
                    className={cn(
                      "w-full",
                      plan.popular 
                        ? "bg-[#00ffff] text-black hover:bg-[#00ffff]/90" 
                        : "bg-[#1a1a2e] text-white hover:bg-[#2a2a3e]"
                    )}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Твой бизнес заслуживает <br />
              <span className="text-[#00ffff]">AI-ассистента</span>
            </h2>
            <p className="text-xl text-zinc-400 mb-10">
              Запусти Nexik за 2 минуты. Бесплатно. Без программистов.
            </p>
            <Button size="lg" className="bg-[#00ffff] text-black hover:bg-[#00ffff]/90 text-lg px-12 h-16 gap-3 group" asChild>
              <Link href="/nexik/start">
                Запустить Nexik
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#1a1a2e]">
        <div className="container mx-auto px-4 md:px-6 lg:px-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ffff] to-[#00cc99] flex items-center justify-center">
                <NetNextLogo size={16} />
              </div>
              <span className="font-semibold">Nexik</span>
              <span className="text-zinc-600 text-sm">— продукт студии NetNext</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href="/" className="hover:text-white transition-colors">NetNext.site</Link>
              <Link href="/#contact" className="hover:text-white transition-colors">Контакты</Link>
              <Link href="/nexik/login" className="hover:text-white transition-colors">Войти</Link>
              <Link href="/nexik/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Nexik Widget - shows our actual chat widget */}
      <Chat
        isOpen={isChatOpen}
        onOpenChange={setIsChatOpen}
        config={{
          mode: 'local',
          companyName: 'Nexik Demo',
          assistantName: 'Nexik',
          welcomeMessage: 'Привет! Это демонстрация виджета Nexik. Задайте любой вопрос — я покажу как работаю!',
          apiEndpoint: '/api/chat/ai',
          quickActions: [
            { id: '1', label: 'Как это работает?', action: 'custom', icon: 'MessageSquare' },
            { id: '2', label: 'Сколько стоит?', action: 'custom', icon: 'Calculator' },
            { id: '3', label: 'Попробовать бесплатно', action: 'custom', icon: 'Zap' },
          ]
        }}
        displayConfig={{
          mode: 'modal',
          modalSize: 'md',
          position: 'center',
          mobileFullscreen: true,
        }}
      />

      {/* Floating Siri-like animated orb button */}
      <div className="fixed bottom-6 right-6 z-40">
        <SiriOrb 
          size={72} 
          color="#4fd1c5" 
          state="idle"
          onClick={() => setIsChatOpen(true)}
        />
      </div>
    </div>
  )
}
