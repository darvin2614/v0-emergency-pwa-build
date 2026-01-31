'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { DisasterAlert, NetworkMode } from '@/lib/types'

interface DisasterAlertsProps {
  alerts: DisasterAlert[]
  networkMode: NetworkMode
}

const severityConfig = {
  low: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-400',
    label: 'LOW',
  },
  medium: {
    bg: 'bg-yellow-500',
    bgLight: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-400',
    label: 'MEDIUM',
  },
  high: {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-400',
    label: 'HIGH',
  },
  critical: {
    bg: 'bg-red-500',
    bgLight: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-400',
    label: 'CRITICAL',
  },
}

const typeLabels = {
  cyclone: 'CYCLONE',
  flood: 'FLOOD',
  tsunami: 'TSUNAMI',
  earthquake: 'EARTHQUAKE',
}

export function DisasterAlerts({ alerts, networkMode }: DisasterAlertsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (alerts.length === 0) {
    return null
  }

  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  // Survival mode - pure text
  if (networkMode === 'survival') {
    return (
      <div className="flex flex-col gap-2 bg-black p-4 rounded-lg border-2 border-red-400">
        <div className="text-red-400 font-bold uppercase text-center animate-pulse">
          !! DISASTER ALERTS !!
        </div>
        
        {sortedAlerts.map((alert) => {
          const config = severityConfig[alert.severity]
          const isExpanded = expandedId === alert.id
          
          return (
            <button
              key={alert.id}
              onClick={() => setExpandedId(isExpanded ? null : alert.id)}
              className={cn(
                "w-full p-3 text-left border-2 rounded",
                config.border,
                alert.severity === 'critical' && "animate-pulse"
              )}
            >
              <div className="flex justify-between items-center">
                <div className="font-bold text-yellow-400">
                  {typeLabels[alert.type]}
                </div>
                <div className={cn(
                  "px-2 py-1 text-xs font-bold rounded",
                  config.bg,
                  "text-white"
                )}>
                  {config.label}
                </div>
              </div>
              
              <div className="text-yellow-200 mt-2 text-sm">
                {alert.description}
              </div>
              
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-yellow-400/50">
                  <div className="text-xs text-yellow-400 font-bold mb-1">SAFETY INSTRUCTIONS:</div>
                  <div className="text-yellow-200 text-sm">
                    {alert.instructions}
                  </div>
                  <div className="text-xs text-yellow-400/70 mt-2">
                    ISSUED: {new Date(alert.issued_at).toLocaleString()}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-yellow-400/50 mt-2">
                {isExpanded ? 'TAP TO COLLAPSE' : 'TAP FOR DETAILS'}
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  // Resilient mode
  if (networkMode === 'resilient') {
    return (
      <div className="flex flex-col gap-2 bg-secondary p-4 rounded-lg">
        <div className="font-semibold text-destructive text-center">
          Active Alerts ({alerts.length})
        </div>
        
        {sortedAlerts.map((alert) => {
          const config = severityConfig[alert.severity]
          const isExpanded = expandedId === alert.id
          
          return (
            <button
              key={alert.id}
              onClick={() => setExpandedId(isExpanded ? null : alert.id)}
              className={cn(
                "w-full p-3 text-left rounded-lg transition-colors",
                config.bgLight
              )}
            >
              <div className="flex justify-between items-center">
                <div className={cn("font-semibold", config.text)}>
                  {typeLabels[alert.type]}
                </div>
                <span className={cn(
                  "px-2 py-0.5 text-xs font-bold rounded text-white",
                  config.bg
                )}>
                  {config.label}
                </span>
              </div>
              
              <div className="text-sm mt-1 text-foreground/80">
                {alert.description}
              </div>
              
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-current/20 text-sm">
                  <div className="font-medium mb-1">Safety Instructions:</div>
                  <div className="text-foreground/70">{alert.instructions}</div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // Full mode
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Active Alerts
        </h2>
        <span className="text-sm text-muted-foreground">{alerts.length} active</span>
      </div>
      
      {sortedAlerts.map((alert) => {
        const config = severityConfig[alert.severity]
        const isExpanded = expandedId === alert.id
        
        return (
          <button
            key={alert.id}
            onClick={() => setExpandedId(isExpanded ? null : alert.id)}
            className={cn(
              "w-full p-4 text-left rounded-xl border-2 transition-all",
              config.border,
              config.bgLight,
              "hover:shadow-md"
            )}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("font-bold text-lg", config.text)}>
                    {typeLabels[alert.type]}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-bold rounded text-white",
                    config.bg,
                    alert.severity === 'critical' && "animate-pulse"
                  )}>
                    {config.label}
                  </span>
                </div>
                
                <p className="text-sm text-foreground/80">
                  {alert.description}
                </p>
                
                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-background/80 rounded-lg">
                      <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Safety Instructions
                      </div>
                      <p className="text-sm text-foreground/70">
                        {alert.instructions}
                      </p>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Issued: {new Date(alert.issued_at).toLocaleString()}</span>
                      {alert.expires_at && (
                        <span>Expires: {new Date(alert.expires_at).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <svg 
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform shrink-0",
                  isExpanded && "rotate-180"
                )} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        )
      })}
    </div>
  )
}
