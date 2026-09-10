const FAVORITES_KEY = 'jaxcam:favorites'
const CACHE_KEY = 'jaxcam:image-cache'

const storage = {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      /* private mode / storage full — safe to ignore */
    }
  },
  remove(key: string) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}

export function loadFavorites(): Set<string> {
  try {
    const parsed: unknown = JSON.parse(storage.get(FAVORITES_KEY) ?? '[]')
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((x): x is string => typeof x === 'string'))
    }
  } catch {
    /* ignore malformed favorites */
  }
  return new Set()
}

export function saveFavorites(set: Set<string>) {
  storage.set(FAVORITES_KEY, JSON.stringify([...set]))
}

export function loadImageCache(): Record<string, string> {
  try {
    const parsed: unknown = JSON.parse(storage.get(CACHE_KEY) ?? '{}')
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, string>
    }
  } catch {
    /* ignore */
  }
  return {}
}

export function saveImageCache(cache: Record<string, string>) {
  storage.set(CACHE_KEY, JSON.stringify(cache))
}