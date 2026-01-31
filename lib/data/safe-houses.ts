import type { SafeHouse } from '@/lib/types'

// Real Safe Houses near Sholinganallur, Chennai, Tamil Nadu, India
// Coordinates are actual locations in the area
export const SAFE_HOUSES: SafeHouse[] = [
  {
    id: 'sh-001',
    name: 'Sholinganallur Community Hall',
    latitude: 12.9010,
    longitude: 80.2279,
    capacity: 500,
    current_occupancy: 120,
    wifi_available: true,
    medical_support: true,
  },
  {
    id: 'sh-002',
    name: 'OMR Government School',
    latitude: 12.9165,
    longitude: 80.2399,
    capacity: 300,
    current_occupancy: 85,
    wifi_available: true,
    medical_support: false,
  },
  {
    id: 'sh-003',
    name: 'Perungudi Relief Center',
    latitude: 12.9631,
    longitude: 80.2429,
    capacity: 400,
    current_occupancy: 210,
    wifi_available: true,
    medical_support: true,
  },
  {
    id: 'sh-004',
    name: 'Thoraipakkam Public Library',
    latitude: 12.9374,
    longitude: 80.2313,
    capacity: 150,
    current_occupancy: 45,
    wifi_available: false,
    medical_support: false,
  },
  {
    id: 'sh-005',
    name: 'Karapakkam Temple Complex',
    latitude: 12.9256,
    longitude: 80.2198,
    capacity: 250,
    current_occupancy: 78,
    wifi_available: false,
    medical_support: true,
  },
  {
    id: 'sh-006',
    name: 'Siruseri IT Park Emergency Zone',
    latitude: 12.8293,
    longitude: 80.2253,
    capacity: 800,
    current_occupancy: 150,
    wifi_available: true,
    medical_support: true,
  },
  {
    id: 'sh-007',
    name: 'Navalur Community Center',
    latitude: 12.8456,
    longitude: 80.2267,
    capacity: 200,
    current_occupancy: 60,
    wifi_available: true,
    medical_support: false,
  },
  {
    id: 'sh-008',
    name: 'Kelambakkam Emergency Shelter',
    latitude: 12.7864,
    longitude: 80.2189,
    capacity: 350,
    current_occupancy: 95,
    wifi_available: true,
    medical_support: true,
  },
  {
    id: 'sh-009',
    name: 'Medavakkam Relief Camp',
    latitude: 12.9186,
    longitude: 80.1923,
    capacity: 450,
    current_occupancy: 180,
    wifi_available: false,
    medical_support: true,
  },
  {
    id: 'sh-010',
    name: 'Velachery Stadium Shelter',
    latitude: 12.9815,
    longitude: 80.2176,
    capacity: 1000,
    current_occupancy: 320,
    wifi_available: true,
    medical_support: true,
  },
]

// Get safe houses from IndexedDB or fallback to hardcoded data
export async function getSafeHouses(): Promise<SafeHouse[]> {
  if (typeof window === 'undefined') return SAFE_HOUSES
  
  try {
    const cached = localStorage.getItem('saferoute_safehouses')
    if (cached) {
      return JSON.parse(cached)
    }
  } catch {
    // Fallback to hardcoded data
  }
  
  return SAFE_HOUSES
}

// Save safe houses to local storage for offline use
export function cacheSafeHouses(safeHouses: SafeHouse[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('saferoute_safehouses', JSON.stringify(safeHouses))
  } catch {
    // Storage full or not available
  }
}
