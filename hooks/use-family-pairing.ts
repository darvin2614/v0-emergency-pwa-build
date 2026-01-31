'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { FamilyMember } from '@/lib/types'
import { calculateDistance, calculateBearing } from '@/lib/geo-utils'

interface UseFamilyPairingOptions {
  userId: string
  userLat: number | null
  userLon: number | null
}

export function useFamilyPairing({ userId, userLat, userLon }: UseFamilyPairingOptions) {
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load saved family ID from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('saferoute_family_id')
      if (saved) {
        setFamilyId(saved)
      }
    } catch {
      // Storage not available
    }
  }, [])

  // Connect to WebSocket for real-time family updates
  const connectWebSocket = useCallback(() => {
    if (!familyId || wsRef.current?.readyState === WebSocket.OPEN) return
    
    setIsConnecting(true)
    setError(null)
    
    try {
      // Use relative WebSocket URL that works with the API route
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/family-ws?familyId=${familyId}&userId=${userId}`
      
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = () => {
        setIsConnecting(false)
        // Send initial location
        if (userLat !== null && userLon !== null) {
          ws.send(JSON.stringify({
            type: 'location_update',
            userId,
            latitude: userLat,
            longitude: userLon,
            timestamp: Date.now(),
          }))
        }
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'family_update') {
            // Update family members with distance/bearing
            const members: FamilyMember[] = (data.members || [])
              .filter((m: FamilyMember) => m.user_id !== userId)
              .map((m: FamilyMember) => ({
                ...m,
                distance: userLat !== null && userLon !== null && m.latitude !== null && m.longitude !== null
                  ? calculateDistance(userLat, userLon, m.latitude, m.longitude)
                  : undefined,
                bearing: userLat !== null && userLon !== null && m.latitude !== null && m.longitude !== null
                  ? calculateBearing(userLat, userLon, m.latitude, m.longitude)
                  : undefined,
              }))
            
            setFamilyMembers(members)
          }
        } catch {
          // Invalid message
        }
      }
      
      ws.onerror = () => {
        setError('Connection error')
        setIsConnecting(false)
      }
      
      ws.onclose = () => {
        setIsConnecting(false)
        // Attempt reconnect after 5 seconds
        if (familyId) {
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000)
        }
      }
      
      wsRef.current = ws
    } catch {
      setError('Failed to connect')
      setIsConnecting(false)
    }
  }, [familyId, userId, userLat, userLon])

  // Connect when family ID is set
  useEffect(() => {
    if (familyId) {
      connectWebSocket()
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [familyId, connectWebSocket])

  // Send location updates
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && userLat !== null && userLon !== null) {
      wsRef.current.send(JSON.stringify({
        type: 'location_update',
        userId,
        latitude: userLat,
        longitude: userLon,
        timestamp: Date.now(),
      }))
    }
  }, [userId, userLat, userLon])

  // Join family
  const joinFamily = useCallback((newFamilyId: string) => {
    if (!newFamilyId.trim()) {
      setError('Please enter a family ID')
      return
    }
    
    const normalizedId = newFamilyId.trim().toUpperCase()
    setFamilyId(normalizedId)
    
    try {
      localStorage.setItem('saferoute_family_id', normalizedId)
    } catch {
      // Storage not available
    }
  }, [])

  // Leave family
  const leaveFamily = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setFamilyId(null)
    setFamilyMembers([])
    
    try {
      localStorage.removeItem('saferoute_family_id')
    } catch {
      // Storage not available
    }
  }, [])

  // Generate random family ID
  const generateFamilyId = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let id = ''
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)]
    }
    return id
  }, [])

  return {
    familyId,
    familyMembers,
    isConnecting,
    error,
    joinFamily,
    leaveFamily,
    generateFamilyId,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  }
}
