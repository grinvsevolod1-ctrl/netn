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
    <section id="hero" className="min-h-[100svh] flex items-center justify-center relative overflow-hidden pt-20 pb-8 md:pt-0 md:pb-0">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-40 sm:w-56 md:w-80 h-40 sm:h-56 md:h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-20 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 sm:gap-10 lg:gap-16">
          {/* Left column - text content */}
          <div className="flex-1 text-center lg:text-left">
<h1 className="text-[1.75rem] leading-[1.2] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 text-balance">
              <span className="text-foreground">Мы создаём</span>
              <br />
              <span className="text-primary">
                <span ref={textRef}>сайты</span>
                <span className="animate-pulse">|</span>
              </span>
            </h1>

            <p className="text-[15px] sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-pretty">
              Превращаем идеи в работающий бизнес. Разработка сайтов, запуск рекламы 
              и полное digital-сопровождение — от первого клика до первой продажи.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="group text-sm sm:text-base px-5 sm:px-6 md:px-8 h-11 sm:h-12 w-full sm:w-auto"
                onClick={() => onNavigate("contact")}
              >
                Обсудить проект
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-sm sm:text-base px-5 sm:px-6 md:px-8 h-11 sm:h-12 bg-transparent w-full sm:w-auto"
                onClick={() => onNavigate("services")}
              >
                <Code2 className="mr-2 w-4 h-4" />
                Наши услуги
              </Button>
            </div>

            <div className="mt-8 sm:mt-12 md:mt-16 grid grid-cols-3 gap-3 sm:gap-4 md:gap-8 max-w-xs sm:max-w-sm md:max-w-lg mx-auto lg:mx-0">
              {[
                { value: "10+", label: "Клиентов" },
                { value: "10М+", label: "Рекламы" },
                { value: "5 лет", label: "Опыта" },
              ].map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground leading-tight mt-0.5">{stat.label}</div>
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
