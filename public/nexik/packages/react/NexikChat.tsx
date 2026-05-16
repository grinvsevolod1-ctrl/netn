"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface NexikChatProps {
  clientId: string
  position?: "bottom-right" | "bottom-left"
  color?: string
  greeting?: string
  botName?: string
  autoOpen?: boolean
  onMessage?: (message: string, response: string) => void
  onOpen?: () => void
  onClose?: () => void
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const defaultStyles = `
  .nexik-widget {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    z-index: 999999;
  }
  .nexik-orb {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(0, 255, 255, 0.3);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .nexik-orb:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 30px rgba(0, 255, 255, 0.4);
  }
  .nexik-chat {
    width: 380px;
    height: 520px;
    border-radius: 16px;
    background: #0a0a0f;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .nexik-header {
    padding: 16px;
    background: #0d0d14;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .nexik-avatar {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .nexik-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .nexik-message {
    max-width: 85%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
  }
  .nexik-message-user {
    background: #00ffff;
    color: #000;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
  }
  .nexik-message-assistant {
    background: #1a1a2e;
    color: #fff;
    align-self: flex-start;
    border-bottom-left-radius: 4px;
  }
  .nexik-input-area {
    padding: 16px;
    background: #0d0d14;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    gap: 8px;
  }
  .nexik-input {
    flex: 1;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: #12121a;
    color: #fff;
    font-size: 14px;
    outline: none;
  }
  .nexik-input:focus {
    border-color: rgba(0, 255, 255, 0.5);
  }
  .nexik-send {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
  }
  .nexik-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export function NexikChat({
  clientId,
  position = "bottom-right",
  color = "#00ffff",
  greeting = "Привет! Чем могу помочь?",
  botName = "Nexik",
  autoOpen = false,
  onMessage,
  onOpen,
  onClose
}: NexikChatProps) {
  const [isOpen, setIsOpen] = useState(autoOpen)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    // Add default styles
    if (!document.getElementById("nexik-styles")) {
      const style = document.createElement("style")
      style.id = "nexik-styles"
      style.textContent = defaultStyles
      document.head.appendChild(style)
    }

    // Add greeting message
    if (messages.length === 0) {
      setMessages([{
        id: "greeting",
        role: "assistant",
        content: greeting,
        timestamp: new Date()
      }])
    }
  }, [greeting, messages.length])

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    onOpen?.()
  }, [onOpen])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    onClose?.()
  }, [onClose])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const baseUrl = window.location.hostname === "localhost" 
        ? "/api/nexik/chat"
        : "https://nexik.io/api/nexik/chat"

      const response = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          message: userMessage.content,
          sessionId: sessionId.current,
          previousMessages: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: `msg_${Date.now()}_resp`,
        role: "assistant",
        content: data.text || data.response || "Извините, произошла ошибка.",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      onMessage?.(userMessage.content, assistantMessage.content)
    } catch (error) {
      const errorMessage: Message = {
        id: `msg_${Date.now()}_err`,
        role: "assistant",
        content: "Извините, не удалось отправить сообщение. Попробуйте позже.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, clientId, messages, onMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const positionStyles = position === "bottom-right" 
    ? { right: "20px", bottom: "20px" }
    : { left: "20px", bottom: "20px" }

  return (
    <div className="nexik-widget" style={{ position: "fixed", ...positionStyles }}>
      {!isOpen ? (
        <button
          className="nexik-orb"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}
          onClick={handleOpen}
          aria-label="Open chat"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      ) : (
        <div className="nexik-chat">
          <div className="nexik-header">
            <div className="nexik-avatar" style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: "#fff" }}>{botName}</div>
              <div style={{ fontSize: "12px", color: color }}>Онлайн</div>
            </div>
            <button
              onClick={handleClose}
              style={{ background: "none", border: "none", color: "#666", cursor: "pointer", padding: "8px" }}
              aria-label="Close chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="nexik-messages" ref={messagesRef}>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`nexik-message nexik-message-${msg.role}`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="nexik-message nexik-message-assistant">
                <div style={{ display: "flex", gap: "4px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, animation: "bounce 1s infinite" }} />
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, animation: "bounce 1s infinite 0.1s" }} />
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, animation: "bounce 1s infinite 0.2s" }} />
                </div>
              </div>
            )}
          </div>

          <div className="nexik-input-area">
            <input
              className="nexik-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Напишите сообщение..."
              disabled={isLoading}
            />
            <button
              className="nexik-send"
              style={{ background: color }}
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NexikChat
