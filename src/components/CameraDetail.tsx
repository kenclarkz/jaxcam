import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ExternalLink, RefreshCw, Star, WifiOff } from 'lucide-react'
import type { Camera } from '../types/camera'
import { fetchCameraStatus } from '../api/fdot'
import { FDOT } from '../api/config'
import { ageMinutes, formatAge, formatTime } from '../utils/format'
import CameraGlyph from './CameraGlyph'

interface Props {
  camera: Camera
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onClose: () => void
}

export default function CameraDetail({ camera, isFavorite, onToggleFavorite, onClose }: Props) {
  const [now, setNow] = useState(() => Date.now())
  const [bump, setBump] = useState(() => Date.now())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), FDOT.feedRefreshMs)
    return () => window.clearInterval(id)
  }, [])

  const refresh = useCallback(async () => {
    try {
      await fetchCameraStatus(camera.id)
      setBump(Date.now())
      setNow(Date.now())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Feed unavailable')
    }
  }, [camera.id])

  useEffect(() => {
    setNow(Date.now())
    const id = window.setInterval(() => {
      setNow(Date.now())
      refresh()
    }, FDOT.feedRefreshMs)
    return () => {
      window.clearInterval(id)
      void refresh
    }
  }, [refresh])

  const src = useMemo(() => {
    const url = new URL(camera.image)
    url.searchParams.set('t', String(bump))
    return url.toString()
  }, [camera.image, bump])

  const description =
    camera.description || `Camera ${camera.id}`
  const live = ageMinutes(camera.timestamp, new Date(now)) < 12

  return (
    <div className="fixed inset-0 z-[2000] flex flex-col bg-black/95 text-slate-100">
      <header className="flex items-center justify-between px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 text-slate-300 active:bg-slate-700"
          aria-label="Close camera"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0 flex-1 px-3 text-center">
          <h2 className="truncate text-sm font-bold">{description}</h2>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">
            FDOT · Florida 511
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(camera.id)}
          className={`flex h-10 w-10 items-center justify-center rounded-full active:bg-slate-700 ${
            isFavorite ? 'bg-amber-500/15 text-amber-400' : 'bg-slate-800/80 text-slate-400'
          }`}
          aria-label="Toggle favorite"
        >
          <Star size={19} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </header>

      <div className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col px-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <img
            key={src}
            src={src}
            alt={description}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setError('Could not load camera feed')}
          />
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
              <WifiOff size={28} />
              <p className="text-xs">{error}</p>
            </div>
          )}
          <span
            className={`absolute left-2 top-2 flex items-center gap-1.5 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur ${
              live ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${live ? 'animate-pulse bg-emerald-400' : 'bg-red-400'}`} />
            {live ? 'Live' : 'Offline'}
          </span>
          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-[10px] tabular-nums text-slate-300 backdrop-blur">
            {formatAge(camera.timestamp, new Date(now))} · {formatTime(camera.timestamp)}
          </span>
        </div>

        <div className="flex items-center gap-2 py-3">
          <button
            type="button"
            onClick={() => refresh()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-orange-950 active:bg-orange-400"
          >
            <RefreshCw size={15} /> Refresh now
          </button>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${camera.latitude},${camera.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-800 py-2.5 text-sm font-semibold text-slate-200 active:bg-slate-700"
          >
            <ExternalLink size={15} /> Directions
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2 pb-[max(1rem,env(safe-area-inset-bottom))] text-[11px]">
          <div className="rounded-lg bg-slate-900/80 p-2.5">
            <span className="text-slate-500">Highway</span>
            <p className="mt-0.5 font-semibold text-slate-200">
              {camera.highway || '—'}
            </p>
          </div>
          <div className="rounded-lg bg-slate-900/80 p-2.5">
            <span className="text-slate-500">Direction</span>
            <p className="mt-0.5 font-semibold text-slate-200">
              {camera.direction ? camera.direction.toUpperCase() : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-slate-900/80 p-2.5">
            <span className="text-slate-500">County</span>
            <p className="mt-0.5 font-semibold text-slate-200">{camera.county}</p>
          </div>
          <div className="rounded-lg bg-slate-900/80 p-2.5">
            <span className="text-slate-500">Camera ID</span>
            <p className="mt-0.5 font-mono font-semibold text-slate-200">{camera.id}</p>
          </div>
        </div>

        <p className="mb-4 pb-1 text-center text-[10px] text-slate-600">
          <CameraGlyph size={11} className="mr-1 inline" />
          Do not use cameras or their images to make driving decisions.
        </p>
      </div>
    </div>
  )
}