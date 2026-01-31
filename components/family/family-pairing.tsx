'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { NetworkMode, FamilyMember } from '@/lib/types'
import { formatDistance, getCardinalDirection, getDirectionArrow } from '@/lib/geo-utils'

interface FamilyPairingProps {
  familyId: string | null
  familyMembers: FamilyMember[]
  isConnecting: boolean
  isConnected: boolean
  error: string | null
  currentHeading: number | null
  networkMode: NetworkMode
  onJoinFamily: (familyId: string) => void
  onLeaveFamily: () => void
  onGenerateId: () => string
  onSelectMember: (member: FamilyMember) => void
  selectedMemberId?: string | null
}

export function FamilyPairing({
  familyId,
  familyMembers,
  isConnecting,
  isConnected,
  error,
  currentHeading,
  networkMode,
  onJoinFamily,
  onLeaveFamily,
  onGenerateId,
  onSelectMember,
  selectedMemberId,
}: FamilyPairingProps) {
  const [inputId, setInputId] = useState('')

  const handleJoin = () => {
    if (inputId.trim()) {
      onJoinFamily(inputId.trim())
      setInputId('')
    }
  }

  const handleGenerate = () => {
    const newId = onGenerateId()
    setInputId(newId)
  }

  // Survival mode
  if (networkMode === 'survival') {
    return (
      <div className="flex flex-col gap-4 p-4 bg-black border-2 border-yellow-400 rounded-lg">
        <div className="text-yellow-400 font-bold uppercase text-center">FAMILY FINDER</div>
        
        {!familyId ? (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value.toUpperCase())}
              placeholder="ENTER FAMILY CODE"
              className="w-full p-3 bg-black border-2 border-yellow-400 text-yellow-400 text-center text-xl font-mono placeholder:text-yellow-400/50"
              maxLength={6}
            />
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                className="flex-1 p-3 border-2 border-yellow-400 text-yellow-400 font-bold"
              >
                NEW CODE
              </button>
              <button
                onClick={handleJoin}
                disabled={!inputId.trim()}
                className="flex-1 p-3 bg-yellow-400 text-black font-bold disabled:opacity-50"
              >
                JOIN
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <div className="text-sm text-yellow-200">YOUR CODE</div>
              <div className="text-3xl font-mono font-bold text-yellow-400">{familyId}</div>
              <div className="text-sm text-yellow-200 mt-1">
                {isConnected ? 'CONNECTED' : isConnecting ? 'CONNECTING...' : 'OFFLINE'}
              </div>
            </div>
            
            {error && (
              <div className="text-red-400 text-center text-sm">{error}</div>
            )}
            
            {familyMembers.length > 0 ? (
              <div className="flex flex-col gap-2">
                <div className="text-sm text-yellow-200 text-center">
                  FAMILY MEMBERS ({familyMembers.length})
                </div>
                {familyMembers.map((member) => {
                  const relativeAngle = currentHeading !== null && member.bearing !== undefined
                    ? (member.bearing - currentHeading + 360) % 360
                    : member.bearing ?? 0
                  const arrow = getDirectionArrow(relativeAngle)
                  
                  return (
                    <button
                      key={member.user_id}
                      onClick={() => onSelectMember(member)}
                      className={`w-full p-3 border-2 text-left ${
                        selectedMemberId === member.user_id
                          ? 'border-yellow-400 bg-yellow-400/20'
                          : 'border-yellow-400/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-yellow-400 font-mono truncate">
                          {member.user_id.slice(0, 8)}...
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">{arrow}</span>
                          <span className="font-mono">
                            {member.distance !== undefined ? formatDistance(member.distance) : '---'}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="text-yellow-200/70 text-center text-sm">
                NO FAMILY MEMBERS ONLINE
              </div>
            )}
            
            <button
              onClick={onLeaveFamily}
              className="w-full p-3 border-2 border-red-400 text-red-400 font-bold"
            >
              LEAVE FAMILY
            </button>
          </div>
        )}
      </div>
    )
  }

  // Resilient mode
  if (networkMode === 'resilient') {
    return (
      <div className="flex flex-col gap-4 p-4 bg-secondary rounded-lg">
        <div className="font-semibold text-center">Family Finder</div>
        
        {!familyId ? (
          <div className="flex flex-col gap-3">
            <Input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value.toUpperCase())}
              placeholder="Enter Family Code"
              className="text-center font-mono"
              maxLength={6}
            />
            <div className="flex gap-2">
              <Button onClick={handleGenerate} variant="outline" className="flex-1 bg-transparent">
                Generate
              </Button>
              <Button onClick={handleJoin} disabled={!inputId.trim()} className="flex-1">
                Join
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Your Code</div>
              <div className="text-2xl font-mono font-bold">{familyId}</div>
              <div className={`text-xs ${isConnected ? 'text-green-500' : 'text-muted-foreground'}`}>
                {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Offline'}
              </div>
            </div>
            
            {familyMembers.length > 0 && (
              <div className="flex flex-col gap-2">
                {familyMembers.map((member) => {
                  const relativeAngle = currentHeading !== null && member.bearing !== undefined
                    ? (member.bearing - currentHeading + 360) % 360
                    : member.bearing ?? 0
                  const arrow = getDirectionArrow(relativeAngle)
                  
                  return (
                    <button
                      key={member.user_id}
                      onClick={() => onSelectMember(member)}
                      className={`w-full p-3 rounded-lg text-left ${
                        selectedMemberId === member.user_id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-sm truncate">
                          {member.user_id.slice(0, 8)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{arrow}</span>
                          <span className="font-mono">
                            {member.distance !== undefined ? formatDistance(member.distance) : '---'}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            
            <Button onClick={onLeaveFamily} variant="destructive" size="sm">
              Leave Family
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Full mode
  return (
    <div className="flex flex-col gap-4 p-6 bg-card rounded-xl border border-border">
      <h3 className="font-semibold text-lg">Family Finder</h3>
      <p className="text-sm text-muted-foreground">
        Share your family code with loved ones to track each other&apos;s location during emergencies.
      </p>
      
      {!familyId ? (
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Family Code</label>
            <Input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              className="text-center font-mono text-lg tracking-wider"
              maxLength={6}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleGenerate} variant="outline" className="flex-1 bg-transparent">
              Generate New Code
            </Button>
            <Button onClick={handleJoin} disabled={!inputId.trim()} className="flex-1">
              Join Family
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-secondary rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-1">Your Family Code</div>
            <div className="text-3xl font-mono font-bold tracking-wider">{familyId}</div>
            <div className={`text-xs mt-2 flex items-center justify-center gap-1 ${
              isConnected ? 'text-green-500' : 'text-muted-foreground'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-muted-foreground'}`} />
              {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Offline'}
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}
          
          <div>
            <div className="text-sm font-medium mb-2">
              Family Members ({familyMembers.length})
            </div>
            
            {familyMembers.length > 0 ? (
              <div className="flex flex-col gap-2">
                {familyMembers.map((member) => {
                  const relativeAngle = currentHeading !== null && member.bearing !== undefined
                    ? (member.bearing - currentHeading + 360) % 360
                    : member.bearing ?? 0
                  const arrow = getDirectionArrow(relativeAngle)
                  const direction = member.bearing !== undefined ? getCardinalDirection(member.bearing) : '---'
                  
                  return (
                    <button
                      key={member.user_id}
                      onClick={() => onSelectMember(member)}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        selectedMemberId === member.user_id
                          ? 'bg-primary/10 border-2 border-primary'
                          : 'bg-secondary hover:bg-accent border-2 border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-mono text-sm">
                            {member.user_id.slice(0, 8)}...
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last seen: {new Date(member.last_seen).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-3xl">{arrow}</span>
                            <span className="text-sm text-muted-foreground">{direction}</span>
                          </div>
                          <div className="font-bold">
                            {member.distance !== undefined ? formatDistance(member.distance) : '---'}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="p-4 bg-secondary rounded-lg text-center text-muted-foreground text-sm">
                No family members online yet. Share your code with your family.
              </div>
            )}
          </div>
          
          <Button onClick={onLeaveFamily} variant="outline" className="text-destructive hover:text-destructive bg-transparent">
            Leave Family Group
          </Button>
        </div>
      )}
    </div>
  )
}
