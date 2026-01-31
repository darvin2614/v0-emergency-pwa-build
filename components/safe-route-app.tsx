'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { NetworkMode, FamilyMember, CompassTarget, DisasterAlert } from '@/lib/types'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useCompass } from '@/hooks/use-compass'
import { useSafeHouses } from '@/hooks/use-safe-houses'
import { useFamilyPairing } from '@/hooks/use-family-pairing'
import { useSOS } from '@/hooks/use-sos'
import { useServiceWorker } from '@/hooks/use-service-worker'
import { CompassDisplay } from '@/components/compass/compass-display'
import { CompassPermission } from '@/components/compass/compass-permission'
import { SafeHouseList } from '@/components/safe-houses/safe-house-list'
import { FamilyPairing } from '@/components/family/family-pairing'
import { SOSButton } from '@/components/sos/sos-button'
import { DisasterAlerts } from '@/components/alerts/disaster-alerts'
import { NetworkStatus } from '@/components/ui/network-status'
import { BottomNav, type TabId } from '@/components/navigation/bottom-nav'
import { calculateBearing, calculateDistance } from '@/lib/geo-utils'
import { DISASTER_ALERTS } from '@/lib/data/disaster-alerts'

// Generate persistent user ID
function getUserId(): string {
  if (typeof window === 'undefined') return ''
  
  let userId = localStorage.getItem('saferoute_user_id')
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('saferoute_user_id', userId)
  }
  return userId
}

