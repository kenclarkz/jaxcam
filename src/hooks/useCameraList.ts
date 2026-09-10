import { useEffect, useMemo, useState } from 'react'
import type { Camera } from '../types/camera'
import { haversineMiles } from '../utils/format'

export interface CameraFilters {
  search: string
  highway: string
  favoritesOnly: boolean
  favorites: Set<string>
  nearMe: boolean
}

interface UseCameraListOptions extends CameraFilters {
  cameras: Camera[]
  userPosition: GeolocationPosition | null
}

export interface UseCameraListResult {
  filtered: Camera[]
  visible: Camera[]
  count: number
  tick: number
  loadMore: () => void
}

const DEFAULT_VISIBLE = 12
const STEP = 12
const NEAR_ME_RADIUS_MILES = 30

export function useCameraList({
  cameras,
  userPosition,
  search,
  highway,
  favoritesOnly,
  favorites,
  nearMe,
}: UseCameraListOptions): UseCameraListResult {
  const [limit, setLimit] = useState(DEFAULT_VISIBLE)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setLimit(DEFAULT_VISIBLE)
  }, [search, highway, favoritesOnly, nearMe, userPosition])

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 45_000)
    return () => window.clearInterval(id)
  }, [])

  const query = search.trim().toLowerCase()

  const spatial = useMemo(() => {
    if (nearMe && userPosition) {
      const lat = userPosition.coords.latitude
      const lon = userPosition.coords.longitude
      return cameras
        .map((cam) => ({
          cam,
          dist: haversineMiles(cam.latitude, cam.longitude, lat, lon),
        }))
        .filter((x) => x.dist <= NEAR_ME_RADIUS_MILES)
        .sort((a, b) => a.dist - b.dist)
        .map((x) => x.cam)
    }
    return cameras
  }, [cameras, nearMe, userPosition])

  const filtered = useMemo(
    () =>
      spatial.filter((cam) => {
        if (favoritesOnly && !favorites.has(cam.id)) return false
        if (highway && cam.highway && cam.highway !== highway) return false
        if (query) {
          const haystack =
            `${cam.description} ${cam.highway} ${cam.county} ${cam.direction}`.toLowerCase()
          if (!haystack.includes(query)) return false
        }
        return true
      }),
    [spatial, favoritesOnly, favorites, highway, query],
  )

  const visible = filtered.slice(0, limit)

  return {
    filtered,
    visible,
    count: filtered.length,
    tick,
    loadMore: () => setLimit((l) => l + STEP),
  }
}

export { NEAR_ME_RADIUS_MILES }