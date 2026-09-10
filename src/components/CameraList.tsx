import { useEffect, useRef } from 'react'
import { Navigation, Star } from 'lucide-react'
import type { Camera } from '../types/camera'
import { ageMinutes, formatAge, formatTime, haversineMiles } from '../utils/format'
import CameraThumbnail from './CameraThumbnail'

interface Props {
  cameras: Camera[]
  hiddenCount: number
  userPosition: GeolocationPosition | null
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
  onSelect: (camera: Camera) => void
  onLoadMore: () => void
}

export default function CameraList({
  cameras,
  hiddenCount,
  userPosition,
  favorites,
  onToggleFavorite,
  onSelect,
  onLoadMore,
}: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadMore = onLoadMore

  useEffect(() => {
    const node = sentinelRef.current
    if (!node || hiddenCount === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore()
      },
      { rootMargin: '400px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hiddenCount, loadMore])

  return (
    <div className="flex flex-col">
      {cameras.map((cam) => {
        const fav = favorites.has(cam.id)
        const age = ageMinutes(cam.timestamp)
        const live = age < 12
        const dist =
          userPosition != null
            ? haversineMiles(
                cam.latitude,
                cam.longitude,
                userPosition.coords.latitude,
                userPosition.coords.longitude,
              )
            : null
        return (
          <button
            key={cam.id}
            type="button"
            onClick={() => onSelect(cam)}
            className="flex w-full items-stretch gap-3 border-b border-slate-800/70 bg-slate-900/40 px-3 py-2.5 text-left transition active:bg-slate-800/60"
          >
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-slate-700/60">
              <CameraThumbnail alt={cam.description} src={cam.image} />
              <span
                className={`absolute right-1 top-1 rounded px-1 py-px text-[9px] font-bold uppercase tracking-wider ${
                  live ? 'bg-emerald-500 text-emerald-950' : 'bg-red-500 text-red-950'
                }`}
              >
                {live ? 'Live' : 'Stale'}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
              <p className="truncate text-[13px] font-semibold text-slate-100">
                {cam.description}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {cam.highway}
                {cam.direction ? ` · ${cam.direction.toUpperCase()}` : ''}
                {cam.county ? ` · ${cam.county}` : ''}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    live ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                />
                {formatAge(cam.timestamp)}
                {dist != null && (
                  <span className="inline-flex items-center gap-0.5">
                    <Navigation size={9} /> {dist.toFixed(1)} mi
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5 pr-1">
              <span
                role="button"
                tabIndex={-1}
                aria-label={fav ? 'Remove favorite' : 'Add favorite'}
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleFavorite(cam.id)
                }}
                className={`-mr-1 -mt-1 p-1 transition ${
                  fav ? 'text-amber-400' : 'text-slate-600 active:text-amber-400'
                }`}
              >
                <Star size={15} fill={fav ? 'currentColor' : 'none'} />
              </span>
              <span className="text-[9px] tabular-nums text-slate-600">
                {formatTime(cam.timestamp)}
              </span>
            </div>
          </button>
        )
      })}

      <div ref={sentinelRef} className="h-2" />
    </div>
  )
}