import { RefreshCw } from 'lucide-react'
import CameraGlyph from './CameraGlyph'

interface Props {
  loading: boolean
  cameraCount: number
  lastUpdated: Date | null
  onRefresh: () => void
}

export default function Header({ loading, cameraCount, lastUpdated, onRefresh }: Props) {
  return (
    <header className="relative z-[600] border-b border-slate-800 bg-slate-950/90 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30">
            <CameraGlyph size={19} />
          </div>
          <div>
            <h1 className="text-base font-extrabold leading-none tracking-tight text-white">
              JAX<span className="text-orange-400">CAM</span>
            </h1>
            <p className="mt-0.5 flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.14em] text-slate-500">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  loading ? 'animate-pulse bg-amber-400' : 'bg-emerald-500'
                }`}
              />
              FDOT live feeds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-right sm:block">
            <p className="font-mono text-[13px] font-bold leading-none text-slate-100">
              {cameraCount.toLocaleString()}
            </p>
            <p className="mt-0.5 text-[9px] uppercase tracking-wider text-slate-500">
              cameras
            </p>
          </div>
          {lastUpdated && (
            <p className="text-[9px] tabular-nums text-slate-500">
              {lastUpdated.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 transition active:scale-95 disabled:opacity-50"
            aria-label="Refresh camera data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </header>
  )
}