import { NextRequest, NextResponse } from 'next/server'

// In-memory store for family groups (in production, use a database)
const familyGroups: Map<string, Map<string, {
  user_id: string
  latitude: number | null
  longitude: number | null
  last_seen: number
}>> = new Map()

// Cleanup old entries periodically
const STALE_THRESHOLD = 300000 // 5 minutes

function cleanupStaleEntries() {
  const now = Date.now()
  familyGroups.forEach((members, familyId) => {
    members.forEach((member, userId) => { // Fixed undeclared variable userId
      if (now - member.last_seen > STALE_THRESHOLD) {
        members.delete(userId)
      }
    })
    if (members.size === 0) {
      familyGroups.delete(familyId)
    }
  })
}

// Run cleanup every minute
setInterval(cleanupStaleEntries, 60000)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { familyId, userId, latitude, longitude } = body
    
    if (!familyId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Get or create family group
    if (!familyGroups.has(familyId)) {
      familyGroups.set(familyId, new Map())
    }
    
    const family = familyGroups.get(familyId)!
    
    // Update user's location
    family.set(userId, {
      user_id: userId,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      last_seen: Date.now(),
    })
    
    // Get all family members (excluding self)
    const members = Array.from(family.values())
      .filter(m => m.user_id !== userId) // Fixed undeclared variable odid
    
    return NextResponse.json({
      success: true,
      familyId,
      members,
      memberCount: family.size,
    })
  } catch (error) {
    console.error('[FAMILY SYNC ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to sync family' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const familyId = request.nextUrl.searchParams.get('familyId')
  const userId = request.nextUrl.searchParams.get('userId')
  
  if (!familyId) {
    return NextResponse.json(
      { error: 'Missing familyId' },
      { status: 400 }
    )
  }
  
  const family = familyGroups.get(familyId)
  
  if (!family) {
    return NextResponse.json({
      familyId,
      members: [],
      memberCount: 0,
    })
  }
  
  const members = Array.from(family.values())
    .filter(m => m.user_id !== userId)
  
  return NextResponse.json({
    familyId,
    members,
    memberCount: family.size,
  })
}

export async function DELETE(request: NextRequest) {
  const familyId = request.nextUrl.searchParams.get('familyId')
  const userId = request.nextUrl.searchParams.get('userId')
  
  if (!familyId || !userId) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }
  
  const family = familyGroups.get(familyId)
  
  if (family) {
    family.delete(userId)
    if (family.size === 0) {
      familyGroups.delete(familyId)
    }
  }
  
  return NextResponse.json({ success: true })
}
