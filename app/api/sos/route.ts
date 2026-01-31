import { NextRequest, NextResponse } from 'next/server'

// In-memory store for SOS messages (in production, use a database)
const sosMessages: Map<string, {
  id: string
  user_id: string
  latitude: number | null
  longitude: number | null
  message: string
  timestamp: number
  status: string
}> = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { id, user_id, latitude, longitude, message, timestamp } = body
    
    if (!id || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Store the SOS message
    sosMessages.set(id, {
      id,
      user_id,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      message: message || 'Emergency',
      timestamp: timestamp || Date.now(),
      status: 'received',
    })
    
    // In production, you would:
    // 1. Store in database
    // 2. Notify emergency services
    // 3. Alert family members
    // 4. Send push notifications
    
    console.log('[SOS RECEIVED]', {
      id,
      user_id,
      location: latitude && longitude ? `${latitude}, ${longitude}` : 'Unknown',
      message,
      timestamp: new Date(timestamp).toISOString(),
    })
    
    return NextResponse.json({
      success: true,
      id,
      status: 'received',
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('[SOS ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to process SOS' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return recent SOS messages (for admin/monitoring)
  const messages = Array.from(sosMessages.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50)
  
  return NextResponse.json({ messages })
}
