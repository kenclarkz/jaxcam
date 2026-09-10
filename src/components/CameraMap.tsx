import { useEffect } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import ClusterLayer from './ClusterLayer'
import { Crosshair } from 'lucide-react'
import type { Camera } from '../types/camera'
import { ageMinutes, formatAge } from '../utils/format'

const JACKSONVILLE: [number, number] = [30.3322, -81.6557]

interface Props {
  cameras: Camera[]
  userPosition: GeolocationPosition | null
  favorites: Set<string>
  selected: Camera | null
  onSelect: (camera: Camera) => void
  onOpenDetail: (camera: Camera) => void
  onToggleFavorite: (camera: Camera) => void
  onLocateMe: () => void
  tick: number
}

function SelectedPopup({
  camera,
  favorite,
  onOpen,
  onFav,
}: {
  camera: Camera
  favorite: boolean
  onOpen: (camera: Camera) => void
  onFav: (camera: Camera) => void
}) {
  const live = ageMinutes(camera.timestamp) < 12
  return (
    <div className="flex w-[232px] flex-col gap-1.5 p-2">
      <img
        src={camera.image}
        alt={camera.description}
        className="h-20 w-full rounded-md bg-slate-800 object-cover"
        loading="lazy"
      />
      <p className="text-[11px] font-semibold leading-snug">{camera.description}</p>
      <p className="text-[10px] text-slate-400">
        {live ? 'Live: online' : 'Live: offline'} · updated {formatAge(camera.timestamp)}
      </p>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onOpen(camera)}
          className="flex-1 rounded-md bg-orange-500 py-1.5 text-[11px] font-semibold text-orange-950 active:bg-orange-400"
        >
          Open live view
        </button>
        <button
          type="button"
          onClick={() => onFav(camera)}
          className="rounded-md bg-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 active:bg-slate-600"
        >
          {favorite ? '★ Saved' : '☆ Save'}
        </button>
      </div>
    </div>
  )
}

function MapController({ selected }: { selected: Camera | null }) {
  const map = useMap()
  useEffect(() => {
    if (!selected) return
    map.setView([selected.latitude + 0.02, selected.longitude], Math.max(map.getZoom(), 13), {
      animate: false,
    })
  }, [selected, map])
  return null
}

function MeIndicator({ position }: { position: GeolocationPosition }) {
  const map = useMap()
  useEffect(() => {
    map.setView([position.coords.latitude, position.coords.longitude], 13)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <CircleMarker
      center={[position.coords.latitude, position.coords.longitude]}
      radius={12}
      pathOptions={{ color: '#0ea5e9', weight: 2, fillColor: '#0ea5e9', fillOpacity: 0.25 }}
    >
      <Popup>
        <span className="text-[11px] text-slate-200">You are here</span>
      </Popup>
    </CircleMarker>
  )
}

export default function CameraMap({
  cameras,
  userPosition,
  favorites,
  selected,
  onSelect,
  onOpenDetail,
  onToggleFavorite,
  onLocateMe,
  tick,
}: Props) {
  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={JACKSONVILLE}
        zoom={11}
        minZoom={5}
        maxZoom={18}
        zoomControl
        attributionControl
        className="absolute inset-0 h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />
        <MapController selected={selected} />
        {userPosition && <MeIndicator position={userPosition} />}
        <ClusterLayer
          cameras={cameras}
          favorites={favorites}
          selected={selected}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
          tick={tick}
        />
        {selected && (
          <Popup
            key={selected.id}
            position={[selected.latitude, selected.longitude]}
            offset={[0, -8]}
            closeButton
            autoPan={false}
            className="jax-popup"
          >
            <SelectedPopup
              camera={selected}
              favorite={favorites.has(selected.id)}
              onOpen={onOpenDetail}
              onFav={onToggleFavorite}
            />
          </Popup>
        )}
      </MapContainer>

      <button
        type="button"
        onClick={onLocateMe}
        className="absolute bottom-24 right-3 z-[500] flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 text-sky-400 shadow-lg backdrop-blur active:bg-slate-800"
        aria-label="Cameras near me"
      >
        <Crosshair size={18} />
      </button>

      <div className="pointer-events-none absolute left-1/2 top-16 z-[500] -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900/80 px-3 py-1 text-[10px] font-semibold text-slate-300 backdrop-blur">
        <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        {cameras.length} cameras in view · live FDOT
      </div>
    </div>
  )
}