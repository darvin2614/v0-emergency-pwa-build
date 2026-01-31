'use client'

import { useState, useEffect, useCallback } from 'react'
import type { NetworkMode } from '@/lib/types'

interface NetworkStatus {
  isOnline: boolean
  networkMode: NetworkMode
  networkQuality: 'none' | 'poor' | 'moderate' | 'good'
  effectiveType: string | null
  downlink: number | null
  rtt: number | null
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    networkMode: 'full',
    networkQuality: 'good',
    effectiveType: null,
    downlink: null,
    rtt: null,
  })

  const updateNetworkStatus = useCallback(() => {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
    
    // Get Network Information API data if available
    const connection = (navigator as Navigator & { connection?: NetworkInformation })?.connection
    
    let effectiveType: string | null = null
    let downlink: number | null = null
    let rtt: number | null = null
    
    if (connection) {
      effectiveType = connection.effectiveType || null
      downlink = connection.downlink || null
      rtt = connection.rtt || null
    }
    
    // Determine network quality and mode
    let networkQuality: 'none' | 'poor' | 'moderate' | 'good' = 'good'
    let networkMode: NetworkMode = 'full'
    
    if (!isOnline) {
      networkQuality = 'none'
      networkMode = 'survival'
    } else if (effectiveType === 'slow-2g' || effectiveType === '2g' || (rtt && rtt > 1000)) {
      networkQuality = 'poor'
      networkMode = 'survival'
    } else if (effectiveType === '3g' || (rtt && rtt > 500)) {
      networkQuality = 'moderate'
      networkMode = 'resilient'
    } else {
      networkQuality = 'good'
      networkMode = 'full'
    }
    
    setStatus({
      isOnline,
      networkMode,
      networkQuality,
      effectiveType,
      downlink,
      rtt,
    })
  }, [])

  useEffect(() => {
    updateNetworkStatus()
    
    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)
    
    // Listen to connection changes if available
    const connection = (navigator as Navigator & { connection?: NetworkInformation })?.connection
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus)
    }
    
    // Periodic check
    const interval = setInterval(updateNetworkStatus, 5000)
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus)
      }
      clearInterval(interval)
    }
  }, [updateNetworkStatus])

  return status
}

// Network Information API types
interface NetworkInformation extends EventTarget {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
  downlink?: number
  rtt?: number
  saveData?: boolean
}
