"use client"

import { MessageSquare, Calendar, Headphones, ArrowRight, Sparkles, Zap } from 'lucide-react'
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
  Headphones,
  Zap,
}

export function ChatWelcome({ config, onQuickAction, className }: ChatWelcomeProps) {
  const quickActions = config.quickActions || defaultQuickActions

  const handleAction = (action: ChatAction) => {
    if (onQuickAction) {
      onQuickAction(action)
    }
  }

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center flex-1 p-6 bg-zinc-900",
        "animate-in fade-in duration-500",
        className
      )}
    >
      {/* Orb with glow */}
      <div className="relative mb-8">
        {/* Ambient glow */}
        <div 
          className="absolute inset-[-30px] rounded-full opacity-50 blur-2xl"
          style={{ 
            background: 'radial-gradient(circle, rgba(79,209,197,0.3) 0%, transparent 70%)' 
          }}
        />
        <SiriOrb size={100} isHovered={true} />
      </div>

      {/* Welcome content */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <h3 className="text-xl font-semibold text-white">
            {config.assistantName}
          </h3>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wide">AI</span>
          </div>
        </div>
        <p className="text-sm text-zinc-400 max-w-[300px] leading-relaxed">
          {config.welcomeMessage}
        </p>
      </div>

      {/* Quick actions */}
      <div className="w-full max-w-[340px] space-y-3">
        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider text-center mb-4">
          Быстрые действия
        </p>
        
        {quickActions.map((action, index) => {
          const Icon = action.icon ? iconMap[action.icon] : MessageSquare
          
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              className={cn(
                "group w-full flex items-center gap-4 p-4 rounded-2xl",
                "bg-zinc-800 hover:bg-zinc-750",
                "border border-zinc-700 hover:border-teal-500/30",
                "text-left transition-all duration-300",
                "hover:shadow-lg hover:shadow-teal-500/10",
                "hover:translate-x-1",
                "animate-in fade-in slide-in-from-bottom-2",
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon container */}
              <div className={cn(
                "flex-shrink-0 w-11 h-11 rounded-xl",
                "bg-gradient-to-br from-teal-500/20 to-teal-500/5",
                "border border-teal-500/20",
                "flex items-center justify-center",
                "group-hover:from-teal-500/30 group-hover:to-teal-500/10",
                "group-hover:border-teal-500/30",
                "transition-all duration-300",
                "group-hover:shadow-lg group-hover:shadow-teal-500/20"
              )}>
                <Icon className="w-5 h-5 text-teal-400" />
              </div>
              
              {/* Label */}
              <span className="flex-1 text-sm font-medium text-white group-hover:text-teal-400 transition-colors">
                {action.label}
              </span>

              {/* Arrow */}
              <ArrowRight className={cn(
                "w-4 h-4 text-zinc-500",
                "group-hover:text-teal-400 group-hover:translate-x-1",
                "transition-all duration-300"
              )} />
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-10 text-zinc-600">
        <div className="w-8 h-px bg-gradient-to-r from-transparent to-zinc-700" />
        <span className="text-[10px]">Powered by {config.companyName}</span>
        <div className="w-8 h-px bg-gradient-to-l from-transparent to-zinc-700" />
      </div>
    </div>
  )
}
