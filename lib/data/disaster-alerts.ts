import type { DisasterAlert } from '@/lib/types'

// Sample disaster alerts for Chennai region
export const DISASTER_ALERTS: DisasterAlert[] = [
  {
    id: 'alert-001',
    type: 'cyclone',
    severity: 'high',
    description: 'Cyclone Michaung approaching Chennai coast. Expected landfall in 24-36 hours.',
    instructions: 'Move to higher ground. Stock water and food. Secure loose objects. Stay away from windows. Keep emergency kit ready.',
    issued_at: Date.now() - 3600000, // 1 hour ago
    expires_at: Date.now() + 86400000, // Expires in 24 hours
  },
  {
    id: 'alert-002',
    type: 'flood',
    severity: 'medium',
    description: 'Heavy rainfall expected. Low-lying areas of Sholinganallur may experience waterlogging.',
    instructions: 'Avoid low-lying areas. Do not drive through flooded roads. Move valuables to higher levels. Keep drainage clear.',
    issued_at: Date.now() - 7200000, // 2 hours ago
    expires_at: Date.now() + 43200000, // Expires in 12 hours
  },
]

export async function getDisasterAlerts(): Promise<DisasterAlert[]> {
  if (typeof window === 'undefined') return DISASTER_ALERTS
  
  try {
    const cached = localStorage.getItem('saferoute_alerts')
    if (cached) {
      const alerts = JSON.parse(cached) as DisasterAlert[]
      // Filter out expired alerts
      return alerts.filter(a => !a.expires_at || a.expires_at > Date.now())
    }
  } catch {
    // Fallback to hardcoded data
  }
  
  return DISASTER_ALERTS
}

export function cacheDisasterAlerts(alerts: DisasterAlert[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('saferoute_alerts', JSON.stringify(alerts))
  } catch {
    // Storage full or not available
  }
}
