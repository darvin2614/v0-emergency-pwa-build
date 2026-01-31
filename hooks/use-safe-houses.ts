'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { SafeHouse } from '@/lib/types'
import { SAFE_HOUSES, getSafeHouses, cacheSafeHouses } from '@/lib/data/safe-houses'
import { calculateDistance, calculateBearing } from '@/lib/geo-utils'

interface UseSafeHousesOptions {
  userLat: number | null
  userLon: number | null
}

export function useSafeHouses({ userLat, userLon }: UseSafeHousesOptions) {
  const [safeHouses, setSafeHouses] = useState<SafeHouse[]>(SAFE_HOUSES)
  const [selectedHouse, setSelectedHouse] = useState<SafeHouse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load safe houses from cache/API
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const houses = await getSafeHouses()
        setSafeHouses(houses)
        cacheSafeHouses(houses)
      } catch {
        // Use default data
        setSafeHouses(SAFE_HOUSES)
      }
      setIsLoading(false)
    }
    
    load()
  }, [])

  // Calculate distances and bearings when user location changes
  const housesWithDistance = useMemo(() => {
    if (userLat === null || userLon === null) {
      return safeHouses.map(h => ({ ...h, distance: undefined, bearing: undefined }))
    }
    
    return safeHouses.map(house => ({
      ...house,
      distance: calculateDistance(userLat, userLon, house.latitude, house.longitude),
      bearing: calculateBearing(userLat, userLon, house.latitude, house.longitude),
    }))
  }, [safeHouses, userLat, userLon])

  // Get nearest safe house
  const nearestHouse = useMemo(() => {
    const sorted = [...housesWithDistance]
      .filter(h => h.distance !== undefined)
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
    
    return sorted[0] ?? null
  }, [housesWithDistance])

  // Select house
  const selectHouse = useCallback((house: SafeHouse | null) => {
    setSelectedHouse(house)
  }, [])

  // Select nearest house
  const selectNearest = useCallback(() => {
    setSelectedHouse(nearestHouse)
  }, [nearestHouse])

  // Update selected house with current distance/bearing
  const selectedHouseWithDistance = useMemo(() => {
    if (!selectedHouse) return null
    return housesWithDistance.find(h => h.id === selectedHouse.id) ?? null
  }, [selectedHouse, housesWithDistance])

  return {
    safeHouses: housesWithDistance,
    selectedHouse: selectedHouseWithDistance,
    nearestHouse,
    selectHouse,
    selectNearest,
    isLoading,
  }
}