export function SafeRouteApp() {
  const [activeTab, setActiveTab] = useState<TabId>('compass')
  const [userId, setUserId] = useState<string>('')
  const [sensorsEnabled, setSensorsEnabled] = useState(false)
  
  // Debug: Log state changes
  console.log('[v0] SafeRouteApp render - sensorsEnabled:', sensorsEnabled, 'activeTab:', activeTab)
  const [compassTarget, setCompassTarget] = useState<CompassTarget | null>(null)
  const [alerts, setAlerts] = useState<DisasterAlert[]>(DISASTER_ALERTS)
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string | null>(null)
  
  // Service Worker
  useServiceWorker()
  
  // Network status
  const network = useNetworkStatus()
  
  // Geolocation
  const geo = useGeolocation()
  
  // Compass
  const compass = useCompass()
  
  // Safe houses
  const safeHouses = useSafeHouses({
    userLat: geo.latitude,
    userLon: geo.longitude,
  })
  
  // Family pairing
  const family = useFamilyPairing({
    userId,
    userLat: geo.latitude,
    userLon: geo.longitude,
  })
  
  // SOS
  const sos = useSOS({
    userId,
    userLat: geo.latitude,
    userLon: geo.longitude,
  })
  
  // Initialize user ID
  useEffect(() => {
    setUserId(getUserId())
  }, [])
  
  // Load alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts')
        if (res.ok) {
          const data = await res.json()
          setAlerts(data.alerts)
        }
      } catch {
        // Use cached/default alerts
      }
    }
    
    fetchAlerts()
    
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 300000)
    return () => clearInterval(interval)
  }, [])
  
  // Request sensor permissions
  const handleRequestPermission = useCallback(async () => {
    console.log('[v0] handleRequestPermission called')
    try {
      console.log('[v0] Requesting geo permission...')
      await geo.requestPermission()
      console.log('[v0] Geo permission done, starting compass...')
      await compass.startCompass()
      console.log('[v0] Compass started, enabling sensors')
      setSensorsEnabled(true)
    } catch (err) {
      console.log('[v0] Permission error:', err)
      // Still enable sensors even if one fails
      setSensorsEnabled(true)
    }
  }, [geo, compass])
  
  // Handle safe house selection
  const handleSelectSafeHouse = useCallback((house: typeof safeHouses.safeHouses[0]) => {
    console.log('[v0] handleSelectSafeHouse called', house.name)
    safeHouses.selectHouse(house)
    setSelectedFamilyMemberId(null)
    setCompassTarget({
      name: house.name,
      latitude: house.latitude,
      longitude: house.longitude,
      type: 'safehouse',
    })
    setActiveTab('compass')
  }, [safeHouses])
  
  // Handle family member selection
  const handleSelectFamilyMember = useCallback((member: FamilyMember) => {
    if (member.latitude === null || member.longitude === null) return
    
    setSelectedFamilyMemberId(member.user_id)
    safeHouses.selectHouse(null)
    setCompassTarget({
      name: `Family Member ${member.user_id.slice(0, 8)}`,
      latitude: member.latitude,
      longitude: member.longitude,
      type: 'family',
    })
    setActiveTab('compass')
  }, [safeHouses])
  
  // Calculate target bearing and distance
  const targetInfo = useMemo(() => {
    if (!compassTarget || geo.latitude === null || geo.longitude === null) {
      return { bearing: null, distance: null }
    }
    
    return {
      bearing: calculateBearing(
        geo.latitude,
        geo.longitude,
        compassTarget.latitude,
        compassTarget.longitude
      ),
      distance: calculateDistance(
        geo.latitude,
        geo.longitude,
        compassTarget.latitude,
        compassTarget.longitude
      ),
    }
  }, [compassTarget, geo.latitude, geo.longitude])
  
  // Auto-select nearest safe house on first location
  useEffect(() => {
    if (safeHouses.nearestHouse && !compassTarget && sensorsEnabled) {
      setCompassTarget({
        name: safeHouses.nearestHouse.name,
        latitude: safeHouses.nearestHouse.latitude,
        longitude: safeHouses.nearestHouse.longitude,
        type: 'safehouse',
      })
      safeHouses.selectHouse(safeHouses.nearestHouse)
    }
  }, [safeHouses.nearestHouse, compassTarget, sensorsEnabled])
  
  // Determine effective network mode (allow manual override for testing)
  const networkMode: NetworkMode = network.networkMode
  
  // Header component
  const Header = () => (
    <header className={cn(
      "p-4",
      networkMode === 'survival' && "bg-black border-b-2 border-yellow-400",
      networkMode === 'resilient' && "bg-secondary border-b border-border",
      networkMode === 'full' && "bg-card border-b border-border shadow-sm"
    )}>
      <div className="flex items-center justify-between">
        <h1 className={cn(
          "font-bold",
          networkMode === 'survival' && "text-yellow-400 text-xl",
          networkMode !== 'survival' && "text-xl"
        )}>
          SafeRoute
        </h1>
        <NetworkStatus
          isOnline={network.isOnline}
          networkMode={networkMode}
          networkQuality={network.networkQuality}
        />
      </div>
    </header>
  )
  
  // Main content based on active tab
  const renderContent = () => {
    // Show permission request if sensors not enabled
    if (!sensorsEnabled) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <CompassPermission
            onRequestPermission={handleRequestPermission}
            networkMode={networkMode}
            gpsError={geo.error}
            compassError={compass.error}
            isLoading={geo.loading}
          />
        </div>
      )
    }
    
    switch (activeTab) {
      case 'compass':
        return (
          <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto">
            <CompassDisplay
              heading={compass.heading}
              targetBearing={targetInfo.bearing}
              targetDistance={targetInfo.distance}
              targetName={compassTarget?.name ?? null}
              networkMode={networkMode}
              isCalibrating={compass.isCalibrating}
              compassError={compass.error}
            />
            
            {/* Quick select nearest */}
            {safeHouses.nearestHouse && (
              <button
                onClick={() => handleSelectSafeHouse(safeHouses.nearestHouse!)}
                className={cn(
                  "w-full p-3 rounded-lg text-center font-medium transition-colors",
                  networkMode === 'survival' 
                    ? "bg-green-600 text-white border-2 border-green-400" 
                    : "bg-green-500 text-white hover:bg-green-600"
                )}
              >
                {networkMode === 'survival' ? 'GO TO NEAREST SAFE HOUSE' : 'Navigate to Nearest Safe House'}
              </button>
            )}
            
            {/* SOS Button - always visible on compass tab */}
            <div className="mt-auto">
              <SOSButton
                onSendSOS={sos.sendSOS}
                isSending={sos.isSending}
                hasPending={sos.hasPending}
                lastSentTime={sos.lastSentTime}
                networkMode={networkMode}
              />
            </div>
          </div>
        )
      
      case 'safehouses':
        return (
          <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto">
            <SafeHouseList
              safeHouses={safeHouses.safeHouses}
              selectedId={safeHouses.selectedHouse?.id ?? null}
              onSelect={handleSelectSafeHouse}
              networkMode={networkMode}
              currentHeading={compass.heading}
            />
          </div>
        )
      
      case 'family':
        return (
          <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto">
            <FamilyPairing
              familyId={family.familyId}
              familyMembers={family.familyMembers}
              isConnecting={family.isConnecting}
              isConnected={family.isConnected}
              error={family.error}
              currentHeading={compass.heading}
              networkMode={networkMode}
              onJoinFamily={family.joinFamily}
              onLeaveFamily={family.leaveFamily}
              onGenerateId={family.generateFamilyId}
              onSelectMember={handleSelectFamilyMember}
              selectedMemberId={selectedFamilyMemberId}
            />
            
            {/* SOS Button - duplicated for accessibility */}
            <div className="mt-auto">
              <SOSButton
                onSendSOS={sos.sendSOS}
                isSending={sos.isSending}
                hasPending={sos.hasPending}
                lastSentTime={sos.lastSentTime}
                networkMode={networkMode}
              />
            </div>
          </div>
        )
      
      case 'alerts':
        return (
          <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto">
            <DisasterAlerts
              alerts={alerts}
              networkMode={networkMode}
            />
            
            {alerts.length === 0 && (
              <div className={cn(
                "text-center p-8",
                networkMode === 'survival' && "text-yellow-400",
                networkMode !== 'survival' && "text-muted-foreground"
              )}>
                {networkMode === 'survival' ? 'NO ACTIVE ALERTS' : 'No active disaster alerts in your area'}
              </div>
            )}
            
            {/* SOS Button - duplicated for accessibility */}
            <div className="mt-auto">
              <SOSButton
                onSendSOS={sos.sendSOS}
                isSending={sos.isSending}
                hasPending={sos.hasPending}
                lastSentTime={sos.lastSentTime}
                networkMode={networkMode}
              />
            </div>
          </div>
        )
      
      default:
        return null
    }
  }
  
  return (
    <div className={cn(
      "flex flex-col h-screen",
      networkMode === 'survival' && "bg-black text-yellow-400",
      networkMode === 'resilient' && "bg-background",
      networkMode === 'full' && "bg-background"
    )}>
      <Header />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>
      
      {sensorsEnabled && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          networkMode={networkMode}
          alertCount={alerts.length}
        />
      )}
    </div>
  )
}
