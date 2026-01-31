'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { NetworkMode } from '@/lib/types'
import { getCardinalDirection, getDirectionArrow, formatDistance } from '@/lib/geo-utils'

interface CompassDisplayProps {
  heading: number | null
  targetBearing: number | null
  targetDistance: number | null
  targetName: string | null
  networkMode: NetworkMode
  isCalibrating?: boolean
  compassError?: string | null
}

export function CompassDisplay({
  heading,
  targetBearing,
  targetDistance,
  targetName,
  networkMode,
  isCalibrating,
  compassError,
}: CompassDisplayProps) {
  // Calculate rotation to point to target
  const rotation = useMemo(() => {
    if (targetBearing === null || heading === null) return 0
    return targetBearing - heading
  }, [targetBearing, heading])

  const directionToTarget = useMemo(() => {
    if (targetBearing === null) return null
    return getCardinalDirection(targetBearing)
  }, [targetBearing])

  const arrowToTarget = useMemo(() => {
    if (targetBearing === null || heading === null) return '?'
    const relativeAngle = (targetBearing - heading + 360) % 360
    return getDirectionArrow(relativeAngle)
  }, [targetBearing, heading])

  // Survival Mode - Text only
  if (networkMode === 'survival') {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-black text-yellow-400 rounded-lg border-2 border-yellow-400">
        <div className="text-lg font-bold uppercase tracking-wider">COMPASS</div>
        
        {compassError ? (
          <div className="text-red-400 text-center text-lg">{compassError}</div>
        ) : (
          <>
            {/* Current heading */}
            <div className="text-center">
              <div className="text-sm text-yellow-200">YOU FACE</div>
              <div className="text-4xl font-mono font-bold">
                {heading !== null ? `${Math.round(heading)}°` : '---'}
              </div>
              <div className="text-2xl font-bold">
                {heading !== null ? getCardinalDirection(heading) : '---'}
              </div>
            </div>

            {/* Target direction */}
            {targetName && (
              <div className="w-full border-t-2 border-yellow-400 pt-4 mt-2">
                <div className="text-sm text-yellow-200 text-center">GO TO</div>
                <div className="text-xl font-bold text-center truncate">{targetName}</div>
                
                <div className="flex justify-center items-center gap-8 mt-4">
                  {/* Big arrow */}
                  <div className="text-7xl font-bold leading-none">{arrowToTarget}</div>
                  
                  {/* Direction and distance */}
                  <div className="text-left">
                    <div className="text-3xl font-mono font-bold">
                      {directionToTarget}
                    </div>
                    <div className="text-2xl font-mono">
                      {targetDistance !== null ? formatDistance(targetDistance) : '---'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isCalibrating && (
              <div className="text-orange-400 text-sm animate-pulse">
                CALIBRATING - MOVE DEVICE IN 8 PATTERN
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Resilient Mode - Minimal graphics
  if (networkMode === 'resilient') {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-secondary rounded-lg">
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Compass Navigation
        </div>
        
        {compassError ? (
          <div className="text-destructive text-center">{compassError}</div>
        ) : (
          <>
            {/* Simple compass rose */}
            <div className="relative w-48 h-48">
              {/* Outer ring */}
              <div className="absolute inset-0 border-4 border-foreground rounded-full" />
              
              {/* Cardinal directions */}
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `rotate(${-(heading ?? 0)}deg)`, transition: 'transform 0.1s ease-out' }}
              >
                <span className="absolute top-2 text-xl font-bold text-foreground">N</span>
                <span className="absolute bottom-2 text-lg text-muted-foreground">S</span>
                <span className="absolute left-2 text-lg text-muted-foreground">W</span>
                <span className="absolute right-2 text-lg text-muted-foreground">E</span>
              </div>

              {/* Target pointer */}
              {targetBearing !== null && (
                <div 
                  className="absolute inset-4 flex items-start justify-center"
                  style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.1s ease-out' }}
                >
                  <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[60px] border-b-red-500" />
                </div>
              )}

              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-foreground rounded-full" />
              </div>
            </div>

            {/* Info */}
            <div className="text-center">
              <div className="text-2xl font-mono font-bold">
                {heading !== null ? `${Math.round(heading)}°` : '---'}
              </div>
              {targetName && (
                <div className="mt-2">
                  <div className="text-sm text-muted-foreground">{targetName}</div>
                  <div className="font-bold">
                    {directionToTarget} - {targetDistance !== null ? formatDistance(targetDistance) : '---'}
                  </div>
                </div>
              )}
            </div>

            {isCalibrating && (
              <div className="text-orange-500 text-sm">
                Calibrating compass...
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Full Mode - Animated compass
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-xl shadow-lg border border-border">
      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Compass Navigation
      </div>
      
      {compassError ? (
        <div className="text-destructive text-center p-4">{compassError}</div>
      ) : (
        <>
          {/* Animated compass */}
          <div className="relative w-64 h-64">
            {/* Outer decorative ring */}
            <div className="absolute inset-0 border-8 border-primary/20 rounded-full" />
            <div className="absolute inset-2 border-2 border-primary/40 rounded-full" />
            
            {/* Tick marks */}
            <div 
              className="absolute inset-0"
              style={{ transform: `rotate(${-(heading ?? 0)}deg)`, transition: 'transform 0.15s ease-out' }}
            >
              {[...Array(72)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 origin-bottom",
                    i % 9 === 0 ? "w-1 h-4 bg-foreground" : "w-0.5 h-2 bg-muted-foreground/50"
                  )}
                  style={{ 
                    transform: `rotate(${i * 5}deg) translateY(-122px)`,
                    height: i % 9 === 0 ? '16px' : '8px',
                  }}
                />
              ))}
              
              {/* Cardinal and ordinal directions */}
              <span className="absolute top-6 left-1/2 -translate-x-1/2 text-2xl font-bold text-red-500">N</span>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xl font-semibold text-muted-foreground">S</span>
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">W</span>
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">E</span>
              <span className="absolute top-12 right-12 text-sm text-muted-foreground">NE</span>
              <span className="absolute top-12 left-12 text-sm text-muted-foreground">NW</span>
              <span className="absolute bottom-12 right-12 text-sm text-muted-foreground">SE</span>
              <span className="absolute bottom-12 left-12 text-sm text-muted-foreground">SW</span>
            </div>

            {/* Target pointer arrow */}
            {targetBearing !== null && (
              <div 
                className="absolute inset-8 flex items-start justify-center"
                style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.15s ease-out' }}
              >
                <svg width="24" height="80" viewBox="0 0 24 80" className="drop-shadow-lg">
                  <path d="M12 0 L20 70 L12 60 L4 70 Z" fill="#ef4444" />
                  <path d="M12 60 L20 70 L12 80 L4 70 Z" fill="#1f2937" />
                </svg>
              </div>
            )}

            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-primary rounded-full shadow-lg border-2 border-background" />
            </div>

            {/* Fixed heading indicator at top */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rotate-45" />
          </div>

          {/* Heading display */}
          <div className="text-center">
            <div className="text-4xl font-mono font-bold">
              {heading !== null ? `${Math.round(heading)}°` : '---'}
            </div>
            <div className="text-lg text-muted-foreground">
              {heading !== null ? getCardinalDirection(heading) : '---'}
            </div>
          </div>

          {/* Target info */}
          {targetName && (
            <div className="w-full p-4 bg-secondary rounded-lg text-center">
              <div className="text-sm text-muted-foreground">Navigating to</div>
              <div className="text-lg font-bold truncate">{targetName}</div>
              <div className="flex justify-center gap-4 mt-2">
                <span className="text-2xl font-mono">{directionToTarget}</span>
                <span className="text-2xl">{arrowToTarget}</span>
                <span className="text-2xl font-mono">
                  {targetDistance !== null ? formatDistance(targetDistance) : '---'}
                </span>
              </div>
            </div>
          )}

          {isCalibrating && (
            <div className="flex items-center gap-2 text-orange-500 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Calibrating - Move device in figure-8 pattern
            </div>
          )}
        </>
      )}
    </div>
  )
}
