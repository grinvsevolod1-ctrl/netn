"use client"

import { X, Minus, Maximize2, Minimize2, MoreVertical, Trash2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SiriOrb } from '@/components/ai-orb'
import { ChatConfig, ChatDisplayConfig } from './types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ChatHeaderProps {
  config: ChatConfig
  displayConfig: ChatDisplayConfig
  isTyping: boolean
  isConnectedToOperator: boolean
  onClose: () => void
  onMinimize?: () => void
  onSwitchMode?: (mode: ChatDisplayConfig['mode']) => void
  onClearHistory?: () => void
  onResetSession?: () => void
  className?: string
}

export function ChatHeader({
  config,
  displayConfig,
  isTyping,
  isConnectedToOperator,
  onClose,
  onMinimize,
  onSwitchMode,
  onClearHistory,
  onResetSession,
  className,
}: ChatHeaderProps) {
  const isModal = displayConfig.mode === 'modal'
  
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-b border-border/50",
        "bg-gradient-to-r from-background via-background to-background/95",
        className
      )}
    >
      {/* Left: Orb + Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <SiriOrb size={36} isHovered={isTyping} isActive={isTyping} />
          
          {/* Online indicator */}
          <div 
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
              isConnectedToOperator ? "bg-blue-500" : "bg-emerald-500"
            )}
          />
        </div>
        
        <div className="flex flex-col">
          <span className="font-medium text-sm text-foreground">
            {isConnectedToOperator ? 'Оператор' : config.assistantName}
          </span>
          <span className="text-xs text-muted-foreground">
            {isTyping 
              ? 'печатает...' 
              : isConnectedToOperator 
                ? 'Подключен' 
                : 'Онлайн'
            }
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Mode switcher - only in modal */}
        {isModal && onSwitchMode && (
          <button
            onClick={() => onSwitchMode('mini')}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            title="Свернуть в мини-режим"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        )}
        
        {!isModal && onSwitchMode && (
          <button
            onClick={() => onSwitchMode('modal')}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            title="Развернуть"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {/* Minimize - only in modal */}
        {isModal && onMinimize && (
          <button
            onClick={onMinimize}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            title="Свернуть"
          >
            <Minus className="w-4 h-4" />
          </button>
        )}

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onResetSession && (
              <DropdownMenuItem onClick={onResetSession}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Новый диалог
              </DropdownMenuItem>
            )}
            {onClearHistory && (
              <DropdownMenuItem onClick={onClearHistory} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Очистить историю
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Powered by {config.companyName}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Close */}
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          title="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
