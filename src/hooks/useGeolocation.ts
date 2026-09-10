import { useCallback, useState } from 'react'

export type LocStatus = 'idle' | 'locating' | 'ready' | 'denied' | 'error'

export interface LocState {
  status: LocStatus
  position: GeolocationPosition | null
  error: string | null
}

export function useGeolocation() {
  const [state, setState] = useState<LocState>({
    status: 'idle',
    position: null,
    error: null,
  })

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'error', position: null, error: 'Geolocation not supported' })
      return
    }
    setState((s) => ({ ...s, status: 'locating', error: null }))
    navigator.geolocation.getCurrentPosition(
      (position) => setState({ status: 'ready', position, error: null }),
      (err) =>
        setState({
          status: err.code === err.PERMISSION_DENIED ? 'denied' : 'error',
          position: null,
          error: err.message,
        }),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    )
  }, [])

  return { ...state, locate }
}