"use client"

import { useEffect, useRef } from "react"
import { ArrowRight, Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GeneratorWidget } from "@/components/site-generator"

interface HeroSectionProps {
  onNavigate: (section: string) => void
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const words = ["сайты", "рекламу", "приложения", "бизнес"]
    let wordIndex = 0
    let charIndex = 0
    let isDeleting = false
    let timerId: ReturnType<typeof setTimeout>

    const type = () => {
      if (!textRef.current) return

      const currentWord = words[wordIndex]
      
      if (isDeleting) {
        textRef.current.textContent = currentWord.substring(0, charIndex - 1)
        charIndex--
      } else {
        textRef.current.textContent = currentWord.substring(0, charIndex + 1)
        charIndex++
      }

      let timeout = isDeleting ? 50 : 100

      if (!isDeleting && charIndex === currentWord.length) {
        timeout = 2000
        isDeleting = true
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false
        wordIndex = (wordIndex + 1) % words.length
        timeout = 500
      }

      timerId = setTimeout(type, timeout)
    }

    type()
    return () => clearTimeout(timerId)
  }, [])

  return (
    <section id="hero" className="min-h-[100svh] flex items-center justify-center relative overflow-hidden -mt-14 md:mt-0 pt-16 md:pt-0">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-40 md:w-80 h-40 md:h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-20 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">
          {/* Left column - text content */}
          <div className="flex-1 text-center lg:text-left">
<h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 md:mb-6 text-balance">
              <span className="text-foreground">Мы создаём</span>
              <br />
              <span className="text-primary">
                <span ref={textRef}>сайты</span>
                <span className="animate-pulse">|</span>
              </span>
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-pretty px-2 md:px-0">
              Превращаем идеи в работающий бизнес. Разработка сайтов, запуск рекламы 
              и полное digital-сопровождение — от первого клика до первой продажи.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start px-4 sm:px-0">
              <Button 
                size="lg" 
                className="group text-sm md:text-base px-6 md:px-8 h-11 md:h-12"
                onClick={() => onNavigate("contact")}
              >
                Обсудить проект
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-sm md:text-base px-6 md:px-8 h-11 md:h-12 bg-transparent"
                onClick={() => onNavigate("services")}
              >
                <Code2 className="mr-2 w-4 h-4" />
                Наши услуги
              </Button>
            </div>

            <div className="mt-12 md:mt-16 grid grid-cols-3 gap-4 md:gap-8 max-w-sm md:max-w-lg mx-auto lg:mx-0">
              {[
                { value: "10+", label: "Крупных клиентов" },
                { value: "10М+ Br", label: "Рекламных бюджетов" },
                { value: "5 лет", label: "Опыта" },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Site Generator Widget (desktop) */}
          <div className="hidden lg:block flex-1 max-w-md xl:max-w-lg">
            <GeneratorWidget />
          </div>

          {/* Mobile Generator CTA */}
          <div className="lg:hidden w-full max-w-sm mx-auto">
            <GeneratorWidget variant="compact" />
          </div>
        </div>
      </div>


    </section>
  )
}
