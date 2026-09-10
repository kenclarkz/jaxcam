const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * FDOT timestamps look like "07/20/2026 8:09:58 PM" in America/New_York.
 * The browser cannot infer that zone reliably, so it is applied explicitly.
 */
export function parseTimestamp(raw: string): Date {
  const match =
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)$/i.exec(
      raw.trim(),
    )
  if (!match) return new Date(raw)
  const [, m, d, y, hh, mm, ss, ap] = match
  let hour = Number(hh) % 12
  if (ap.toUpperCase() === 'PM') hour += 12
  return new Date(
    Date.UTC(
      Number(y),
      Number(m) - 1,
      Number(d),
      hour,
      Number(mm),
      Number(ss ?? 0),
    ),
  )
}

export function formatTime(raw: string): string {
  const date = parseTimestamp(raw)
  if (Number.isNaN(date.getTime())) return raw
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date)
}

export function formatAge(raw: string, now = new Date()): string {
  const date = parseTimestamp(raw)
  if (Number.isNaN(date.getTime())) return 'unknown'
  const minutes = Math.max(0, Math.round((now.getTime() - date.getTime()) / 60_000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function isImageFresh(raw: string, staleMinutes = 12, now = new Date()): boolean {
  const date = parseTimestamp(raw)
  if (Number.isNaN(date.getTime())) return false
  return now.getTime() - date.getTime() < staleMinutes * 60_000
}

export function formatShortDate(raw: string): string {
  const date = parseTimestamp(raw)
  if (Number.isNaN(date.getTime())) return raw
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`
}

/** Approximate great-circle distance in miles between two coordinates. */
export function haversineMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const rad = (deg: number) => (deg * Math.PI) / 180
  const R = 3958.8
  const dLat = rad(lat2 - lat1)
  const dLon = rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function ageMinutes(raw: string, now = new Date()): number {
  const date = parseTimestamp(raw)
  if (Number.isNaN(date.getTime())) return Infinity
  return Math.max(0, Math.round((now.getTime() - date.getTime()) / 60_000))
}