export interface Camera {
  id: string
  description: string
  county: string
  highway: string
  direction: string
  latitude: number
  longitude: number
  timestamp: string
  image: string
}

export type ViewMode = 'map' | 'list' | 'favorites'