"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { 
  Brain, 
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
  Send
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
    "гвозди и метизы",
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

// Demo chat component
function DemoChat() {
  const [messages, setMessages] = useState([
    { role: "nexik", text: "Привет! Я Nexik. Расскажи, какой у тебя бизнес?" }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [step, setStep] = useState(0)
  const chatRef = useRef<HTMLDivElement>(null)

  const responses = [
    {
      trigger: "",
      response: "Отлично! Я изучил твой бизнес. Теперь я могу:\n\n• Отвечать на вопросы клиентов 24/7\n• Записывать на консультации\n• Рассказывать о ценах и услугах\n• Собирать контакты потенциальных клиентов\n\nГотов работать! Хочешь настроить расписание — когда отвечаю я, а когда ты?"
    },
    {
      trigger: "",
      response: "Понял! Буду отвечать с 22:00 до 9:00 и в выходные. В рабочее время — уведомлю тебя, и ты сможешь подключиться в любой момент.\n\nВсё готово! Осталось добавить виджет на сайт — это одна строка кода."
    }
  ]

  const handleSend = () => {
    if (!input.trim() || step >= 2) return
    
    setMessages(prev => [...prev, { role: "user", text: input }])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, { role: "nexik", text: responses[step].response }])
      setStep(prev => prev + 1)
    }, 1500)
  }

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, isTyping])

  return (
    <div className="rounded-2xl border border-[#1a1a2e] bg-[#0a0a0f]/90 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a1a2e] bg-[#0d0d14]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ffff] to-[#ff00aa] flex items-center justify-center">
          <Brain className="w-5 h-5 text-black" />
        </div>
        <div>
          <h4 className="font-semibold text-white">Nexik</h4>
          <p className="text-xs text-[#00ffff]">AI бизнес-директор</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="text-xs text-[#888]">онлайн</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatRef} className="h-72 overflow-y-auto p-5 space-y-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line",
              msg.role === "user" 
                ? "bg-[#00ffff] text-black rounded-br-md" 
                : "bg-[#1a1a2e] text-white rounded-bl-md"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
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
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1a1a2e] bg-[#0d0d14]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={step === 0 ? "Например: продаю кондиционеры..." : step === 1 ? "Например: с 9 до 18 в будни..." : "Готово!"}
            disabled={step >= 2}
            className="flex-1 bg-[#1a1a2e] border border-[#2a2a3e] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-[#00ffff]/50 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || step >= 2}
            className="w-12 h-12 rounded-xl bg-[#00ffff] text-black flex items-center justify-center hover:bg-[#00ffff]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          let start = 0
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

// Pricing plans for external clients (not NetNext customers)
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
      "Расписание работы",
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
      "Расписание работы",
      "База знаний (RAG)",
      "Telegram уведомления",
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
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00ffff] to-[#ff00aa] flex items-center justify-center">
                <Brain className="w-5 h-5 text-black" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg">Nexik</span>
                <span className="text-xs text-[#555] font-mono">by NetNext</span>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              <Link href="/#services" className="hidden md:block text-sm text-[#888] hover:text-white transition-colors">
                Заказать сайт
              </Link>
              <Link href="/nexik/start">
                <Button className="bg-[#00ffff] text-black hover:bg-[#00ffff]/90 gap-2">
                  Начать
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
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
                <span className="text-white">AI который продаёт</span>
                <br />
                <TypewriterBusiness />
              </h1>

              <p className="text-xl text-[#888] mb-8 leading-relaxed max-w-xl">
                Nexik — твой AI бизнес-директор. Отвечает клиентам 24/7, 
                записывает на встречи, знает всё о твоём бизнесе. 
                <span className="text-white"> Просто скажи, чем занимаешься — и он готов работать.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/nexik/start">
                  <Button size="lg" className="bg-[#00ffff] text-black hover:bg-[#00ffff]/90 text-base px-8 h-14 w-full sm:w-auto gap-2 group">
                    Запустить за 2 минуты
                    <Zap className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button variant="outline" size="lg" className="border-[#1a1a2e] bg-transparent text-white hover:bg-[#1a1a2e] text-base px-8 h-14 w-full sm:w-auto gap-2">
                    <Play className="w-5 h-5" />
                    Смотреть демо
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-8 text-sm text-[#555]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00ff88]" />
                  <span>Без программистов</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00ff88]" />
                  <span>Любой бизнес</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#00ff88]" />
                  <span>Запуск за 2 мин</span>
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

      {/* How it works - super simple */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ffff]/10 border border-[#00ffff]/20 mb-6">
              <Sparkles className="w-4 h-4 text-[#00ffff]" />
              <span className="text-sm text-[#00ffff]">Максимальная простота</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              3 шага — и Nexik работает
            </h2>
            <p className="text-xl text-[#888] max-w-2xl mx-auto">
              Никаких сложных настроек. Просто расскажи о бизнесе — остальное сделает AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                icon: <MessageSquare className="w-8 h-8" />,
                title: "Расскажи о бизнесе",
                description: "Напиши что продаёшь или какие услуги оказываешь. Nexik поймёт любую нишу — от кондиционеров до юридических услуг.",
                accent: "#00ffff"
              },
              {
                step: "02", 
                icon: <Clock className="w-8 h-8" />,
                title: "Настрой расписание",
                description: "Когда отвечаешь ты, а когда AI? Nexik работает в твоё отсутствие и мгновенно передаёт диалог когда ты онлайн.",
                accent: "#ff00aa"
              },
              {
                step: "03",
                icon: <Globe className="w-8 h-8" />,
                title: "Добавь на сайт",
                description: "Одна строка кода — и виджет на сайте. Nexik сразу начнёт общаться с клиентами и приносить заявки.",
                accent: "#00ff88"
              }
            ].map((item, index) => (
              <div key={item.step} className="relative group">
                {/* Connection line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-16 left-[calc(100%+1rem)] w-[calc(100%-2rem)] h-px bg-gradient-to-r from-[#1a1a2e] to-transparent" />
                )}
                
                <div className="rounded-2xl border border-[#1a1a2e] bg-[#0a0a0f]/80 p-8 h-full transition-all duration-300 hover:border-[#2a2a3e] hover:bg-[#0d0d14]">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                    style={{ background: `${item.accent}15`, color: item.accent }}
                  >
                    {item.icon}
                  </div>
                  <div 
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold font-mono mb-4"
                    style={{ background: `${item.accent}20`, color: item.accent }}
                  >
                    Шаг {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-[#888] leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - what Nexik can do */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Что умеет Nexik
            </h2>
            <p className="text-xl text-[#888] max-w-2xl mx-auto">
              Не просто чат-бот, а полноценный бизнес-ассистент
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
                title: "Продаёт",
                description: "Знает твои цены, услуги, акции. Отвечает на возражения и закрывает сделки",
                accent: "#00ff88"
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Передаёт тебе",
                description: "Сложный клиент? Nexik мгновенно подключает тебя к диалогу",
                accent: "#ffaa00"
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: "Учится",
                description: "Загрузи FAQ, прайс, скрипты — Nexik будет отвечать точнее",
                accent: "#aa00ff"
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Фильтрует спам",
                description: "Отсеивает нецелевые обращения и экономит твоё время",
                accent: "#ff6b35"
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Любой бизнес",
                description: "Кондиционеры, юристы, рестораны, стройка — Nexik разберётся",
                accent: "#00aaff"
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Мгновенные ответы",
                description: "Клиент не ждёт — получает ответ за секунды, а не минуты",
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
                <p className="text-sm text-[#888] leading-relaxed">{feature.description}</p>
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
              { value: 100, suffix: "%", label: "Любой бизнес" },
              { value: 0, suffix: "₽", label: "При заказе сайта" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-[#00ffff] mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-[#888]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NetNext integration */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-20">
          <div className="rounded-3xl border border-[#ff00aa]/20 bg-gradient-to-br from-[#ff00aa]/5 to-transparent p-8 md:p-12 relative overflow-hidden">
            {/* Glow */}
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
                <p className="text-lg text-[#888] mb-8 leading-relaxed">
                  Мы создаём не просто сайты, а готовые бизнес-инструменты. 
                  Каждый сайт от NetNext получает AI-ассистента Nexik, 
                  который будет обрабатывать заявки и продавать 24/7.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/#services">
                    <Button size="lg" className="bg-[#ff00aa] text-white hover:bg-[#ff00aa]/90 gap-2">
                      <Building2 className="w-5 h-5" />
                      Заказать сайт + Nexik
                    </Button>
                  </Link>
                  <Link href="/#portfolio">
                    <Button variant="outline" size="lg" className="border-[#ff00aa]/30 bg-transparent hover:bg-[#ff00aa]/10">
                      Смотреть портфолио
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  "Сайт + Nexik = полный автопилот",
                  "AI знает всё о твоём бизнесе с первого дня",
                  "Интеграция уже настроена — просто запускай",
                  "12 месяцев бесплатно, потом — специальная цена",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[#0a0a0f]/80 border border-[#1a1a2e]">
                    <div className="w-8 h-8 rounded-lg bg-[#ff00aa]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-[#ff00aa]" />
                    </div>
                    <span className="text-[#ccc]">{item}</span>
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
              Уже есть сайт? Подключи Nexik
            </h2>
            <p className="text-xl text-[#888] max-w-2xl mx-auto">
              Простые тарифы без скрытых платежей. Цены для СНГ.
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
                  <p className="text-sm text-[#888]">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{ color: plan.accent }}>
                    {plan.price === "0" ? "Бесплатно" : `${plan.price}₽`}
                  </span>
                  {plan.period && plan.price !== "0" && (
                    <span className="text-[#888]">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#00ff88] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#ccc]">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 opacity-50">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#555]" />
                      </div>
                      <span className="text-sm text-[#888] line-through">{feature}</span>
                    </li>
                  ))}
                </ul>

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
              <span className="text-[#00ffff]">AI бизнес-директора</span>
            </h2>
            <p className="text-xl text-[#888] mb-10">
              Запусти Nexik за 2 минуты. Бесплатно. Без программистов.
            </p>
            <Link href="/nexik/start">
              <Button size="lg" className="bg-[#00ffff] text-black hover:bg-[#00ffff]/90 text-lg px-12 h-16 gap-3 group">
                Запустить Nexik
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#1a1a2e]">
        <div className="container mx-auto px-4 md:px-6 lg:px-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ffff] to-[#ff00aa] flex items-center justify-center">
                <Brain className="w-4 h-4 text-black" />
              </div>
              <span className="font-semibold">Nexik</span>
              <span className="text-[#555] text-sm">— продукт студии NetNext</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#888]">
              <Link href="/" className="hover:text-white transition-colors">NetNext.site</Link>
              <Link href="/#contact" className="hover:text-white transition-colors">Контакты</Link>
              <Link href="/nexik/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
