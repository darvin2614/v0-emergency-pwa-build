import { NextResponse } from 'next/server'
import { SAFE_HOUSES } from '@/lib/data/safe-houses'

export async function GET() {
  // In production, fetch from database with real-time occupancy data
  // For demo, return the seeded data
  return NextResponse.json({
    safeHouses: SAFE_HOUSES,
    lastUpdated: Date.now(),
  })
}
