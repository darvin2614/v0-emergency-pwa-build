'use client'

import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
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
        
        // Check for updates periodically
        setInterval(() => {
          reg.update()
        }, 60000) // Every minute
        
      } catch (error) {
        console.error('[ServiceWorker] Registration failed:', error)
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
