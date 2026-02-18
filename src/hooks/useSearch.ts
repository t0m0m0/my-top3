import { useState, useEffect, useCallback, useRef } from 'react'
import type { MediaCategory, SearchResultItem } from '../types/common'
import { MESSAGES } from '../constants/messages'

const MAX_RESULTS = 20

function categoryToPath(category: MediaCategory): string {
  switch (category) {
    case 'book':
      return 'books'
    case 'music':
      return 'music'
    case 'movie':
      return 'movies'
  }
}

type UseSearchReturn = {
  results: SearchResultItem[]
  isLoading: boolean
  error: string | null
  loadMore: () => void
  hasMore: boolean
}

export function useSearch(
  category: MediaCategory,
  query: string,
): UseSearchReturn {
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [startIndex, setStartIndex] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isLoadingMoreRef = useRef(false)

  const fetchResults = useCallback(
    async (index: number, append: boolean) => {
      if (!query.trim()) {
        setResults([])
        setHasMore(false)
        setError(null)
        return
      }

      if (abortControllerRef.current && !append) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      if (!append) {
        abortControllerRef.current = controller
      }

      setIsLoading(true)
      setError(null)

      try {
        const path = categoryToPath(category)
        const params = new URLSearchParams({
          q: query.trim(),
          startIndex: String(index),
          maxResults: String(MAX_RESULTS),
        })

        const response = await fetch(`/api/${path}/search?${params}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(MESSAGES.RATE_LIMITED)
          }
          throw new Error(`HTTP ${response.status}`)
        }

        const json = (await response.json()) as {
          ok: boolean
          data: {
            items: SearchResultItem[]
            totalItems: number
            startIndex: number
          }
        }

        if (!json.ok) {
          throw new Error('API returned an error')
        }

        const { items, totalItems, startIndex: returnedIndex } = json.data

        if (append) {
          setResults((prev) => {
            const existingIds = new Set(prev.map((r) => r.id))
            const unique = items.filter((item) => !existingIds.has(item.id))
            if (import.meta.env.DEV && unique.length < items.length) {
              console.warn(
                `[useSearch] Dropped ${items.length - unique.length} duplicate item(s) during pagination.`,
              )
            }
            return [...prev, ...unique]
          })
        } else {
          setResults(items)
        }

        const moreAvailable = returnedIndex + items.length < totalItems
        if (import.meta.env.DEV && items.length === 0 && moreAvailable) {
          console.warn(
            `[useSearch] API returned 0 items but totalItems=${totalItems} at index=${returnedIndex}. Stopping pagination.`,
          )
        }
        setHasMore(items.length > 0 && moreAvailable)
        setStartIndex(returnedIndex + items.length)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred',
        )
      } finally {
        setIsLoading(false)
        isLoadingMoreRef.current = false
      }
    },
    [category, query],
  )

  useEffect(() => {
    setStartIndex(0)
    setResults([])
    setHasMore(false)
    fetchResults(0, false)

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchResults])

  const loadMore = useCallback(() => {
    if (isLoadingMoreRef.current || isLoading || !hasMore) {
      return
    }
    isLoadingMoreRef.current = true
    fetchResults(startIndex, true)
  }, [fetchResults, startIndex, isLoading, hasMore])

  return { results, isLoading, error, loadMore, hasMore }
}
