"use client"

import { useRef, useState, useEffect, useId } from "react"
import { cn } from "@/lib/utils"

/* ───────────────────────────────────────────────
   Organic "liquid" orb with SVG turbulence filter.
   - Subtle bubbling/morphing effect
   - Loading state: compact card in center of screen
   - Minimized state: corner button for AI chat
   ─────────────────────────────────────────────── */

interface AIORBProps {
  isLoading: boolean
  isMinimized: boolean
  onLoadingComplete: () => void
  onOrbClick: () => void
  isChatOpen: boolean
}

export function AIOrbCanvas({
  isLoading,
  isMinimized,
  onLoadingComplete,
  onOrbClick,
  isChatOpen,
}: AIORBProps) {
  const [loadProgress, setLoadProgress] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [turbulenceSeed, setTurbulenceSeed] = useState(1)
  const timerRef = useRef<ReturnType<typeof setInterval>>(null)
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null)
  const filterId = useId()
  
  // Animate turbulence for organic movement
  useEffect(() => {
    let animationFrame: number
    let seed = 1
    
    const animate = () => {
      seed += 0.015
      if (seed > 100) seed = 1
      setTurbulenceSeed(seed)
      animationFrame = requestAnimationFrame(animate)
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  // Loading progress
  useEffect(() => {
    if (!isLoading) return
    timerRef.current = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current!)
          setIsTransitioning(true)
          setTimeout(() => {
            onLoadingComplete()
            setTimeout(() => setShowHint(true), 1200)
          }, 500)
          return 100
        }
        return prev + Math.random() * 14 + 5
      })
    }, 70)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isLoading, onLoadingComplete])

  // Auto-hide hint
  useEffect(() => {
    if (showHint && !isChatOpen) {
      const t = setTimeout(() => setShowHint(false), 4000)
      return () => clearTimeout(t)
    }
  }, [showHint, isChatOpen])

  const progressClamped = Math.min(Math.round(loadProgress), 100)

  return (
    <>
      {/* SVG Filter for organic turbulence effect */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              ref={turbulenceRef}
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="2"
              seed={turbulenceSeed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={isHovered ? 6 : 3}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* ══════════════════════════════════════════
          LOADING STATE: compact card, not full screen
          ══════════════════════════════════════════ */}
      {isLoading && !isMinimized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div
            className={cn(
              "flex flex-col items-center gap-6 transition-all duration-500",
              isTransitioning && "opacity-0 scale-95 translate-y-4"
            )}
          >
            {/* Compact orb */}
            <div className="relative w-20 h-20">
              {/* Outer breathing ring */}
              <div className="absolute inset-[-8px] rounded-full border border-primary/20 orb-breathe" />

              {/* SVG circular progress */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 80 80"
              >
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="2"
                  opacity="0.3"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 36}`}
                  strokeDashoffset={`${2 * Math.PI * 36 * (1 - progressClamped / 100)}`}
                  className="transition-[stroke-dashoffset] duration-300 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 6px var(--primary))`,
                  }}
                />
              </svg>

              {/* The orb sphere (small) - organic bubbling */}
              <div 
                className="absolute inset-[6px] rounded-full overflow-hidden"
                style={{ filter: `url(#${filterId})` }}
              >
                <div className="absolute inset-0 rounded-full orb-base" />
                <div className="absolute inset-0 rounded-full orb-layer-1 orb-rotate" />
                <div className="absolute inset-0 rounded-full orb-layer-2 orb-rotate-reverse" />
                <div className="absolute inset-[20%] rounded-full orb-core orb-pulse" />
                <div className="absolute inset-0 rounded-full orb-edge" />
              </div>
            </div>

            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-base md:text-lg tracking-wide">
                <span className="text-muted-foreground/50">{"<"}</span>
                <span className="text-foreground font-semibold">NetNext</span>
                <span className="text-muted-foreground/50">{" />"}</span>
              </span>
            </div>

            {/* Minimal progress */}
            <div className="flex items-center gap-3 text-muted-foreground/60">
              <span className="font-mono text-xs tabular-nums w-8 text-right">
                {progressClamped}%
              </span>
              <div className="w-32 h-[3px] bg-border/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${progressClamped}%`,
                    background:
                      "linear-gradient(90deg, var(--primary), var(--accent))",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MINIMIZED STATE: corner AI assistant button
          ══════════════════════════════════════════ */}
      {isMinimized && (
        <div
          className={cn(
            "fixed z-[60] top-[72px] right-3 md:top-5 md:right-5 select-none cursor-pointer",
            "w-11 h-11 md:w-14 md:h-14",
            "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            isChatOpen && "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onOrbClick}
        >
          {/* Outer glow */}
          <div
            className={cn(
              "absolute inset-[-10px] rounded-full transition-all duration-500",
              isHovered || isChatOpen
                ? "opacity-100 scale-[1.3]"
                : "opacity-40 scale-100"
            )}
            style={{
              background: "radial-gradient(circle, rgba(79,209,197,0.35) 0%, rgba(56,178,172,0.15) 50%, transparent 70%)",
              filter: "blur(6px)",
            }}
          />

          {/* Breathing ring */}
          <div className="absolute inset-[-3px] rounded-full border border-primary/25 orb-breathe" />

          {/* Hover ring */}
          {isHovered && (
            <div className="absolute inset-[-7px] rounded-full border border-primary/15 orb-spin" />
          )}

          {/* Mini orb - organic bubbling */}
          <div
            className={cn(
              "relative w-full h-full rounded-full overflow-hidden transition-all duration-300",
              isHovered && "scale-110",
              isChatOpen && "scale-95"
            )}
            style={{ filter: `url(#${filterId})` }}
          >
            <div className="absolute inset-0 rounded-full orb-base" />
            <div className="absolute inset-0 rounded-full orb-layer-1 orb-rotate" />
            <div className="absolute inset-0 rounded-full orb-layer-2 orb-rotate-reverse" />
            <div className="absolute inset-[18%] rounded-full orb-core orb-pulse" />
            <div className="absolute inset-0 rounded-full orb-edge" />
          </div>

          {/* Hint tooltip */}
          {showHint && !isChatOpen && (
            <div className="absolute -bottom-12 md:-bottom-13 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none">
              <div className="relative px-3 py-1.5 rounded-lg bg-card border border-border/50 text-xs shadow-lg">
                <span className="text-primary/90 font-medium">AI</span>
                <span className="text-muted-foreground ml-1">Ассистент</span>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-card border-l border-t border-border/50 rotate-45" />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
