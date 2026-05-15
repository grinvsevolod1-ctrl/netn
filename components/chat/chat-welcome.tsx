"use client"

import { MessageSquare, Calendar, Phone, Headphones } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SiriOrb } from '@/components/ai-orb'
import { ChatConfig, ChatAction } from './types'

interface ChatWelcomeProps {
  config: ChatConfig
  onQuickAction?: (action: ChatAction) => void
  onSendMessage?: (message: string) => void
  className?: string
}

const defaultQuickActions: ChatAction[] = [
  { id: '1', label: 'Узнать об услугах', action: 'custom', icon: 'MessageSquare' },
  { id: '2', label: 'Записаться на консультацию', action: 'consultation', icon: 'Calendar' },
  { id: '3', label: 'Связаться с оператором', action: 'operator', icon: 'Headphones' },
]

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  Calendar,
  Phone,
  Headphones,
}

export function ChatWelcome({ config, onQuickAction, onSendMessage, className }: ChatWelcomeProps) {
  const quickActions = config.quickActions || defaultQuickActions

  const handleAction = (action: ChatAction) => {
    if (onQuickAction) {
      onQuickAction(action)
    }
    
    // Also send as message for context
    if (onSendMessage && action.label) {
      onSendMessage(action.label)
    }
  }

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center flex-1 p-6 text-center",
        "animate-in fade-in duration-500",
        className
      )}
    >
      {/* Animated orb */}
      <div className="mb-6">
        <SiriOrb size={80} isHovered={false} />
      </div>

      {/* Welcome text */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {config.assistantName}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[280px] mb-8">
        {config.welcomeMessage}
      </p>

      {/* Quick action cards */}
      <div className="w-full max-w-[320px] space-y-2">
        <p className="text-xs text-muted-foreground/70 mb-3">
          Быстрые действия
        </p>
        
        {quickActions.map((action) => {
          const Icon = action.icon ? iconMap[action.icon] : MessageSquare
          
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl",
                "bg-accent/30 hover:bg-accent/50 border border-border/50",
                "text-left transition-all duration-200",
                "hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5",
                "group"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-lg",
                "bg-primary/10 group-hover:bg-primary/20",
                "flex items-center justify-center transition-colors"
              )}>
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {action.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Powered by */}
      <p className="text-[10px] text-muted-foreground/40 mt-8">
        Powered by {config.companyName}
      </p>
    </div>
  )
}
