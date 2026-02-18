import { useEffect, useRef } from 'react'
import type { MediaCategory } from '../types/common'
import { API_ENDPOINTS } from '../constants/category'
import { useSelection } from './useSelection'

async function fetchAndRestore(
  category: MediaCategory,
  id: string,
  selectItem: ReturnType<typeof useSelection>['selectItem'],
): Promise<void> {
  try {
    const response = await fetch(`${API_ENDPOINTS[category]}/${id}`)
    if (!response.ok) return
    const result = await response.json()
    if (result.ok && result.data) {
      selectItem(result.data)
    }
  } catch (e) {
    console.error(`[restore] Failed to fetch ${category} (id: ${id}):`, e)
  }
}

export function useRestoreSelection(
  bookId: string,
  musicId: string,
  movieId: string,
): void {
  const { selectItem } = useSelection()
  const restoredRef = useRef(false)

  useEffect(() => {
    if (restoredRef.current) return
    if (!bookId && !musicId && !movieId) return
    restoredRef.current = true

    const promises: Promise<void>[] = []
    if (bookId) promises.push(fetchAndRestore('book', bookId, selectItem))
    if (musicId) promises.push(fetchAndRestore('music', musicId, selectItem))
    if (movieId) promises.push(fetchAndRestore('movie', movieId, selectItem))

    Promise.allSettled(promises)
  }, [bookId, musicId, movieId, selectItem])
}
