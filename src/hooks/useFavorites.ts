import { useCallback, useEffect, useState } from 'react'
import { loadFavorites, saveFavorites } from '../utils/storage'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites())

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites],
  )

  return { favorites, toggle, isFavorite }
}