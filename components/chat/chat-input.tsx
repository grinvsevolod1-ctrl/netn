"use client"

import { useState, useRef, useCallback, KeyboardEvent } from 'react'
import { Send, Paperclip, Mic } from 'lucide-react'
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
    
    // Reset textarea height
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

  return (
    <div className={cn("p-3 border-t border-border/50", className)}>
      {/* Input container with gradient border on focus */}
      <div 
        className={cn(
          "relative rounded-2xl transition-all duration-300",
          isFocused && "ring-2 ring-primary/20"
        )}
      >
        {/* Gradient border effect */}
        <div 
          className={cn(
            "absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-300",
            "bg-gradient-to-r from-primary via-primary/50 to-primary",
            isFocused && "opacity-100"
          )}
        />
        
        {/* Inner container */}
        <div className="relative flex items-end gap-2 p-2 bg-accent/30 rounded-2xl">
          {/* Attachment button */}
          <button
            type="button"
            className="flex-shrink-0 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            disabled={disabled}
            title="Прикрепить файл"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text input */}
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
              "flex-1 bg-transparent resize-none outline-none",
              "text-sm text-foreground placeholder:text-muted-foreground/60",
              "max-h-[120px] py-2 px-1",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          />

          {/* Voice input button */}
          <button
            type="button"
            className="flex-shrink-0 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            disabled={disabled}
            title="Голосовой ввод"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className={cn(
              "flex-shrink-0 p-2.5 rounded-xl transition-all duration-200",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              value.trim() 
                ? "bg-primary text-primary-foreground hover:bg-primary/90 scale-100" 
                : "bg-accent text-muted-foreground scale-95"
            )}
            title="Отправить"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hint */}
      <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
        Enter - отправить, Shift+Enter - новая строка
      </p>
    </div>
  )
}
