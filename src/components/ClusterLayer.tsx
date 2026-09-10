import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import type { Layer, LatLngBounds, Map as LeafMap, Marker as LeafMarker } from 'leaflet'
import { useMap } from 'react-leaflet'
import type { Camera } from '../types/camera'
import { ageMinutes } from '../utils/format'

function cameraIcon(cam: Camera, favorite: boolean, selected: boolean) {
  return L.divIcon({
    className: '',
    html: `<div class="jax-marker ${
      favorite ? 'jax-marker-fav' : ''
    } ${selected ? 'jax-marker-selected' : ''} ${
      ageMinutes(cam.timestamp) < 12 ? 'jax-live' : 'jax-dead'
    }">
      <div class="jax-marker-inner">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
      </div>
      <span class="jax-status"></span>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  })
}

function clusterIcon(count: number) {
  return L.divIcon({
    className: '',
    html: `<div class="jax-cluster"><span>${count}</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}


interface Cluster {
  id: string
  center: [number, number]
  cameras: Camera[]
}

function buildClusters(cameras: Camera[], map: LeafMap): Cluster[] {
  const zoom = map.getZoom()
  const bounds = map.getBounds()
  const cellSize = Math.max(34, 74 - zoom * 6)

  const cells = new Map<string, { cx: number; cy: number; list: Camera[] }>()
  for (const cam of cameras) {
    if (!bounds.contains([cam.latitude, cam.longitude])) continue
    const p = map.project([cam.latitude, cam.longitude], zoom)
    const key = `${Math.round(p.x / cellSize)}:${Math.round(p.y / cellSize)}`
    const cell = cells.get(key)
    if (cell) {
      cell.list.push(cam)
    } else {
      cells.set(key, { cx: p.x, cy: p.y, list: [cam] })
    }
  }

  const clusters: Cluster[] = []
  for (const cell of cells.values()) {
    const center = map.unproject([cell.cx, cell.cy], zoom)
    clusters.push({
      id: `${cell.cx}:${cell.cy}:${zoom}`,
      center: [center.lat, center.lng],
      cameras: cell.list,
    })
  }
  clusters.sort((a, b) => b.cameras.length - a.cameras.length)
  return clusters
}

interface Props {
  cameras: Camera[]
  favorites: Set<string>
  selected: Camera | null
  onSelect: (camera: Camera) => void
  onToggleFavorite: (camera: Camera) => void
  onClusterZoom?: (bounds: LatLngBounds) => void
  tick: number
}

export { cameraIcon }

/**
 * Grid-clustering camera layer. Recomputes clusters when the map pans or
 * zooms and renders Leaflet markers directly — no plugin dependency.
 */
export default function ClusterLayer({
  cameras,
  favorites,
  selected,
  onSelect,
  onToggleFavorite,
  onClusterZoom,
  tick,
}: Props) {
  const map = useMap()
  const [viewKey, setViewKey] = useState(0)

  useEffect(() => {
    const handler = () => setViewKey((k) => k + 1)
    map.on('zoomend moveend', handler)
    return () => {
      map.off('zoomend moveend', handler)
    }
  }, [map])

  const clusters = useMemo(
    () => buildClusters(cameras, map),
    [cameras, map, viewKey, tick],
  )

  useEffect(() => {
    const group = L.layerGroup()
    const nodes: Layer[] = []

    for (const cluster of clusters) {
      if (cluster.cameras.length === 1) {
        const cam = cluster.cameras[0]
        const marker: LeafMarker = L.marker(cluster.center, {
          icon: cameraIcon(cam, favorites.has(cam.id), selected?.id === cam.id),
          keyboard: false,
          autoPanOnFocus: false,
        })
        marker.on('click', () => onSelect(cam))
        nodes.push(marker)
      } else {
        const chat = L.marker(cluster.center, { icon: clusterIcon(cluster.cameras.length) })
        chat.bindPopup(
          `<div style="padding:6px 8px;font-size:11px;color:#94a3b8">${cluster.cameras.length} cameras in this area — tap to zoom in</div>`,
          { offset: [0, -12], closeButton: false, className: 'jax-popup' },
        )
        chat.on('click', () => {
          const bounds = L.latLngBounds(
            cluster.cameras.map((c) => L.latLng(c.latitude, c.longitude)),
          )
          if (onClusterZoom) onClusterZoom(bounds)
          else map.flyToBounds(bounds, { maxZoom: Math.max(map.getZoom() + 4, 15) })
        })
        nodes.push(chat)
      }
    }

    group.addLayer(L.layerGroup(nodes))
    map.addLayer(group)
    return () => {
      map.removeLayer(group)
    }
  }, [clusters, map, favorites, selected, onSelect, onToggleFavorite, onClusterZoom])

  return null
}