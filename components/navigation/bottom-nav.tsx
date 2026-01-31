'use client'

import { cn } from '@/lib/utils'
import type { NetworkMode } from '@/lib/types'

export type TabId = 'compass' | 'safehouses' | 'family' | 'alerts'

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  networkMode: NetworkMode
  alertCount?: number
}

const tabs: { id: TabId; label: string; survivalLabel: string }[] = [
  { id: 'compass', label: 'Compass', survivalLabel: 'NAV' },
  { id: 'safehouses', label: 'Safe Houses', survivalLabel: 'SAFE' },
  { id: 'family', label: 'Family', survivalLabel: 'FAM' },
  { id: 'alerts', label: 'Alerts', survivalLabel: 'ALERT' },
]

export function BottomNav({ activeTab, onTabChange, networkMode, alertCount = 0 }: BottomNavProps) {
  // Survival mode
  if (networkMode === 'survival') {
    return (
      <nav className="flex bg-black border-t-2 border-yellow-400">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 py-4 text-center font-bold uppercase relative",
              activeTab === tab.id
                ? "bg-yellow-400 text-black"
                : "text-yellow-400"
            )}
          >
            {tab.survivalLabel}
            {tab.id === 'alerts' && alertCount > 0 && (
              <span className="absolute top-1 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {alertCount}
              </span>
            )}
          </button>
        ))}
      </nav>
    )
  }

  // Resilient mode
  if (networkMode === 'resilient') {
    return (
      <nav className="flex bg-secondary border-t border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 py-3 text-center text-sm font-medium relative transition-colors",
              activeTab === tab.id
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.id === 'alerts' && alertCount > 0 && (
              <span className="absolute top-1 right-1/4 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </button>
        ))}
      </nav>
    )
  }

  // Full mode
  return (
    <nav className="flex bg-card border-t border-border shadow-lg">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 py-3 flex flex-col items-center gap-1 relative transition-all",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {/* Icons */}
            {tab.id === 'compass' && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            )}
            {tab.id === 'safehouses' && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )}
            {tab.id === 'family' && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
            {tab.id === 'alerts' && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            )}
            
            <span className="text-xs font-medium">{tab.label}</span>
            
            {/* Active indicator */}
            {isActive && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
            )}
            
            {/* Alert badge */}
            {tab.id === 'alerts' && alertCount > 0 && (
              <span className="absolute top-0.5 right-1/4 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {alertCount}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
