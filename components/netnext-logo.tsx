"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface NetNextLogoProps {
  size?: number
  animated?: boolean
  showText?: boolean
  className?: string
  color?: string
}

export function NetNextLogo({ 
  size = 40, 
  animated = true, 
  showText = false,
  className,
  color = "#22d3ee"
}: NetNextLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  
  useEffect(() => {
    if (!animated) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)
    
    let time = 0
    
    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      
      const cx = size / 2
      const cy = size / 2
      const baseRadius = size * 0.38
      
      // Parse color to RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 34, g: 211, b: 238 }
      }
      const rgb = hexToRgb(color)
      
      // Outer glow rings
      for (let i = 3; i >= 0; i--) {
        const glowRadius = baseRadius + i * 3 + Math.sin(time * 2 + i) * 2
        const alpha = 0.08 - i * 0.015
        
        ctx.beginPath()
        ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
        ctx.fill()
      }
      
      // Main orb with morphing shape
      ctx.save()
      ctx.translate(cx, cy)
      
      // Create organic blob shape
      ctx.beginPath()
      const points = 64
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2
        const wobble = Math.sin(angle * 3 + time * 1.5) * 2 +
                       Math.sin(angle * 5 - time * 2) * 1 +
                       Math.sin(angle * 2 + time) * 1.5
        const r = baseRadius + wobble
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      
      // Gradient fill
      const gradient = ctx.createRadialGradient(-baseRadius * 0.3, -baseRadius * 0.3, 0, 0, 0, baseRadius * 1.2)
      gradient.addColorStop(0, `rgba(255, 255, 255, 0.95)`)
      gradient.addColorStop(0.3, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`)
      gradient.addColorStop(0.7, `rgba(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${rgb.b}, 0.8)`)
      gradient.addColorStop(1, `rgba(${Math.max(0, rgb.r - 60)}, ${Math.max(0, rgb.g - 60)}, ${rgb.b}, 0.6)`)
      ctx.fillStyle = gradient
      ctx.fill()
      
      // Inner highlight
      ctx.beginPath()
      ctx.ellipse(-baseRadius * 0.25, -baseRadius * 0.25, baseRadius * 0.4, baseRadius * 0.25, Math.PI * 0.25, 0, Math.PI * 2)
      const highlightGradient = ctx.createRadialGradient(-baseRadius * 0.25, -baseRadius * 0.25, 0, -baseRadius * 0.25, -baseRadius * 0.25, baseRadius * 0.4)
      highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.6)")
      highlightGradient.addColorStop(1, "rgba(255, 255, 255, 0)")
      ctx.fillStyle = highlightGradient
      ctx.fill()
      
      // Draw "N" letter
      ctx.restore()
      const letterSize = size * 0.32
      const letterX = cx - letterSize / 2
      const letterY = cy - letterSize / 2
      
      ctx.save()
      ctx.translate(letterX, letterY)
      
      // N path
      ctx.beginPath()
      const nWidth = letterSize
      const nHeight = letterSize
      const strokeWidth = letterSize * 0.18
      
      // Left vertical
      ctx.moveTo(0, nHeight)
      ctx.lineTo(0, 0)
      ctx.lineTo(strokeWidth, 0)
      ctx.lineTo(strokeWidth, nHeight * 0.6)
      
      // Diagonal
      ctx.lineTo(nWidth - strokeWidth, 0)
      ctx.lineTo(nWidth, 0)
      ctx.lineTo(nWidth, nHeight)
      ctx.lineTo(nWidth - strokeWidth, nHeight)
      ctx.lineTo(nWidth - strokeWidth, nHeight * 0.4)
      
      // Back to start
      ctx.lineTo(strokeWidth, nHeight)
      ctx.closePath()
      
      // Fill N with dark color for contrast
      ctx.fillStyle = "rgba(0, 20, 30, 0.85)"
      ctx.fill()
      
      ctx.restore()
      
      // Floating particles
      const particleCount = 4
      for (let i = 0; i < particleCount; i++) {
        const particleAngle = (i / particleCount) * Math.PI * 2 + time * 0.5
        const particleRadius = baseRadius * 1.1 + Math.sin(time * 2 + i * 1.5) * 4
        const px = cx + Math.cos(particleAngle) * particleRadius
        const py = cy + Math.sin(particleAngle) * particleRadius
        const particleSize = 1 + Math.sin(time * 3 + i) * 0.5
        
        ctx.beginPath()
        ctx.arc(px, py, particleSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.4 + Math.sin(time * 2 + i) * 0.3})`
        ctx.fill()
      }
      
      time += 0.02
      animationRef.current = requestAnimationFrame(draw)
    }
    
    draw()
    
    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [size, animated, color])
  
  // Static version (SVG)
  if (!animated) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div 
          className="relative flex-shrink-0"
          style={{ width: size, height: size }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <radialGradient id="nn-orb-gradient" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="40%" stopColor={color} stopOpacity="0.85" />
                <stop offset="100%" stopColor={color} stopOpacity="0.5" />
              </radialGradient>
              <filter id="nn-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            {/* Outer glow */}
            <circle cx="50" cy="50" r="42" fill={color} opacity="0.15" />
            <circle cx="50" cy="50" r="38" fill={color} opacity="0.1" />
            
            {/* Main orb */}
            <circle cx="50" cy="50" r="35" fill="url(#nn-orb-gradient)" filter="url(#nn-glow)" />
            
            {/* Highlight */}
            <ellipse cx="40" cy="40" rx="12" ry="8" fill="white" opacity="0.4" transform="rotate(-30 40 40)" />
            
            {/* N letter */}
            <path 
              d="M36 65V35h6l16 20V35h6v30h-6l-16-20v20h-6z" 
              fill="rgba(0, 20, 30, 0.85)"
            />
          </svg>
        </div>
        
        {showText && (
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight" style={{ color }}>
              NetNext
            </span>
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
              Studio
            </span>
          </div>
        )}
      </div>
    )
  }
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <canvas
        ref={canvasRef}
        className="flex-shrink-0"
        style={{ width: size, height: size }}
      />
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight" style={{ color }}>
            NetNext
          </span>
          <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
            Studio
          </span>
        </div>
      )}
    </div>
  )
}

// Compact logo for small spaces
export function NetNextLogoCompact({ 
  size = 32, 
  color = "#22d3ee",
  className 
}: { 
  size?: number
  color?: string
  className?: string 
}) {
  return (
    <div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <radialGradient id="nn-compact-gradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor={color} stopOpacity="0.85" />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </radialGradient>
        </defs>
        
        {/* Glow */}
        <circle cx="50" cy="50" r="45" fill={color} opacity="0.2">
          <animate attributeName="r" values="42;45;42" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0.25;0.15" dur="2s" repeatCount="indefinite" />
        </circle>
        
        {/* Main orb */}
        <circle cx="50" cy="50" r="38" fill="url(#nn-compact-gradient)" />
        
        {/* N letter */}
        <path 
          d="M36 65V35h6l16 20V35h6v30h-6l-16-20v20h-6z" 
          fill="rgba(0, 20, 30, 0.85)"
        />
      </svg>
    </div>
  )
}
