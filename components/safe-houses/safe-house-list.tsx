'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { SafeHouse, NetworkMode } from '@/lib/types'
import { formatDistance, getCardinalDirection, getDirectionArrow } from '@/lib/geo-utils'

interface SafeHouseListProps {
  safeHouses: SafeHouse[]
  selectedId: string | null
  onSelect: (safeHouse: SafeHouse) => void
  networkMode: NetworkMode
  currentHeading: number | null
}

export function SafeHouseList({
  safeHouses,
  selectedId,
  onSelect,
  networkMode,
  currentHeading,
}: SafeHouseListProps) {
  // Sort by distance
  const sortedHouses = useMemo(() => {
    return [...safeHouses].sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
  }, [safeHouses])

  // Survival mode - text only
  if (networkMode === 'survival') {
    return (
      <div className="flex flex-col gap-2 bg-black p-4 rounded-lg border-2 border-yellow-400">
        <div className="text-yellow-400 font-bold uppercase text-center mb-2">
          SAFE HOUSES ({sortedHouses.length})
        </div>
        
        {sortedHouses.map((house, index) => {
          const relativeAngle = currentHeading !== null && house.bearing !== undefined
            ? (house.bearing - currentHeading + 360) % 360
            : house.bearing ?? 0
          const arrow = getDirectionArrow(relativeAngle)
          const direction = house.bearing !== undefined ? getCardinalDirection(house.bearing) : '?'
          
          return (
            <button
              key={house.id}
              onClick={() => onSelect(house)}
              className={cn(
                "w-full p-3 text-left border-2 rounded",
                selectedId === house.id
                  ? "border-yellow-400 bg-yellow-400/20 text-yellow-400"
                  : "border-yellow-400/50 text-yellow-200"
              )}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg truncate">
                    {index + 1}. {house.name}
                  </div>
                  <div className="text-sm mt-1">
                    {house.wifi_available ? 'WIFI ' : ''}
                    {house.medical_support ? 'MEDICAL ' : ''}
                    {house.current_occupancy}/{house.capacity}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-bold">{arrow}</div>
                  <div className="text-sm font-mono">{direction}</div>
                  <div className="text-sm font-mono">
                    {house.distance !== undefined ? formatDistance(house.distance) : '---'}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  // Resilient mode
  if (networkMode === 'resilient') {
    return (
      <div className="flex flex-col gap-2 bg-secondary p-4 rounded-lg">
        <div className="font-semibold text-center mb-2">
          Safe Houses ({sortedHouses.length})
        </div>
        
        {sortedHouses.map((house, index) => {
          const relativeAngle = currentHeading !== null && house.bearing !== undefined
            ? (house.bearing - currentHeading + 360) % 360
            : house.bearing ?? 0
          const arrow = getDirectionArrow(relativeAngle)
          
          return (
            <button
              key={house.id}
              onClick={() => onSelect(house)}
              className={cn(
                "w-full p-3 text-left rounded-lg transition-colors",
                selectedId === house.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-accent"
              )}
            >
              <div className="flex justify-between items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {index + 1}. {house.name}
                  </div>
                  <div className="text-xs opacity-70 flex gap-2 mt-1">
                    {house.wifi_available && <span>WiFi</span>}
                    {house.medical_support && <span>Medical</span>}
                    <span>{house.current_occupancy}/{house.capacity}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl">{arrow}</div>
                  <div className="text-sm font-mono">
                    {house.distance !== undefined ? formatDistance(house.distance) : '---'}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  // Full mode
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-semibold text-lg">Nearby Safe Houses</h2>
        <span className="text-sm text-muted-foreground">{sortedHouses.length} locations</span>
      </div>
      
      <div className="flex flex-col gap-2">
        {sortedHouses.map((house, index) => {
          const relativeAngle = currentHeading !== null && house.bearing !== undefined
            ? (house.bearing - currentHeading + 360) % 360
            : house.bearing ?? 0
          const arrow = getDirectionArrow(relativeAngle)
          const occupancyPercent = (house.current_occupancy / house.capacity) * 100
          
          return (
            <button
              key={house.id}
              onClick={() => onSelect(house)}
              className={cn(
                "w-full p-4 text-left rounded-xl border transition-all",
                selectedId === house.id
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
              )}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-medium truncate">{house.name}</span>
                  </div>
                  
                  {/* Features */}
                  <div className="flex gap-2 mt-2">
                    {house.wifi_available && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">WiFi</span>
                    )}
                    {house.medical_support && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Medical</span>
                    )}
                  </div>
                  
                  {/* Capacity bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Capacity</span>
                      <span>{house.current_occupancy}/{house.capacity}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          occupancyPercent > 90 ? "bg-red-500" :
                          occupancyPercent > 70 ? "bg-yellow-500" : "bg-green-500"
                        )}
                        style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Direction */}
                <div className="text-center shrink-0">
                  <div className="text-3xl">{arrow}</div>
                  <div className="text-sm font-mono text-muted-foreground">
                    {house.bearing !== undefined ? getCardinalDirection(house.bearing) : '---'}
                  </div>
                  <div className="text-lg font-bold">
                    {house.distance !== undefined ? formatDistance(house.distance) : '---'}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
