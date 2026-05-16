"use client"

import { useState, useEffect } from "react"
import { 
  Copy, 
  Check, 
  Globe, 
  Code, 
  Zap,
  HelpCircle,
  ExternalLink,
  Play,
  ChevronRight,
  MessageSquare,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Platform integration instructions
const platformInstructions: Record<string, {
  name: string
  icon: string
  steps: string[]
  videoUrl?: string
  docsUrl?: string
}> = {
  tilda: {
    name: "Tilda",
    icon: "T",
    steps: [
      "Откройте настройки сайта в Tilda",
      "Перейдите в раздел «Еще» → «HTML-код для вставки»",
      "В поле «Код перед </body>» вставьте код виджета",
      "Нажмите «Сохранить» и «Опубликовать сайт»"
    ],
    docsUrl: "https://help.tilda.cc/html-code"
  },
  wordpress: {
    name: "WordPress",
    icon: "W",
    steps: [
      "Войдите в админ-панель WordPress",
      "Установите плагин «Insert Headers and Footers» или аналогичный",
      "Перейдите в Настройки → Insert Headers and Footers",
      "Вставьте код виджета в поле «Scripts in Footer»",
      "Сохраните изменения"
    ],
    docsUrl: "https://developer.wordpress.org/plugins/hooks/actions/"
  },
  shopify: {
    name: "Shopify",
    icon: "S",
    steps: [
      "Войдите в Shopify Admin",
      "Перейдите в Online Store → Themes",
      "Нажмите Actions → Edit code",
      "Откройте файл theme.liquid",
      "Вставьте код перед </body>",
      "Сохраните изменения"
    ],
    docsUrl: "https://help.shopify.com/en/manual/online-store/themes/theme-structure/extend/edit-theme-code"
  },
  wix: {
    name: "Wix",
    icon: "W",
    steps: [
      "Откройте редактор Wix",
      "Нажмите на «+» → «Embed» → «Custom embeds» → «Embed a widget»",
      "Выберите «Enter code» и вставьте код виджета",
      "Расположите виджет в нужном месте",
      "Опубликуйте сайт"
    ],
    docsUrl: "https://support.wix.com/en/article/embedding-custom-code-on-your-site"
  },
  squarespace: {
    name: "Squarespace",
    icon: "S",
    steps: [
      "Откройте настройки сайта в Squarespace",
      "Перейдите в Settings → Advanced → Code Injection",
      "Вставьте код в поле «Footer»",
      "Сохраните изменения"
    ],
    docsUrl: "https://support.squarespace.com/hc/en-us/articles/205815908"
  },
  bitrix: {
    name: "Битрикс",
    icon: "B",
    steps: [
      "Войдите в админ-панель Битрикс",
      "Перейдите в Настройки → Настройки модулей → Главный модуль",
      "Найдите поле «Дополнительный HTML в подвале сайта»",
      "Вставьте код виджета",
      "Сохраните изменения"
    ]
  },
  html: {
    name: "HTML / Любой сайт",
    icon: "</>",
    steps: [
      "Откройте HTML-файл вашего сайта в редакторе",
      "Найдите закрывающий тег </body>",
      "Вставьте код виджета прямо перед этим тегом",
      "Сохраните файл и загрузите на сервер"
    ]
  },
  nextjs: {
    name: "Next.js / React",
    icon: "N",
    steps: [
      "Откройте файл app/layout.tsx или pages/_app.tsx",
      "Импортируйте Script из next/script",
      "Добавьте компонент Script с кодом виджета",
      "Перезапустите dev-сервер"
    ]
  }
}

// DNS registrar info for CNAME setup
const registrarLinks: Record<string, string> = {
  "reg.ru": "https://www.reg.ru/user/account/#/dns/",
  "beget": "https://cp.beget.com/dns",
  "timeweb": "https://hosting.timeweb.ru/domains",
  "godaddy": "https://dcc.godaddy.com/manage/dns",
  "namecheap": "https://ap.www.namecheap.com/domains/list",
  "cloudflare": "https://dash.cloudflare.com/"
}

export default function IntegrationPage() {
  const [widgetId, setWidgetId] = useState("")
  const [copied, setCopied] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [integrationStatus, setIntegrationStatus] = useState<"unknown" | "installed" | "not_found">("unknown")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null)

  useEffect(() => {
    // Get widget ID from localStorage
    const id = localStorage.getItem('nexik_widget_id') || 'nxk_demo123'
    setWidgetId(id)
  }, [])

  const widgetCode = `<script src="https://nexik.io/widget.js" data-id="${widgetId}"></script>`

  const copyCode = () => {
    navigator.clipboard.writeText(widgetCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Check if widget is installed on user's website
  const checkInstallation = async () => {
    if (!websiteUrl) return
    
    setCheckingStatus(true)
    setIntegrationStatus("unknown")
    
    try {
      // In production, this would check if widget is present on the site
      const res = await fetch("/api/nexik/check-integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl, widgetId })
      })
      
      const data = await res.json()
      
      if (data.installed) {
        setIntegrationStatus("installed")
      } else {
        setIntegrationStatus("not_found")
      }
      
      if (data.platform) {
        setDetectedPlatform(data.platform)
        setSelectedPlatform(data.platform)
      }
    } catch {
      setIntegrationStatus("not_found")
    } finally {
      setCheckingStatus(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-0.5 bg-[#00ffff]" />
          <span className="text-[#00ffff] font-mono text-sm">{"// Интеграция"}</span>
        </div>
        <h1 className="text-3xl font-bold">Установка виджета</h1>
        <p className="text-zinc-400 mt-1">
          Добавьте Nexik на ваш сайт за пару минут
        </p>
      </div>

      {/* Widget Code */}
      <div className="rounded-2xl border border-[#1a1a2e] bg-[#0a0a0f]/80 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Код виджета</h2>
            <p className="text-sm text-zinc-500">Добавьте этот код на ваш сайт перед {"</body>"}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-mono">ID: {widgetId}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyCode}
              className="gap-2 border-[#2a2a3e] hover:bg-[#1a1a2e]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#00ff88]" />
                  Скопировано
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Копировать
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="rounded-xl bg-[#12121a] border border-[#2a2a3e] p-4 font-mono text-sm text-[#00ff88] overflow-x-auto">
          {widgetCode}
        </div>
      </div>

      {/* Check Installation */}
      <div className="rounded-2xl border border-[#1a1a2e] bg-[#0a0a0f]/80 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Проверить установку</h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://your-site.com"
              className="w-full bg-[#12121a] border border-[#2a2a3e] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00ffff]/50"
            />
          </div>
          <Button 
            onClick={checkInstallation}
            disabled={!websiteUrl || checkingStatus}
            className="bg-[#00ffff] text-black hover:bg-[#00ffff]/90 gap-2"
          >
            {checkingStatus ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Проверяю...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Проверить
              </>
            )}
          </Button>
        </div>
        
        {integrationStatus === "installed" && (
          <div className="mt-4 p-4 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#00ff88]" />
            <div>
              <p className="font-medium text-[#00ff88]">Виджет установлен!</p>
              <p className="text-sm text-zinc-400">Nexik успешно работает на вашем сайте</p>
            </div>
          </div>
        )}
        
        {integrationStatus === "not_found" && (
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-amber-500" />
            <div>
              <p className="font-medium text-amber-500">Виджет не найден</p>
              <p className="text-sm text-zinc-400">Убедитесь что код добавлен и сайт опубликован</p>
            </div>
          </div>
        )}
        
        {detectedPlatform && (
          <p className="mt-3 text-sm text-zinc-400">
            Обнаружена платформа: <span className="text-[#00ffff] font-medium">{platformInstructions[detectedPlatform]?.name || detectedPlatform}</span>
          </p>
        )}
      </div>

      {/* Platform Instructions */}
      <div className="rounded-2xl border border-[#1a1a2e] bg-[#0a0a0f]/80 overflow-hidden mb-8">
        <div className="p-6 border-b border-[#1a1a2e]">
          <h2 className="text-lg font-semibold">Инструкции по установке</h2>
          <p className="text-sm text-zinc-500">Выберите вашу платформу</p>
        </div>
        
        {/* Platform selector */}
        <div className="p-4 border-b border-[#1a1a2e] flex flex-wrap gap-2">
          {Object.entries(platformInstructions).map(([key, platform]) => (
            <button
              key={key}
              onClick={() => setSelectedPlatform(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                selectedPlatform === key
                  ? "bg-[#00ffff] text-black"
                  : "bg-[#12121a] border border-[#2a2a3e] text-white hover:border-[#00ffff]/50"
              )}
            >
              <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-bold">
                {platform.icon}
              </span>
              {platform.name}
            </button>
          ))}
        </div>
        
        {/* Instructions */}
        {selectedPlatform && (
          <div className="p-6">
            <h3 className="font-semibold mb-4">
              Установка на {platformInstructions[selectedPlatform].name}
            </h3>
            
            <div className="space-y-3 mb-6">
              {platformInstructions[selectedPlatform].steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#00ffff]/20 text-[#00ffff] flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    {i + 1}
                  </span>
                  <p className="text-zinc-300 pt-0.5">{step}</p>
                </div>
              ))}
            </div>
            
            {platformInstructions[selectedPlatform].docsUrl && (
              <a 
                href={platformInstructions[selectedPlatform].docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#00ffff] text-sm hover:underline"
              >
                Официальная документация
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Need Help */}
      <div className="rounded-2xl border border-[#ff00aa]/20 bg-gradient-to-br from-[#ff00aa]/5 to-transparent p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#ff00aa]/20 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-6 h-6 text-[#ff00aa]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Нужна помощь?</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Мы можем установить виджет за вас. Напишите нам, и мы все настроим.
            </p>
            <div className="flex flex-wrap gap-3">
              <a 
                href={`mailto:support@nexik.io?subject=Помощь с установкой&body=Widget ID: ${widgetId}%0A%0AМой сайт: ${websiteUrl || '[укажите URL]'}%0A%0AПлатформа: ${selectedPlatform || '[укажите платформу]'}`}
                target="_blank"
              >
                <Button variant="outline" className="gap-2 border-[#ff00aa]/30 hover:bg-[#ff00aa]/10">
                  <MessageSquare className="w-4 h-4" />
                  Написать в поддержку
                </Button>
              </a>
              <Button variant="outline" className="gap-2 border-[#2a2a3e] hover:bg-[#1a1a2e]">
                <Play className="w-4 h-4" />
                Видео-инструкция
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* NPM Packages */}
      <div className="mt-8 rounded-2xl border border-[#1a1a2e] bg-[#0a0a0f]/80 p-6">
        <h2 className="text-lg font-semibold mb-2">Для разработчиков</h2>
        <p className="text-sm text-zinc-500 mb-4">NPM пакеты для различных фреймворков</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { name: "@nexik/react", framework: "React", cmd: "npm install @nexik/react" },
            { name: "@nexik/next", framework: "Next.js", cmd: "npm install @nexik/next" },
            { name: "@nexik/vue", framework: "Vue", cmd: "npm install @nexik/vue" },
            { name: "@nexik/widget", framework: "Vanilla JS", cmd: "npm install @nexik/widget" },
          ].map((pkg) => (
            <div key={pkg.name} className="p-4 rounded-xl bg-[#12121a] border border-[#2a2a3e]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-[#00ffff]">{pkg.name}</span>
                <span className="text-xs text-zinc-500">{pkg.framework}</span>
              </div>
              <code className="text-xs text-zinc-400">{pkg.cmd}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
