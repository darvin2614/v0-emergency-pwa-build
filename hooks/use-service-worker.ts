'use client'

import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Skip service worker registration in development/preview environments
    // Service workers require the script to be served with correct MIME type
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // Only register in production with proper hosting
    const isLocalhost = window.location.hostname === 'localhost'
    const isVercelPreview = window.location.hostname.includes('vusercontent.net')
    
    if (isVercelPreview) {
      // Skip SW registration in v0 preview - it doesn't support static JS files
      console.log('[v0] Service worker skipped in preview environment')
      return
    }

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })
        
        setRegistration(reg)
        setIsInstalled(true)
        
        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setIsUpdateAvailable(true)
              }
            })
          }
        })
        
        // Check for updates periodically (only in production)
        if (!isLocalhost) {
          setInterval(() => {
            reg.update()
          }, 60000)
        }
        
      } catch (error) {
        // Silently fail - app works without service worker
        console.log('[v0] Service worker registration skipped:', error)
      }
    }

    registerSW()
  }, [])

  const updateServiceWorker = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  return {
    isInstalled,
    isUpdateAvailable,
    updateServiceWorker,
  }
}
