import { List, Map as MapIcon, Star } from 'lucide-react'
import type { ViewMode } from '../types/camera'

interface Props {
  mode: ViewMode
  favoritesCount: number
  onChange: (mode: ViewMode) => void
}

const TABS: Array<{ id: ViewMode; label: string; icon: typeof MapIcon }> = [
  { id: 'map', label: 'Map', icon: MapIcon },
  { id: 'list', label: 'List', icon: List },
  { id: 'favorites', label: 'Favorites', icon: Star },
]

export default function BottomNav({ mode, favoritesCount, onChange }: Props) {
  return (
    <nav
      className="relative z-[600] flex border-t border-slate-800 bg-slate-950/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = mode === id
        const disabled = id === 'favorites' && favoritesCount === 0
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(id)}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold uppercase tracking-wider transition ${
              active ? 'text-orange-400' : 'text-slate-500 active:text-slate-300'
            } ${disabled ? 'opacity-40' : ''}`}
          >
            {active && (
              <span className="absolute inset-x-6 top-0 h-0.5 rounded-b-full bg-orange-500" />
            )}
            <Icon size={19} strokeWidth={active ? 2.4 : 2} />
            {label}
            {id === 'favorites' && favoritesCount > 0 && (
              <span className="absolute right-[22%] top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-orange-950">
                {favoritesCount}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}