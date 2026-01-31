'use client'

import { useState, useEffect, useCallback } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
  permissionState: PermissionState | null
  lastUpdate: number | null
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
    permissionState: null,
    lastUpdate: null,
  })

  const [watchId, setWatchId] = useState<number | null>(null)

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    console.log('[v0] Geolocation success:', position.coords.latitude, position.coords.longitude)
    setState(prev => ({
      ...prev,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      loading: false,
      lastUpdate: Date.now(),
    }))
    
    // Cache last known position
    try {
      localStorage.setItem('saferoute_last_position', JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now(),
      }))
    } catch {
      // Storage not available
    }
  }, [])

  const handleError = useCallback((error: GeolocationPositionError) => {
    console.log('[v0] Geolocation error:', error.code, error.message)
    let errorMessage: string
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied'
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location unavailable'
        break
      case error.TIMEOUT:
        errorMessage = 'Location request timed out'
        break
      default:
        errorMessage = 'Unknown location error'
    }
    
    // Try to use cached position
    try {
      const cached = localStorage.getItem('saferoute_last_position')
      if (cached) {
        const { latitude, longitude, timestamp } = JSON.parse(cached)
        // Use cached position if less than 1 hour old
        if (Date.now() - timestamp < 3600000) {
          setState(prev => ({
            ...prev,
            latitude,
            longitude,
            accuracy: null,
            error: `Using cached location. ${errorMessage}`,
            loading: false,
            lastUpdate: timestamp,
          }))
          return
        }
      }
    } catch {
      // No cached position
    }
    
    setState(prev => ({
      ...prev,
      error: errorMessage,
      loading: false,
    }))
  }, [])

  const requestPermission = useCallback(async () => {
    console.log('[v0] useGeolocation.requestPermission called')
    
    if (!navigator.geolocation) {
      console.log('[v0] Geolocation not supported')
      setState(prev => ({
        ...prev,
        error: 'Geolocation not supported',
        loading: false,
      }))
      return
    }

    console.log('[v0] Geolocation supported, setting loading state')
    setState(prev => ({ ...prev, loading: true }))

    // Check permission state
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      setState(prev => ({ ...prev, permissionState: permission.state }))
      
      permission.onchange = () => {
        setState(prev => ({ ...prev, permissionState: permission.state }))
      }
    } catch {
      // Permissions API not supported
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    }

    // Get initial position
    console.log('[v0] Getting current position...')
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options)

    // Start watching
    console.log('[v0] Starting position watch...')
    const id = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      ...options,
      maximumAge: 5000,
    })
    
    console.log('[v0] Watch started with id:', id)
    setWatchId(id)
  }, [handleSuccess, handleError])

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
  }, [watchId])

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  return {
    ...state,
    requestPermission,
    stopWatching,
    isWatching: watchId !== null,
  }
}
