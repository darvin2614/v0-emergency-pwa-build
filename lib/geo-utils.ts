// Geographic utilities using spherical trigonometry

const EARTH_RADIUS_METERS = 6371000

// Convert degrees to radians
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Convert radians to degrees
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return EARTH_RADIUS_METERS * c
}

// Calculate bearing from point 1 to point 2
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = toRadians(lon2 - lon1)
  const lat1Rad = toRadians(lat1)
  const lat2Rad = toRadians(lat2)
  
  const x = Math.sin(dLon) * Math.cos(lat2Rad)
  const y =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon)
  
  let bearing = toDegrees(Math.atan2(x, y))
  
  // Normalize to 0-360
  return (bearing + 360) % 360
}

// Calculate compass rotation (bearing relative to current heading)
export function calculateCompassRotation(
  bearing: number,
  currentHeading: number
): number {
  let rotation = bearing - currentHeading
  
  // Normalize to -180 to 180 for smooth rotation
  while (rotation > 180) rotation -= 360
  while (rotation < -180) rotation += 360
  
  return rotation
}

// Get cardinal direction from bearing
export function getCardinalDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(bearing / 45) % 8
  return directions[index]
}

// Get ASCII arrow from bearing
export function getDirectionArrow(bearing: number): string {
  const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖']
  const index = Math.round(bearing / 45) % 8
  return arrows[index]
}

// Format distance for display
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

// Interpolate between two angles (for smooth compass rotation)
export function interpolateAngle(
  current: number,
  target: number,
  factor: number
): number {
  let diff = target - current
  
  // Handle wraparound
  while (diff > 180) diff -= 360
  while (diff < -180) diff += 360
  
  return current + diff * factor
}
