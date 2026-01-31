'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SOS } from '@/lib/types'

interface UseSOSOptions {
  userId: string
  userLat: number | null
  userLon: number | null
}

export function useSOS({ userId, userLat, userLon }: UseSOSOptions) {
  const [pendingSOS, setPendingSOS] = useState<SOS[]>([])
  const [sentSOS, setSentSOS] = useState<SOS[]>([])
  const [isSending, setIsSending] = useState(false)
  const [lastSentTime, setLastSentTime] = useState<number | null>(null)

  // Load queued SOS from localStorage
  useEffect(() => {
    try {
      const queued = localStorage.getItem('saferoute_sos_queue')
      if (queued) {
        setPendingSOS(JSON.parse(queued))
      }
      
      const sent = localStorage.getItem('saferoute_sos_sent')
      if (sent) {
        setSentSOS(JSON.parse(sent))
      }
    } catch {
      // Storage not available
    }
  }, [])

  // Save pending SOS to localStorage
  const savePendingToStorage = useCallback((items: SOS[]) => {
    try {
      localStorage.setItem('saferoute_sos_queue', JSON.stringify(items))
    } catch {
      // Storage not available
    }
  }, [])

  // Save sent SOS to localStorage
  const saveSentToStorage = useCallback((items: SOS[]) => {
    try {
      localStorage.setItem('saferoute_sos_sent', JSON.stringify(items))
    } catch {
      // Storage not available
    }
  }, [])

  // Send SOS to server
  const sendToServer = useCallback(async (sos: SOS): Promise<boolean> => {
    try {
      const response = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sos),
      })
      
      return response.ok
    } catch {
      return false
    }
  }, [])

  // Queue and send SOS
  const sendSOS = useCallback(async (message?: string) => {
    const sos: SOS = {
      id: `sos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      latitude: userLat,
      longitude: userLon,
      message: message || 'Emergency - Need Help!',
      timestamp: Date.now(),
      status: 'pending',
    }
    
    // Add to pending queue
    const newPending = [...pendingSOS, sos]
    setPendingSOS(newPending)
    savePendingToStorage(newPending)
    
    // Try to send immediately
    setIsSending(true)
    
    const success = await sendToServer(sos)
    
    if (success) {
      // Move to sent
      const updatedSOS = { ...sos, status: 'sent' as const }
      const newSent = [...sentSOS, updatedSOS]
      setSentSOS(newSent)
      saveSentToStorage(newSent)
      
      // Remove from pending
      const filtered = newPending.filter(s => s.id !== sos.id)
      setPendingSOS(filtered)
      savePendingToStorage(filtered)
      
      setLastSentTime(Date.now())
    }
    
    setIsSending(false)
    return success
  }, [userId, userLat, userLon, pendingSOS, sentSOS, sendToServer, savePendingToStorage, saveSentToStorage])

  // Retry sending pending SOS messages
  const retryPending = useCallback(async () => {
    if (pendingSOS.length === 0 || isSending) return
    
    setIsSending(true)
    
    const results = await Promise.all(
      pendingSOS.map(async (sos) => {
        const success = await sendToServer(sos)
        return { sos, success }
      })
    )
    
    const succeeded = results.filter(r => r.success).map(r => ({ ...r.sos, status: 'sent' as const }))
    const failed = results.filter(r => !r.success).map(r => r.sos)
    
    if (succeeded.length > 0) {
      const newSent = [...sentSOS, ...succeeded]
      setSentSOS(newSent)
      saveSentToStorage(newSent)
      setLastSentTime(Date.now())
    }
    
    setPendingSOS(failed)
    savePendingToStorage(failed)
    
    setIsSending(false)
  }, [pendingSOS, sentSOS, isSending, sendToServer, savePendingToStorage, saveSentToStorage])

  // Auto-retry when online
  useEffect(() => {
    const handleOnline = () => {
      if (pendingSOS.length > 0) {
        retryPending()
      }
    }
    
    window.addEventListener('online', handleOnline)
    
    // Also retry periodically if there are pending messages
    const interval = setInterval(() => {
      if (navigator.onLine && pendingSOS.length > 0) {
        retryPending()
      }
    }, 30000) // Every 30 seconds
    
    return () => {
      window.removeEventListener('online', handleOnline)
      clearInterval(interval)
    }
  }, [pendingSOS, retryPending])

  // Clear old sent SOS (keep last 10)
  const clearOldSent = useCallback(() => {
    if (sentSOS.length > 10) {
      const recent = sentSOS.slice(-10)
      setSentSOS(recent)
      saveSentToStorage(recent)
    }
  }, [sentSOS, saveSentToStorage])

  useEffect(() => {
    clearOldSent()
  }, [clearOldSent])

  return {
    pendingSOS,
    sentSOS,
    isSending,
    lastSentTime,
    sendSOS,
    retryPending,
    hasPending: pendingSOS.length > 0,
  }
}
