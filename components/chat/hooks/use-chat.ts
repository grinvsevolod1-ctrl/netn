"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { ChatMessage, ChatConfig, UseChatOptions, DEFAULT_CHAT_CONFIG } from '../types'

const generateId = () => Math.random().toString(36).substring(2, 15)

const STORAGE_KEY = 'netnext_chat_history'
const SESSION_KEY = 'netnext_chat_session'

export function useChat(options: UseChatOptions) {
  const config: ChatConfig = { ...DEFAULT_CHAT_CONFIG, ...options.config }
  
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isConnectedToOperator, setIsConnectedToOperator] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load history from localStorage
  useEffect(() => {
    if (!config.enableHistory) return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const storedSession = localStorage.getItem(SESSION_KEY)
      
      if (stored) {
        const parsed = JSON.parse(stored) as ChatMessage[]
        const limited = parsed.slice(-(config.maxHistoryMessages || 50))
        setMessages(limited.map(m => ({ ...m, timestamp: new Date(m.timestamp) })))
      }
      
      if (storedSession) {
        setSessionId(storedSession)
      } else {
        const newSession = generateId()
        setSessionId(newSession)
        localStorage.setItem(SESSION_KEY, newSession)
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [config.enableHistory, config.maxHistoryMessages])

  // Save history to localStorage
  useEffect(() => {
    if (!config.enableHistory || messages.length === 0) return
    
    try {
      const limited = messages.slice(-(config.maxHistoryMessages || 50))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
    } catch {
      // Ignore localStorage errors
    }
  }, [messages, config.enableHistory, config.maxHistoryMessages])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return
    
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      status: 'sent',
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)
    setError(null)
    
    options.onMessageSent?.(userMessage)
    
    try {
      abortControllerRef.current = new AbortController()
      
      const response = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          sessionId,
          context: {
            companyName: config.companyName,
            isConnectedToOperator,
          },
          previousMessages: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      })
      
      if (!response.ok) {
        throw new Error('Ошибка сервера')
      }
      
      const data = await response.json()
      
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.text || data.response || data.message || 'Извините, произошла ошибка.',
        timestamp: new Date(),
        actions: data.buttons || data.suggestedActions,
        status: 'delivered',
      }
      
      setMessages(prev => [...prev, assistantMessage])
      options.onMessageReceived?.(assistantMessage)
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request was cancelled
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка'
      setError(errorMessage)
      options.onError?.(errorMessage)
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте позже или свяжитесь с нами напрямую.',
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
      abortControllerRef.current = null
    }
  }, [config, sessionId, isConnectedToOperator, messages, options])

  const connectToOperator = useCallback(async () => {
    setIsConnectedToOperator(true)
    options.onOperatorConnected?.()
    
    const systemMessage: ChatMessage = {
      id: generateId(),
      role: 'system',
      content: 'Вы подключены к оператору. Ожидайте ответа.',
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, systemMessage])
  }, [options])

  const clearHistory = useCallback(() => {
    setMessages([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore
    }
  }, [])

  const resetSession = useCallback(() => {
    clearHistory()
    setIsConnectedToOperator(false)
    setError(null)
    
    const newSession = generateId()
    setSessionId(newSession)
    try {
      localStorage.setItem(SESSION_KEY, newSession)
    } catch {
      // Ignore
    }
  }, [clearHistory])

  return {
    messages,
    isTyping,
    isConnectedToOperator,
    sessionId,
    error,
    sendMessage,
    connectToOperator,
    clearHistory,
    resetSession,
    config,
  }
}
