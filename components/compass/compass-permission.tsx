'use client'

import { Button } from '@/components/ui/button'
import type { NetworkMode } from '@/lib/types'

interface CompassPermissionProps {
  onRequestPermission: () => void
  networkMode: NetworkMode
  gpsError?: string | null
  compassError?: string | null
  isLoading?: boolean
}

export function CompassPermission({
  onRequestPermission,
  networkMode,
  gpsError,
  compassError,
  isLoading,
}: CompassPermissionProps) {
  // Survival mode - text only
  if (networkMode === 'survival') {
    return (
      <div className="flex flex-col gap-4 p-6 bg-black text-yellow-400 border-2 border-yellow-400 rounded-lg">
        <div className="text-xl font-bold text-center uppercase">
          ENABLE SENSORS
        </div>
        
        <div className="text-center text-yellow-200">
          SafeRoute needs access to your device sensors to provide navigation.
        </div>
        
        {gpsError && (
          <div className="text-red-400 text-center">GPS: {gpsError}</div>
        )}
        
        {compassError && (
          <div className="text-red-400 text-center">COMPASS: {compassError}</div>
        )}
        
        <button
          onClick={onRequestPermission}
          disabled={isLoading}
          className="w-full py-4 text-xl font-bold bg-yellow-400 text-black rounded active:bg-yellow-300 disabled:opacity-50"
        >
          {isLoading ? 'ENABLING...' : 'TAP TO ENABLE'}
        </button>
        
        <div className="text-xs text-yellow-200/70 text-center">
          Your location is stored locally and never shared without your consent.
        </div>
      </div>
    )
  }

  // Resilient mode
  if (networkMode === 'resilient') {
    return (
      <div className="flex flex-col gap-4 p-6 bg-secondary rounded-lg">
        <div className="text-lg font-semibold text-center">
          Enable Location & Compass
        </div>
        
        <p className="text-center text-muted-foreground text-sm">
          SafeRoute uses your device&apos;s GPS and compass sensors to navigate you to safety.
        </p>
        
        {(gpsError || compassError) && (
          <div className="p-3 bg-destructive/10 rounded text-destructive text-sm">
            {gpsError && <div>GPS: {gpsError}</div>}
            {compassError && <div>Compass: {compassError}</div>}
          </div>
        )}
        
        <Button 
          onClick={onRequestPermission} 
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Enabling...' : 'Enable Sensors'}
        </Button>
      </div>
    )
  }

  // Full mode
  return (
    <div className="flex flex-col gap-6 p-8 bg-card rounded-xl shadow-lg border border-border max-w-md mx-auto">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold">Enable Navigation</h2>
        <p className="mt-2 text-muted-foreground">
          SafeRoute needs access to your location and compass to guide you to safety during emergencies.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
          <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <div>
            <div className="font-medium text-sm">GPS Location</div>
            <div className="text-xs text-muted-foreground">Find nearest safe houses and calculate distances</div>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
          <svg className="w-5 h-5 text-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div className="font-medium text-sm">Compass Heading</div>
            <div className="text-xs text-muted-foreground">Point you in the right direction without maps</div>
          </div>
        </div>
      </div>

      {(gpsError || compassError) && (
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <div className="font-medium text-destructive text-sm mb-1">Permission Issues</div>
          {gpsError && <div className="text-sm text-destructive/80">GPS: {gpsError}</div>}
          {compassError && <div className="text-sm text-destructive/80">Compass: {compassError}</div>}
        </div>
      )}

      <Button 
        onClick={onRequestPermission} 
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Enabling...
          </span>
        ) : (
          'Enable Location & Compass'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your location data stays on your device and is only shared when you explicitly send an SOS.
      </p>
    </div>
  )
}
