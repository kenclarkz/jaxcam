import { useEffect, useState } from 'react'
import { fetchAllCameras } from '../api/fdot'
import type { Camera } from '../types/camera'

interface CameraState {
  cameras: Camera[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => void
}

export function useCameras(): CameraState {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const data = await fetchAllCameras()
        if (!cancelled) {
          setCameras(data)
          setLastUpdated(new Date())
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load FDOT cameras')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [revision])

  return {
    cameras,
    loading,
    error,
    lastUpdated,
    refresh: () => setRevision((r) => r + 1),
  }
}