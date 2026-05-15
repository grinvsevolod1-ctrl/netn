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
    <div className={cn("relative px-4 pb-4 pt-2 bg-zinc-900", className)}>
      {/* Input container */}
      <div 
        className={cn(
          "relative rounded-2xl transition-all duration-300",
          isFocused && "shadow-[0_0_30px_-10px_rgba(79,209,197,0.3)]"
        )}
      >
        {/* Animated gradient border when focused */}
        {isFocused && (
          <div 
            className="absolute -inset-px rounded-2xl bg-gradient-to-r from-teal-500/50 via-teal-400 to-teal-500/50"
            style={{
              backgroundSize: '200% 100%',
              animation: 'gradient-shift 3s ease infinite',
            }}
          />
        )}
        
        {/* Inner container */}
        <div className={cn(
          "relative flex items-end gap-2 p-3 rounded-2xl",
          "bg-zinc-800",
          "border",
          isFocused ? "border-transparent" : "border-zinc-700"
        )}>
          {/* Attachment button */}
          <button
            type="button"
            className={cn(
              "flex-shrink-0 p-2 rounded-xl",
              "text-zinc-400 hover:text-white",
              "hover:bg-zinc-700 active:bg-zinc-600",
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
                "text-sm text-white placeholder:text-zinc-500",
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
              "text-zinc-400 hover:text-white",
              "hover:bg-zinc-700 active:bg-zinc-600",
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
                "bg-gradient-to-r from-teal-500 to-teal-600",
                "text-white",
                "shadow-lg shadow-teal-500/25",
                "hover:shadow-xl hover:shadow-teal-500/30",
                "hover:scale-105 active:scale-95",
              ] : [
                "bg-zinc-700",
                "text-zinc-500",
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
        <Sparkles className="w-3 h-3 text-teal-500/40" />
        <p className="text-[10px] text-zinc-500">
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
