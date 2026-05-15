"use client"

import { NNAssistantIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

interface ChatWelcomeProps {
  onSend: (content: string) => void
}

const welcomePrompts = [
  "Какие у вас услуги?",
  "Сколько стоит сайт?",
  "Покажите работы",
  "Как вы работаете?",
]

export function ChatWelcome({ onSend }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 py-6">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center">
        <NNAssistantIcon className="w-7 h-7 text-primary" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-base mb-1.5">AI-ассистент NetNext</h3>
        <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
          Задайте вопрос или выберите тему
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
        {welcomePrompts.map((s) => (
          <button
            key={s}
            onClick={() => onSend(s)}
            className={cn(
              "text-left text-[13px] p-3 rounded-xl border border-border/50",
              "bg-secondary/30 hover:bg-secondary/60 hover:border-primary/20",
              "transition-colors text-muted-foreground hover:text-foreground leading-snug"
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
