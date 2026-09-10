import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Compass, WifiOff } from 'lucide-react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import BottomNav from './components/BottomNav'
import CameraList from './components/CameraList'
import CameraDetail from './components/CameraDetail'
import CameraMap from './components/CameraMap'
import { useCameras } from './hooks/useCameras'
import { useFavorites } from './hooks/useFavorites'
import { useGeolocation } from './hooks/useGeolocation'
import { useCameraList } from './hooks/useCameraList'
import { FDOT } from './api/config'
import type { Camera, ViewMode } from './types/camera'
import CameraGlyph from './components/CameraGlyph'

const ROAD_PRIORITY = ['I-95', 'I-295', 'I-10', 'US-1', 'US-17', 'US-90', 'SR-9A']

function App() {
  const { cameras, loading, error, lastUpdated, refresh } = useCameras()
  const { favorites, toggle } = useFavorites()
  const { status: locStatus, position: userPosition, locate } = useGeolocation()
  const [view, setView] = useState<ViewMode>('map')
  const [search, setSearch] = useState('')
  const [highway, setHighway] = useState('')
  const [nearMe, setNearMe] = useState(false)
  const [selected, setSelected] = useState<Camera | null>(null)
  const [detail, setDetail] = useState<Camera | null>(null)

  const jaxCams = useMemo(
    () =>
      cameras.filter((cam) =>
        FDOT.jaxAreaCounties.some(
          (c) => cam.county?.toLowerCase() === c.toLowerCase(),
        ),
      ),
    [cameras],
  )

  const highways = useMemo(() => {
    const set = new Set<string>()
    for (const cam of jaxCams) {
      const road = cam.highway?.trim()
      if (road) set.add(road)
    }
    const list = [...set]
    list.sort((a, b) => {
      const ap = ROAD_PRIORITY.indexOf(a)
      const bp = ROAD_PRIORITY.indexOf(b)
      if (ap === -1 && bp === -1) return a.localeCompare(b)
      if (ap === -1) return 1
      if (bp === -1) return -1
      return ap - bp
    })
    return list
  }, [jaxCams])

  const listState = useCameraList({
    cameras: jaxCams,
    userPosition,
    search,
    highway,
    favoritesOnly: view === 'favorites',
    favorites,
    nearMe,
  })

  const locateAndEnable = (initial: boolean) => {
    if (locStatus === 'ready' && userPosition) {
      setNearMe(initial)
      setView('list')
      return
    }
    setNearMe(true)
    locate()
    setView('list')
  }

  const handleNearMe = () => locateAndEnable(!nearMe)

  const clearFilters = () => {
    setSearch('')
    setHighway('')
    setShowNearMe(false)
  }

  const [showNearMe, setShowNearMe] = useState(false)

  useEffect(() => {
    setShowNearMe(nearMe && locStatus === 'ready' && Boolean(userPosition))
  }, [nearMe, locStatus, userPosition])

  const nearList = useMemo(
    () =>
      showNearMe && userPosition
        ? jaxCams
            .map((cam) => ({
              cam,
              dist: Math.hypot(
                cam.latitude - userPosition.coords.latitude,
                cam.longitude - userPosition.coords.longitude,
              ),
            }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 8)
            .map((x) => x.cam)
        : [],
    [showNearMe, userPosition, jaxCams],
  )

  const feedTick = listState.tick

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-slate-950 text-slate-100">
      <Header
        loading={loading}
        cameraCount={cameras.length}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />
      <FilterBar
        search={search}
        onSearch={(value) => {
          setSearch(value)
          setNearMe(false)
        }}
        highways={highways}
        highway={highway}
        onHighway={(value) => {
          setHighway(value)
          setNearMe(false)
        }}
        onLocateMe={handleNearMe}
        locating={locStatus === 'locating'}
        active={nearMe && locStatus === 'ready'}
      />

      <main className="relative flex-1 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/90">
            <div className="flex h-12 w-12 animate-bounce items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30">
              <CameraGlyph size={24} />
            </div>
            <p className="text-xs font-semibold text-slate-400">
              Connecting to FDOT cameras…
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/95 px-8 text-center">
            <WifiOff size={30} className="text-red-400" />
            <p className="text-sm font-semibold text-slate-200">
              Can't reach the FDOT camera service
            </p>
            <p className="max-w-xs text-xs text-slate-500">{error}</p>
            <button
              type="button"
              onClick={refresh}
              className="mt-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-orange-950 active:bg-orange-400"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="h-full w-full">
            {view === 'map' ? (
              <CameraMap
                cameras={cameras}
                userPosition={userPosition}
                favorites={favorites}
                selected={selected}
                onSelect={setSelected}
                onOpenDetail={setDetail}
                onToggleFavorite={(cam) => toggle(cam.id)}
                onLocateMe={() => locateAndEnable(!nearMe)}
                tick={feedTick}
              />
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between px-4 pb-1 pt-3">
                  <h2 className="text-sm font-bold text-slate-200">
                    {view === 'favorites' && favorites.size === 0
                      ? 'No favorites yet'
                      : `${listState.count} camera${listState.count === 1 ? '' : 's'}`}
                  </h2>
                  {(search || highway || showNearMe) && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="rounded-full border border-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-400 active:text-white"
                    >
                      Reset filters
                    </button>
                  )}
                </div>

                {showNearMe && nearList.length > 0 && (
                  <div className="border-b border-slate-800/70 pb-2 pt-1">
                    <p className="flex items-center gap-1 px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-sky-400">
                      <Compass size={11} /> Nearest cameras to you
                    </p>
                    <CameraList
                      cameras={nearList}
                      hiddenCount={0}
                      userPosition={userPosition}
                      favorites={favorites}
                      onToggleFavorite={toggle}
                      onSelect={setSelected}
                      onLoadMore={() => undefined}
                    />
                  </div>
                )}

                {view === 'favorites' && favorites.size === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
                    <CameraGlyph size={32} className="text-slate-700" />
                    <p className="text-sm text-slate-300">No saved cameras yet</p>
                    <p className="max-w-xs text-xs text-slate-500">
                      Tap the star on any camera or in the popups to save it here — they
                      stay even when you're offline.
                    </p>
                  </div>
                ) : listState.visible.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
                    <AlertTriangle size={28} className="text-amber-500/70" />
                    <p className="text-sm text-slate-300">No cameras match</p>
                    <p className="max-w-xs text-xs text-slate-500">
                      Try clearing the search or picking a different road.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pb-4">
                    <CameraList
                      cameras={listState.visible}
                      hiddenCount={listState.count - listState.visible.length}
                      userPosition={showNearMe ? userPosition : null}
                      favorites={favorites}
                      onToggleFavorite={toggle}
                      onSelect={setSelected}
                      onLoadMore={listState.loadMore}
                    />
                    {listState.visible.length < listState.count && (
                      <p className="py-3 text-center text-[10px] text-slate-600">
                        Loading more cameras…
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav
        mode={view}
        favoritesCount={favorites.size}
        onChange={setView}
      />

      {detail && (
        <CameraDetail
          camera={detail}
          isFavorite={favorites.has(detail.id)}
          onToggleFavorite={toggle}
          onClose={() => {
            setDetail(null)
            setSelected(null)
          }}
        />
      )}
    </div>
  )
}

export default App