import { NextResponse } from 'next/server'
import { DISASTER_ALERTS } from '@/lib/data/disaster-alerts'

export async function GET() {
  // In production, fetch from real disaster alert APIs
  // Filter out expired alerts
  const activeAlerts = DISASTER_ALERTS.filter(
    alert => !alert.expires_at || alert.expires_at > Date.now()
  )
  
  return NextResponse.json({
    alerts: activeAlerts,
    lastUpdated: Date.now(),
  })
}
