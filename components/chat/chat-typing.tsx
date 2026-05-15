"use client"

import { cn } from '@/lib/utils'
import { SiriOrb } from '@/components/ai-orb'

interface ChatTypingProps {
  className?: string
}

export function ChatTyping({ className }: ChatTypingProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 animate-in fade-in slide-in-from-left-2 duration-300",
        className
      )}
    >
      {/* Mini orb as typing indicator */}
      <div className="flex-shrink-0">
        <SiriOrb size={32} isHovered={true} isActive={true} />
      </div>

      {/* Typing text */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>Печатает</span>
        <span className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
          <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
          <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
        </span>
      </div>
    </div>
  )
}
