"use client"

import { X, Maximize2, Minimize2, MoreHorizontal, Trash2, RotateCcw, Sparkles } from 'lucide-react'
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
  onSwitchMode,
  onClearHistory,
  onResetSession,
  className,
}: ChatHeaderProps) {
  const isModal = displayConfig.mode === 'modal'
  
  return (
    <div
      className={cn(
        "relative flex items-center justify-between px-5 py-4",
        "border-b border-zinc-700/50",
        "bg-zinc-800/50",
        className
      )}
    >
      {/* Decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />

      {/* Left: Orb + Info */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {/* Glow effect */}
          <div 
            className={cn(
              "absolute inset-0 rounded-full blur-lg transition-opacity duration-500",
              isTyping ? "opacity-60" : "opacity-30"
            )}
            style={{ background: 'radial-gradient(circle, rgba(79,209,197,0.4) 0%, transparent 70%)' }}
          />
          <SiriOrb size={44} isHovered={isTyping} isActive={isTyping} />
          
          {/* Status indicator */}
          <div 
            className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full",
              "border-2 border-background",
              "transition-colors duration-300",
              isConnectedToOperator 
                ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            )}
          />
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">
              {isConnectedToOperator ? 'Оператор' : config.assistantName}
            </span>
            {!isConnectedToOperator && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-teal-500/10">
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span className="text-[10px] font-medium text-teal-400">AI</span>
              </div>
            )}
          </div>
          <span className={cn(
            "text-xs transition-colors duration-300",
            isTyping ? "text-teal-400" : "text-zinc-400"
          )}>
            {isTyping 
              ? 'печатает...' 
              : isConnectedToOperator 
                ? 'на связи' 
                : 'онлайн'
            }
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Mode switcher */}
        {onSwitchMode && (
          <button
            onClick={() => onSwitchMode(isModal ? 'mini' : 'modal')}
            className={cn(
              "p-2.5 rounded-xl",
              "text-zinc-400 hover:text-white",
              "hover:bg-zinc-700/50 active:bg-zinc-700",
              "transition-all duration-200"
            )}
            title={isModal ? "Свернуть" : "Развернуть"}
          >
            {isModal ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "p-2.5 rounded-xl",
                "text-zinc-400 hover:text-white",
                "hover:bg-zinc-700/50 active:bg-zinc-700",
                "transition-all duration-200"
              )}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-52 bg-zinc-900 border-zinc-700"
          >
            {onResetSession && (
              <DropdownMenuItem 
                onClick={onResetSession}
                className="gap-2 cursor-pointer text-zinc-300 hover:text-white"
              >
                <RotateCcw className="w-4 h-4" />
                Новый диалог
              </DropdownMenuItem>
            )}
            {onClearHistory && (
              <DropdownMenuItem 
                onClick={onClearHistory} 
                className="gap-2 cursor-pointer text-red-400 focus:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
                Очистить историю
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-zinc-700" />
            <div className="px-2 py-2 text-xs text-zinc-500">
              Powered by <span className="text-teal-400">{config.companyName}</span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Close */}
        <button
          onClick={onClose}
          className={cn(
            "p-2.5 rounded-xl",
            "text-zinc-400 hover:text-white",
            "hover:bg-zinc-700/50 active:bg-zinc-700",
            "transition-all duration-200"
          )}
          title="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
