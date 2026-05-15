"use client"

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChatMessage as ChatMessageType, ChatConfig } from './types'
import { ChatMessage } from './chat-message'
import { ChatTyping } from './chat-typing'
import { ChatWelcome } from './chat-welcome'

interface ChatMessagesProps {
  messages: ChatMessageType[]
  config: ChatConfig
  isTyping: boolean
  onQuickAction?: (action: { id: string; label: string; action: string }) => void
  onSendMessage?: (message: string) => void
  className?: string
}

export function ChatMessages({
  messages,
  config,
  isTyping,
  onQuickAction,
  onSendMessage,
  className,
}: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Show welcome screen if no messages
  if (messages.length === 0 && !isTyping) {
    return (
      <div className={cn("flex-1 overflow-hidden", className)}>
        <ChatWelcome 
          config={config} 
          onQuickAction={onQuickAction}
          onSendMessage={onSendMessage}
        />
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden",
        "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50",
        className
      )}
    >
      {/* Messages */}
      <div className="py-4">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            config={config}
            isLast={index === messages.length - 1 && !isTyping}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && <ChatTyping />}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
