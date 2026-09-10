import { FDOT } from './config'
import type { Camera } from '../types/camera'
import { parseTimestamp } from '../utils/format'

interface ArcGisRow {
  attributes: {
    ID?: string
    DESCRIPT?: string
    COUNTY?: string
    HIGHWAY?: string
    DIRECTION?: string
    LATITUDE?: number
    LONGITUDE?: number
    TIMESTAMP?: string
    IMAGE?: string
  }
}

interface ArcGisQueryResult {
  exceededTransferLimit?: boolean
  features?: ArcGisRow[]
}

interface UnknownObject {
  [key: string]: unknown
}

const PAGE = FDOT.pageSize

function parseArcGisQueryResult(data: UnknownObject): ArcGisQueryResult {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Unexpected response from FDOT service')
  }
  return data as unknown as ArcGisQueryResult
}

function buildUrl(params: Record<string, string | number>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    search.set(key, String(value))
  }
  return `${FDOT.serviceUrl}?${search.toString()}`
}

function transformStone(row: ArcGisRow): Camera | null {
  const a = row?.attributes
  if (
    !a ||
    typeof a.ID !== 'string' ||
    !a.DESCRIPT ||
    typeof a.LATITUDE !== 'number' ||
    typeof a.LONGITUDE !== 'number'
  ) {
    return null
  }
  return {
    id: a.ID,
    description: a.DESCRIPT,
    county: a.COUNTY ?? 'Unknown',
    highway: a.HIGHWAY ?? '',
    direction: a.DIRECTION ?? '',
    latitude: a.LATITUDE,
    longitude: a.LONGITUDE,
    timestamp: a.TIMESTAMP ?? '',
    image: a.IMAGE ?? '',
  }
}

async function queryArcGis(params: Record<string, string | number>): Promise<ArcGisQueryResult> {
  let response: Response
  try {
    response = await fetch(buildUrl(params), { signal: AbortSignal.timeout(20_000) })
  } catch (error) {
    throw new Error(`Network error contacting FDOT service: ${String(error)}`)
  }
  if (!response.ok) {
    throw new Error(`FDOT service responded with HTTP ${response.status}`)
  }
  const payload: unknown = await response.json()
  return parseArcGisQueryResult(payload as Record<string, unknown>)
}

/**
 * Fetch the complete camera catalog from the FDOT feature service.
 * Paginates every page of the service so the whole state is available for
 * the map an the Jacksonville-area slice feeds the list view.
 */
export async function fetchAllCameras(): Promise<Camera[]> {
  const cameras: Camera[] = []
  let offset = 0
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const page = await queryArcGis({
      where: '1=1',
      outFields: '*',
      resultOffset: offset,
      resultRecordCount: PAGE,
      f: 'json',
    })
    const rows = page.features ?? []
    for (const row of rows) {
      const cam = transformStone(row)
      if (cam) cameras.push(cam)
    }
    if (rows.length < PAGE || !page.exceededTransferLimit || rows.length === 0) {
      break
    }
    offset += rows.length
  }
  return cameras
}

export interface CameraWithImage extends Camera {
  /** ISO timestamp for the currently cached/available image. */
  updatedAt: string
}

/**
 * Fetch a single live camera (still image + arrival timestamp) so an open
 * feed can revalidate cheaply by just that camera instead of the catalog.
 */
export async function fetchCameraStatus(id: string): Promise<CameraWithImage> {
  const page = await queryArcGis({
    where: `ID='${id}'`,
    outFields: 'TIMESTAMP,IMAGE,ID',
    f: 'json',
  })
  const row = page.features?.[0]
  if (!row?.attributes.ID) {
    throw new Error(`Camera ${id} not found in FDOT service`)
  }
  const updatedAt = parseTimestamp(row.attributes.TIMESTAMP ?? '').toISOString()
  return {
    id: row.attributes.ID as string,
    updatedAt,
    description: '',
    county: '',
    highway: '',
    direction: '',
    latitude: 0,
    longitude: 0,
    timestamp: row.attributes.TIMESTAMP ?? '',
    image: row.attributes.IMAGE ?? '',
  }
}

/** Cheap check that the FDOT service is reachable. */
export async function checkServiceHealth(): Promise<boolean> {
  try {
    await queryArcGis({ where: '1=1', returnCountOnly: 'true', f: 'json' })
    return true
  } catch {
    return false
  }
}