'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { interpolateAngle } from '@/lib/geo-utils'

interface CompassState {
  heading: number | null
  accuracy: number | null
  error: string | null
  isSupported: boolean
  permissionState: 'granted' | 'denied' | 'prompt' | null
  isCalibrating: boolean
}

export function useCompass() {
  const [state, setState] = useState<CompassState>({
    heading: null,
    accuracy: null,
    error: null,
    isSupported: false,
    permissionState: null,
    isCalibrating: false,
  })

  const smoothedHeading = useRef<number>(0)
  const animationFrame = useRef<number | null>(null)
  const lastHeading = useRef<number | null>(null)

  // Smooth heading updates using interpolation
  const updateSmoothedHeading = useCallback((targetHeading: number) => {
    if (lastHeading.current === null) {
      smoothedHeading.current = targetHeading
      lastHeading.current = targetHeading
    } else {
      // Interpolate for smooth rotation
      smoothedHeading.current = interpolateAngle(
        smoothedHeading.current,
        targetHeading,
        0.15 // Smoothing factor
      )
    }
    
    lastHeading.current = targetHeading
    
    setState(prev => ({
      ...prev,
      heading: Math.round(smoothedHeading.current * 10) / 10,
    }))
  }, [])

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    // Check for different heading properties
    // webkitCompassHeading is for iOS
    // alpha is for Android (needs adjustment based on screen orientation)
    
    let heading: number | null = null
    
    // iOS Safari
    if ('webkitCompassHeading' in event && typeof (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading === 'number') {
      heading = (event as DeviceOrientationEvent & { webkitCompassHeading: number }).webkitCompassHeading
    }
    // Android and other browsers
    else if (event.alpha !== null && event.absolute) {
      // alpha gives rotation around z-axis
      // For compass heading, we need to convert it
      heading = (360 - event.alpha) % 360
    }
    // Fallback for non-absolute events
    else if (event.alpha !== null) {
      heading = (360 - event.alpha) % 360
    }
    
    if (heading !== null && !Number.isNaN(heading)) {
      updateSmoothedHeading(heading)
      
      // Check if calibrating (accuracy is poor)
      const accuracy = 'webkitCompassAccuracy' in event 
        ? (event as DeviceOrientationEvent & { webkitCompassAccuracy?: number }).webkitCompassAccuracy 
        : null
      
      setState(prev => ({
        ...prev,
        accuracy: accuracy ?? null,
        isCalibrating: accuracy !== null && accuracy > 25,
        error: null,
      }))
    }
  }, [updateSmoothedHeading])

  const requestPermission = useCallback(async () => {
    console.log('[v0] useCompass.requestPermission called')
    
    // Check if DeviceOrientationEvent is available
    if (typeof DeviceOrientationEvent === 'undefined') {
      console.log('[v0] DeviceOrientationEvent not available')
      setState(prev => ({
        ...prev,
        error: 'Device orientation not supported',
        isSupported: false,
      }))
      return false
    }

    console.log('[v0] DeviceOrientationEvent available')
    // iOS 13+ requires explicit permission
    if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
        
        if (permission === 'granted') {
          setState(prev => ({
            ...prev,
            permissionState: 'granted',
            isSupported: true,
            error: null,
          }))
          return true
        } else {
          setState(prev => ({
            ...prev,
            permissionState: 'denied',
            error: 'Compass permission denied',
          }))
          return false
        }
      } catch {
        setState(prev => ({
          ...prev,
          error: 'Error requesting compass permission',
        }))
        return false
      }
    }

    // Non-iOS or older iOS - permission not required
    setState(prev => ({
      ...prev,
      permissionState: 'granted',
      isSupported: true,
    }))
    return true
  }, [])

  const startCompass = useCallback(async () => {
    console.log('[v0] startCompass called')
    const hasPermission = await requestPermission()
    console.log('[v0] Compass permission result:', hasPermission)
    
    if (hasPermission) {
      // Try absolute orientation first (more accurate)
      if ('ondeviceorientationabsolute' in window) {
        console.log('[v0] Using deviceorientationabsolute')
        window.addEventListener('deviceorientationabsolute', handleOrientation as EventListener)
      } else {
        console.log('[v0] Using deviceorientation')
        window.addEventListener('deviceorientation', handleOrientation)
      }
    }
  }, [requestPermission, handleOrientation])

  const stopCompass = useCallback(() => {
    window.removeEventListener('deviceorientationabsolute', handleOrientation as EventListener)
    window.removeEventListener('deviceorientation', handleOrientation)
    
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current)
    }
  }, [handleOrientation])

  useEffect(() => {
    // Check support on mount
    const isSupported = typeof DeviceOrientationEvent !== 'undefined'
    setState(prev => ({ ...prev, isSupported }))
    
    return () => {
      stopCompass()
    }
  }, [stopCompass])

  return {
    ...state,
    startCompass,
    stopCompass,
    requestPermission,
  }
}
