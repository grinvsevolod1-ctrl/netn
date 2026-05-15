"use client"

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ChatMessage as ChatMessageType, ChatConfig } from './types'
import { User, Bot, AlertCircle } from 'lucide-react'

interface ChatMessageProps {
  message: ChatMessageType
  config: ChatConfig
  isLast?: boolean
  className?: string
}

export function ChatMessage({ message, config, isLast, className }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  
  const formattedTime = useMemo(() => {
    if (!config.showTimestamp) return null
    return message.timestamp.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }, [message.timestamp, config.showTimestamp])

  // System message (operator connected, etc.)
  if (isSystem) {
    return (
      <div 
        className={cn(
          "flex justify-center py-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
          className
        )}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 text-xs text-muted-foreground">
          <AlertCircle className="w-3 h-3" />
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-2 animate-in fade-in duration-300",
        isUser ? "justify-end slide-in-from-right-2" : "justify-start slide-in-from-left-2",
        isLast && "pb-4",
        className
      )}
    >
      {/* Avatar - only for assistant */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          "relative max-w-[80%] rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-accent/50 text-foreground rounded-bl-md"
        )}
      >
        {/* Content */}
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>

        {/* Timestamp */}
        {formattedTime && (
          <span 
            className={cn(
              "block text-[10px] mt-1",
              isUser ? "text-primary-foreground/60" : "text-muted-foreground"
            )}
          >
            {formattedTime}
          </span>
        )}

        {/* Quick actions from AI */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-border/30">
            {message.actions.map((action) => (
              <button
                key={action.id}
                className="px-3 py-1 text-xs rounded-full bg-background/50 hover:bg-background text-foreground transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Avatar - only for user */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
      )}
    </div>
  )
}
