"use client"

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ChatConfig, ChatDisplayConfig, ChatAction, DEFAULT_CHAT_CONFIG, DEFAULT_DISPLAY_CONFIG } from './types'
import { useChat } from './hooks/use-chat'
import { useChatUI } from './hooks/use-chat-ui'
import { ChatContainer } from './chat-container'
import { ChatHeader } from './chat-header'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'

// Re-export types and hooks
export * from './types'
export { useChat } from './hooks/use-chat'
export { useChatUI } from './hooks/use-chat-ui'

interface ChatProps {
  config?: Partial<ChatConfig>
  displayConfig?: Partial<ChatDisplayConfig>
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
  className?: string
}

export function Chat({
  config: configOverride,
  displayConfig: displayConfigOverride,
  isOpen: controlledIsOpen,
  onOpenChange,
  className,
}: ChatProps) {
  // Merge configs with defaults
  const config: ChatConfig = { ...DEFAULT_CHAT_CONFIG, ...configOverride }
  const initialDisplayConfig: ChatDisplayConfig = { ...DEFAULT_DISPLAY_CONFIG, ...displayConfigOverride }

  // Chat logic
  const {
    messages,
    isTyping,
    isConnectedToOperator,
    sendMessage,
    connectToOperator,
    clearHistory,
    resetSession,
  } = useChat({ config })

  // UI state
  const {
    displayConfig,
    isOpen: internalIsOpen,
    openChat,
    closeChat,
    switchMode,
    updateDisplayConfig,
  } = useChatUI(initialDisplayConfig)

  // Support controlled and uncontrolled mode
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
  
  const handleClose = useCallback(() => {
    if (onOpenChange) {
      onOpenChange(false)
    } else {
      closeChat()
    }
  }, [onOpenChange, closeChat])

  const handleOpen = useCallback(() => {
    if (onOpenChange) {
      onOpenChange(true)
    } else {
      openChat()
    }
  }, [onOpenChange, openChat])

  const handleQuickAction = useCallback((action: ChatAction) => {
    if (action.action === 'operator') {
      connectToOperator()
    } else if (action.action === 'consultation') {
      sendMessage('Хочу записаться на консультацию')
    } else {
      // Custom action - just send as message
      sendMessage(action.label)
    }
  }, [connectToOperator, sendMessage])

  const handleSwitchMode = useCallback((mode: ChatDisplayConfig['mode']) => {
    updateDisplayConfig({ mode })
    switchMode(mode)
  }, [updateDisplayConfig, switchMode])

  return (
    <ChatContainer
      displayConfig={displayConfig}
      isOpen={isOpen}
      onClose={handleClose}
      className={className}
    >
      {/* Header */}
      <ChatHeader
        config={config}
        displayConfig={displayConfig}
        isTyping={isTyping}
        isConnectedToOperator={isConnectedToOperator}
        onClose={handleClose}
        onSwitchMode={handleSwitchMode}
        onClearHistory={clearHistory}
        onResetSession={resetSession}
      />

      {/* Messages */}
      <ChatMessages
        messages={messages}
        config={config}
        isTyping={isTyping}
        onQuickAction={handleQuickAction}
        onSendMessage={sendMessage}
      />

      {/* Input */}
      <ChatInput
        config={config}
        onSend={sendMessage}
        disabled={isTyping}
      />
    </ChatContainer>
  )
}

// Convenience component for just the trigger button
interface ChatTriggerProps {
  onClick: () => void
  children: React.ReactNode
  className?: string
}

export function ChatTrigger({ onClick, children, className }: ChatTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed z-40",
        className
      )}
    >
      {children}
    </button>
  )
}
