'use client'

import { cn } from '@/lib/utils'
import type { NetworkMode } from '@/lib/types'

interface NetworkStatusProps {
  isOnline: boolean
  networkMode: NetworkMode
  networkQuality: 'none' | 'poor' | 'moderate' | 'good'
}

export function NetworkStatus({ isOnline, networkMode, networkQuality }: NetworkStatusProps) {
  const qualityConfig = {
    none: { color: 'bg-red-500', label: 'OFFLINE', bars: 0 },
    poor: { color: 'bg-orange-500', label: 'WEAK', bars: 1 },
    moderate: { color: 'bg-yellow-500', label: 'OK', bars: 2 },
    good: { color: 'bg-green-500', label: 'GOOD', bars: 3 },
  }

  const config = qualityConfig[networkQuality]

  // Survival mode
  if (networkMode === 'survival') {
    return (
      <div className={cn(
        "flex items-center justify-between p-2 text-sm font-bold",
        !isOnline && "bg-red-600 text-white animate-pulse"
      )}>
        <div className="flex items-center gap-2">
          {/* Signal bars */}
          <div className="flex items-end gap-0.5 h-4">
            {[1, 2, 3].map((bar) => (
              <div
                key={bar}
                className={cn(
                  "w-1.5 rounded-sm",
                  bar <= config.bars ? config.color : 'bg-gray-600',
                )}
                style={{ height: `${bar * 5 + 2}px` }}
              />
            ))}
          </div>
          <span className={isOnline ? 'text-yellow-400' : 'text-white'}>
            {config.label}
          </span>
        </div>
        <div className={cn(
          "px-2 py-0.5 rounded text-xs",
          networkMode === 'survival' && "bg-yellow-400 text-black",
          networkMode === 'resilient' && "bg-blue-400 text-white",
          networkMode === 'full' && "bg-green-400 text-black",
        )}>
          {networkMode.toUpperCase()} MODE
        </div>
      </div>
    )
  }

  // Resilient mode
  if (networkMode === 'resilient') {
    return (
      <div className="flex items-center justify-between p-2 bg-secondary rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-end gap-0.5 h-4">
            {[1, 2, 3].map((bar) => (
              <div
                key={bar}
                className={cn(
                  "w-1.5 rounded-sm transition-colors",
                  bar <= config.bars ? config.color : 'bg-muted',
                )}
                style={{ height: `${bar * 5 + 2}px` }}
              />
            ))}
          </div>
          <span className="text-muted-foreground">{config.label}</span>
        </div>
        <span className="text-xs text-muted-foreground">Resilient Mode</span>
      </div>
    )
  }

  // Full mode
  return (
    <div className="flex items-center justify-between p-2 text-sm">
      <div className="flex items-center gap-2">
        <div className="flex items-end gap-0.5 h-4">
          {[1, 2, 3].map((bar) => (
            <div
              key={bar}
              className={cn(
                "w-1.5 rounded-sm transition-colors",
                bar <= config.bars ? config.color : 'bg-muted',
              )}
              style={{ height: `${bar * 5 + 2}px` }}
            />
          ))}
        </div>
        <span className={cn(
          "text-xs",
          isOnline ? 'text-green-500' : 'text-red-500'
        )}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  )
}
