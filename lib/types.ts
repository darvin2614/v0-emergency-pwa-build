// SafeRoute Types

export interface SafeHouse {
  id: string
  name: string
  latitude: number
  longitude: number
  capacity: number
  current_occupancy: number
  wifi_available: boolean
  medical_support: boolean
  distance?: number
  bearing?: number
}

export interface User {
  user_id: string
  last_lat: number | null
  last_lon: number | null
  paired_family_id: string | null
  last_seen: number
}

export interface SOS {
  id: string
  user_id: string
  latitude: number | null
  longitude: number | null
  message: string
  timestamp: number
  status: 'pending' | 'sent' | 'acknowledged'
}

export interface DisasterAlert {
  id: string
  type: 'cyclone' | 'flood' | 'tsunami' | 'earthquake'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  instructions: string
  issued_at: number
  expires_at?: number
}

export interface FamilyMember {
  user_id: string
  latitude: number | null
  longitude: number | null
  last_seen: number
  distance?: number
  bearing?: number
}

export type NetworkMode = 'survival' | 'resilient' | 'full'

export interface AppState {
  networkMode: NetworkMode
  isOnline: boolean
  networkQuality: 'none' | 'poor' | 'moderate' | 'good'
  currentLocation: { lat: number; lon: number } | null
  currentHeading: number | null
  compassAvailable: boolean
  gpsAvailable: boolean
}

export interface CompassTarget {
  name: string
  latitude: number
  longitude: number
  type: 'safehouse' | 'family'
}
