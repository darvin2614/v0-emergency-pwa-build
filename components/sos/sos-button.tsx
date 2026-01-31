'use client'

import { useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { NetworkMode } from '@/lib/types'

interface SOSButtonProps {
  onSendSOS: (message?: string) => Promise<boolean>
  isSending: boolean
  hasPending: boolean
  lastSentTime: number | null
  networkMode: NetworkMode
}

export function SOSButton({
  onSendSOS,
  isSending,
  hasPending,
  lastSentTime,
  networkMode,
}: SOSButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const HOLD_DURATION = 2000 // 2 seconds hold to activate

  const startHold = useCallback(() => {
    setIsPressed(true)
    setHoldProgress(0)
    
    const startTime = Date.now()
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / HOLD_DURATION, 1)
      setHoldProgress(progress)
      
      if (progress >= 1) {
        // Trigger SOS
        clearInterval(progressIntervalRef.current!)
        handleSOS()
      }
    }, 50)
  }, [])

  const endHold = useCallback(() => {
    setIsPressed(false)
    setHoldProgress(0)
    
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [])

  const handleSOS = async () => {
    endHold()
    const success = await onSendSOS()
    setShowConfirmation(true)
    
    setTimeout(() => {
      setShowConfirmation(false)
    }, 3000)
  }

  // Quick tap handler (for survival mode - more accessible)
  const handleQuickTap = useCallback(() => {
    if (networkMode === 'survival') {
      handleSOS()
    }
  }, [networkMode])

  const timeSinceLastSent = lastSentTime 
    ? Math.round((Date.now() - lastSentTime) / 1000)
    : null

  // Survival mode - huge, simple button
  if (networkMode === 'survival') {
    return (
      <div className="flex flex-col gap-2">
        {/* Main SOS Button - duplicated in two zones for broken screen accessibility */}
        <button
          onTouchStart={startHold}
          onTouchEnd={endHold}
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onClick={handleQuickTap}
          disabled={isSending}
          className={cn(
            "w-full py-8 text-4xl font-bold border-4 rounded-lg transition-colors relative overflow-hidden",
            isPressed
              ? "bg-red-600 border-red-400 text-white"
              : "bg-red-500 border-red-300 text-white",
            isSending && "opacity-50"
          )}
        >
          {/* Progress overlay */}
          <div 
            className="absolute inset-0 bg-red-300 transition-all"
            style={{ width: `${holdProgress * 100}%`, opacity: 0.5 }}
          />
          <span className="relative z-10">
            {isSending ? 'SENDING...' : showConfirmation ? 'SOS SENT!' : 'HOLD FOR SOS'}
          </span>
        </button>
        
        {/* Duplicate button at bottom for broken screen */}
        <button
          onTouchStart={startHold}
          onTouchEnd={endHold}
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onClick={handleQuickTap}
          disabled={isSending}
          className={cn(
            "w-full py-6 text-2xl font-bold border-4 rounded-lg transition-colors relative overflow-hidden",
            isPressed
              ? "bg-red-600 border-red-400 text-white"
              : "bg-red-500 border-red-300 text-white",
            isSending && "opacity-50"
          )}
        >
          <div 
            className="absolute inset-0 bg-red-300 transition-all"
            style={{ width: `${holdProgress * 100}%`, opacity: 0.5 }}
          />
          <span className="relative z-10">SOS</span>
        </button>
        
        {hasPending && (
          <div className="text-orange-400 text-center text-sm font-bold animate-pulse">
            SOS QUEUED - WILL SEND WHEN ONLINE
          </div>
        )}
        
        {timeSinceLastSent !== null && timeSinceLastSent < 60 && (
          <div className="text-green-400 text-center text-sm">
            SOS SENT {timeSinceLastSent}s AGO
          </div>
        )}
      </div>
    )
  }

  // Resilient mode
  if (networkMode === 'resilient') {
    return (
      <div className="flex flex-col gap-2">
        <button
          onTouchStart={startHold}
          onTouchEnd={endHold}
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          disabled={isSending}
          className={cn(
            "w-full py-6 text-xl font-bold rounded-lg transition-all relative overflow-hidden",
            isPressed
              ? "bg-red-600 text-white"
              : "bg-red-500 text-white hover:bg-red-600",
            isSending && "opacity-50"
          )}
        >
          <div 
            className="absolute inset-0 bg-red-300 transition-all"
            style={{ width: `${holdProgress * 100}%`, opacity: 0.3 }}
          />
          <span className="relative z-10">
            {isSending ? 'Sending...' : showConfirmation ? 'SOS Sent!' : 'Hold for SOS'}
          </span>
        </button>
        
        {hasPending && (
          <div className="text-orange-500 text-center text-xs">
            Pending SOS will send when online
          </div>
        )}
      </div>
    )
  }

  // Full mode
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <button
          onTouchStart={startHold}
          onTouchEnd={endHold}
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          disabled={isSending}
          className={cn(
            "w-full py-6 text-xl font-bold rounded-xl transition-all relative overflow-hidden shadow-lg",
            isPressed
              ? "bg-red-600 text-white scale-95"
              : "bg-red-500 text-white hover:bg-red-600 hover:shadow-xl",
            isSending && "opacity-50",
            showConfirmation && "bg-green-500 hover:bg-green-500"
          )}
        >
          {/* Progress ring/bar */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <rect
              x="0"
              y="0"
              width={holdProgress * 100}
              height="100"
              fill="rgba(255,255,255,0.2)"
            />
          </svg>
          
          <div className="relative z-10 flex items-center justify-center gap-3">
            {showConfirmation ? (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                SOS Sent Successfully
              </>
            ) : isSending ? (
              <>
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending SOS...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Hold for Emergency SOS
              </>
            )}
          </div>
        </button>
        
        {/* Progress indicator */}
        {isPressed && (
          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-red-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all"
              style={{ width: `${holdProgress * 100}%` }}
            />
          </div>
        )}
      </div>
      
      <p className="text-xs text-center text-muted-foreground">
        Hold button for 2 seconds to send emergency alert with your location
      </p>
      
      {hasPending && (
        <div className="flex items-center justify-center gap-2 p-2 bg-orange-100 text-orange-700 rounded-lg text-sm">
          <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          SOS queued - will send when connection is restored
        </div>
      )}
      
      {timeSinceLastSent !== null && timeSinceLastSent < 120 && !showConfirmation && (
        <div className="text-center text-sm text-green-600">
          Last SOS sent {timeSinceLastSent < 60 ? `${timeSinceLastSent}s` : `${Math.floor(timeSinceLastSent / 60)}m`} ago
        </div>
      )}
    </div>
  )
}
