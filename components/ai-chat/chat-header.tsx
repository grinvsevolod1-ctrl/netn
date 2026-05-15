"use client"

import { X, User, Headphones } from "lucide-react"
import { NNAssistantIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatHeaderProps {
  operatorConnected: boolean
  onClose: () => void
}

export function ChatHeader({ operatorConnected, onClose }: ChatHeaderProps) {
  return (
    <>
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center",
              operatorConnected
                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                : "bg-gradient-to-br from-primary to-accent"
            )}>
              {operatorConnected ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <NNAssistantIcon className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-card" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground leading-tight">
              {operatorConnected ? "Оператор NetNext" : "NetNext AI"}
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {operatorConnected ? "Отвечает живой человек" : "Онлайн"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Закрыть чат"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Operator banner */}
      {operatorConnected && (
        <div className="bg-green-500/10 border-b border-green-500/20 px-4 py-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400 shrink-0">
          <Headphones className="w-3.5 h-3.5" />
          <span>Вы общаетесь с оператором</span>
        </div>
      )}
    </>
  )
}
