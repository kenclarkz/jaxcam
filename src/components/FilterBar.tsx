import { Navigation, Search, X } from 'lucide-react'

interface Props {
  search: string
  onSearch: (value: string) => void
  highways: string[]
  highway: string
  onHighway: (value: string) => void
  onLocateMe: () => void
  locating: boolean
  active: boolean
}

export default function FilterBar({
  search,
  onSearch,
  highways,
  highway,
  onHighway,
  onLocateMe,
  locating,
  active,
}: Props) {
  return (
    <div className="relative z-[550] space-y-2 border-b border-slate-800 bg-slate-950/90 px-3 pb-2 backdrop-blur">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          inputMode="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search road, area, camera…"
          className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2 pl-9 pr-9 text-sm text-slate-100 placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 active:text-slate-300"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="jax-no-scrollbar flex flex-1 gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => onHighway('')}
            className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
              highway === ''
                ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                : 'border-slate-800 bg-slate-900/70 text-slate-400 active:text-slate-200'
            }`}
          >
            All roads
          </button>
          {highways.map((road) => (
            <button
              key={road}
              type="button"
              onClick={() => onHighway(highway === road ? '' : road)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                highway === road
                  ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                  : 'border-slate-800 bg-slate-900/70 text-slate-400 active:text-slate-200'
              }`}
            >
              {road}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onLocateMe}
          disabled={locating}
          className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold transition ${
            active
              ? 'border-sky-500/60 bg-sky-500/15 text-sky-400'
              : 'border-slate-800 bg-slate-900/70 text-slate-400 active:text-slate-200'
          } disabled:opacity-50`}
        >
          <Navigation size={13} className={locating ? 'animate-pulse' : ''} />
          {active ? 'Near me · on' : 'Near me'}
        </button>
      </div>
    </div>
  )
}