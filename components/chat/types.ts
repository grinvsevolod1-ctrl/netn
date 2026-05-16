export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isTyping?: boolean
  actions?: ChatAction[]
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error'
}

export interface ChatAction {
  id: string
  label: string
  icon?: string
  action: 'consultation' | 'call' | 'email' | 'operator' | 'custom'
  data?: Record<string, unknown>
}

export interface ChatConfig {
  // Branding
  companyName: string
  assistantName: string
  assistantAvatar?: string
  primaryColor?: string
  userName?: string
  
  // Behavior
  welcomeMessage: string
  quickActions?: ChatAction[]
  placeholder?: string
  
  // API
  apiEndpoint: string
  clientId?: string
  
  // Features
  showOperatorButton?: boolean
  showTimestamp?: boolean
  enableSounds?: boolean
  enableHistory?: boolean
  maxHistoryMessages?: number
}

export interface ChatDisplayConfig {
  mode: 'modal' | 'mini' | 'inline'
  modalSize: 'sm' | 'md' | 'lg' | 'xl' // 50%, 60%, 70%, 80%
  position: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  mobileFullscreen: boolean
}

export interface ChatState {
  messages: ChatMessage[]
  isOpen: boolean
  isTyping: boolean
  isConnectedToOperator: boolean
  sessionId: string | null
  error: string | null
}

export interface UseChatOptions {
  config: ChatConfig
  displayConfig?: ChatDisplayConfig
  onMessageSent?: (message: ChatMessage) => void
  onMessageReceived?: (message: ChatMessage) => void
  onOperatorConnected?: () => void
  onError?: (error: string) => void
}

// Default configs
export const DEFAULT_DISPLAY_CONFIG: ChatDisplayConfig = {
  mode: 'modal',
  modalSize: 'lg', // 70%
  position: 'center',
  mobileFullscreen: true,
}

export const DEFAULT_CHAT_CONFIG: ChatConfig = {
  companyName: 'NetNext',
  assistantName: 'Nexik',
  welcomeMessage: 'Привет! Я Nexik. Чем могу помочь?',
  placeholder: 'Напишите сообщение...',
  apiEndpoint: '/api/chat/ai',
  showOperatorButton: true,
  showTimestamp: false,
  enableSounds: false,
  enableHistory: true,
  maxHistoryMessages: 50,
}
