"use client"

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChatDisplayConfig } from './types'

interface ChatContainerProps {
  displayConfig: ChatDisplayConfig
  isOpen: boolean
  children: React.ReactNode
  onClose: () => void
  className?: string
}

export function ChatContainer({
  displayConfig,
  isOpen,
  children,
  onClose,
  className,
}: ChatContainerProps) {
  const { mode, modalSize, position, mobileFullscreen } = displayConfig

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen && mode === 'modal') {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, mode])

  if (!isOpen) return null

  // Get size classes for modal
  const getSizeClasses = () => {
    switch (modalSize) {
      case 'sm': return 'max-w-[50vw] max-h-[60vh]'
      case 'md': return 'max-w-[60vw] max-h-[70vh]'
      case 'lg': return 'max-w-[70vw] max-h-[80vh]'
      case 'xl': return 'max-w-[80vw] max-h-[85vh]'
      default: return 'max-w-[70vw] max-h-[80vh]'
    }
  }

  // Get position classes for mini mode
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right': return 'bottom-4 right-4'
      case 'bottom-left': return 'bottom-4 left-4'
      case 'top-right': return 'top-4 right-4'
      case 'top-left': return 'top-4 left-4'
      default: return 'bottom-4 right-4'
    }
  }

  // Modal mode - centered with backdrop
  if (mode === 'modal') {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onClose}
        />
        
        {/* Modal container */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            className={cn(
              "relative w-full h-full pointer-events-auto",
              "flex flex-col bg-background rounded-2xl",
              "border border-border/50 shadow-2xl shadow-primary/5",
              "animate-in fade-in zoom-in-95 duration-300",
              // Mobile: fullscreen
              mobileFullscreen && "md:rounded-2xl md:h-auto",
              mobileFullscreen ? "max-md:rounded-none max-md:max-w-full max-md:max-h-full" : "",
              // Desktop: sized
              !mobileFullscreen || "md:w-auto md:h-auto",
              getSizeClasses(),
              className
            )}
            style={{
              minWidth: '320px',
              minHeight: '400px',
            }}
          >
            {children}
          </div>
        </div>
      </>
    )
  }

  // Mini mode - corner positioned
  if (mode === 'mini') {
    return (
      <div
        className={cn(
          "fixed z-50",
          "w-[360px] h-[500px]",
          "flex flex-col bg-background rounded-2xl",
          "border border-border/50 shadow-2xl shadow-primary/5",
          "animate-in fade-in slide-in-from-bottom-4 duration-300",
          getPositionClasses(),
          // Mobile: wider
          "max-md:w-[calc(100%-2rem)] max-md:left-4 max-md:right-4 max-md:bottom-4",
          className
        )}
      >
        {children}
      </div>
    )
  }

  // Inline mode - just render children
  return (
    <div 
      className={cn(
        "flex flex-col bg-background rounded-2xl",
        "border border-border/50",
        className
      )}
    >
      {children}
    </div>
  )
}
