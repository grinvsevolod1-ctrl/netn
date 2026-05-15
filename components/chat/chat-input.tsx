"use client"

import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { Send, Paperclip, Smile, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatConfig } from './types'

interface ChatInputProps {
  config: ChatConfig
  onSend: (message: string) => void
  disabled?: boolean
  className?: string
}

export function ChatInput({ config, onSend, disabled, className }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    if (!value.trim() || disabled) return
    onSend(value.trim())
    setValue('')
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, disabled, onSend])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  const hasContent = value.trim().length > 0

  return (
    <div className={cn("relative px-4 pb-4 pt-2", className)}>
      {/* Gradient border effect container */}
      <div 
        className={cn(
          "relative rounded-2xl transition-all duration-300",
          isFocused && "shadow-[0_0_30px_-10px_rgba(79,209,197,0.3)]"
        )}
      >
        {/* Animated gradient border */}
        <div 
          className={cn(
            "absolute -inset-px rounded-2xl transition-opacity duration-300",
            "bg-gradient-to-r from-primary/50 via-primary to-primary/50",
            "opacity-0",
            isFocused && "opacity-100"
          )}
          style={{
            backgroundSize: '200% 100%',
            animation: isFocused ? 'gradient-shift 3s ease infinite' : 'none',
          }}
        />
        
        {/* Inner container */}
        <div className={cn(
          "relative flex items-end gap-2 p-3 rounded-2xl",
          "bg-zinc-800/80",
          "border border-zinc-700/50",
          isFocused && "border-transparent"
        )}>
          {/* Attachment button */}
          <button
            type="button"
            className={cn(
              "flex-shrink-0 p-2 rounded-xl",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-white/10 active:bg-white/15",
              "transition-all duration-200",
              "disabled:opacity-40 disabled:pointer-events-none"
            )}
            disabled={disabled}
            title="Прикрепить файл"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={config.placeholder || 'Напишите сообщение...'}
              disabled={disabled}
              rows={1}
              className={cn(
                "w-full bg-transparent resize-none outline-none",
                "text-sm text-foreground placeholder:text-muted-foreground/50",
                "max-h-[120px] py-2 pr-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            />
          </div>

          {/* Emoji button */}
          <button
            type="button"
            className={cn(
              "flex-shrink-0 p-2 rounded-xl",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-white/10 active:bg-white/15",
              "transition-all duration-200",
              "disabled:opacity-40 disabled:pointer-events-none"
            )}
            disabled={disabled}
            title="Эмодзи"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!hasContent || disabled}
            className={cn(
              "flex-shrink-0 p-2.5 rounded-xl",
              "transition-all duration-300",
              "disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-95",
              hasContent ? [
                "bg-gradient-to-r from-primary to-primary/80",
                "text-primary-foreground",
                "shadow-lg shadow-primary/25",
                "hover:shadow-xl hover:shadow-primary/30",
                "hover:scale-105 active:scale-95",
              ] : [
                "bg-white/5",
                "text-muted-foreground/50",
              ]
            )}
            title="Отправить"
          >
            <Send className={cn(
              "w-5 h-5 transition-transform duration-300",
              hasContent && "-rotate-45"
            )} />
          </button>
        </div>
      </div>

      {/* AI hint */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <Sparkles className="w-3 h-3 text-primary/40" />
        <p className="text-[10px] text-muted-foreground/40">
          AI-ассистент от {config.companyName}
        </p>
      </div>

      {/* Gradient animation keyframes */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}
