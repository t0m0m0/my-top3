import { useState, useEffect, useCallback } from 'react'

export type GalleryItem = {
  id: string
  theme: string
  bookId: string
  musicId: string
  movieId: string
  bookThumb: string
  musicThumb: string
  movieThumb: string
  createdAt: number
}

type GalleryState = {
  items: GalleryItem[]
  total: number
  loading: boolean
  loadingMore: boolean
  error: string | null
  hasMore: boolean
}

const PAGE_SIZE = 20

export function useGallery() {
  const [state, setState] = useState<GalleryState>({
    items: [],
    total: 0,
    loading: true,
    loadingMore: false,
    error: null,
    hasMore: false,
  })

  useEffect(() => {
    let cancelled = false

    fetch(`/api/shares?limit=${PAGE_SIZE}&offset=0`)
      .then(async (res) => {
        if (!res.ok) throw new Error('ギャラリーの読み込みに失敗しました')
        const json = await res.json()
        if (!json.ok) throw new Error('ギャラリーの読み込みに失敗しました')
        if (!cancelled) {
          const { items, total } = json.data as {
            items: GalleryItem[]
            total: number
          }
          setState({
            items,
            total,
            loading: false,
            loadingMore: false,
            error: null,
            hasMore: items.length < total,
          })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error:
              err instanceof Error
                ? err.message
                : 'ギャラリーの読み込みに失敗しました',
          }))
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const loadMore = useCallback(() => {
    setState((prev) => {
      if (prev.loadingMore || !prev.hasMore) return prev
      return { ...prev, loadingMore: true }
    })

    setState((prev) => {
      const offset = prev.items.length
      fetch(`/api/shares?limit=${PAGE_SIZE}&offset=${offset}`)
        .then(async (res) => {
          if (!res.ok) throw new Error('読み込みに失敗しました')
          const json = await res.json()
          if (!json.ok) throw new Error('読み込みに失敗しました')
          const { items: newItems, total } = json.data as {
            items: GalleryItem[]
            total: number
          }
          setState((s) => {
            const allItems = [...s.items, ...newItems]
            return {
              ...s,
              items: allItems,
              total,
              loadingMore: false,
              hasMore: allItems.length < total,
            }
          })
        })
        .catch(() => {
          setState((s) => ({ ...s, loadingMore: false }))
        })
      return prev
    })
  }, [])

  return { ...state, loadMore }
}
