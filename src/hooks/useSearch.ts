import { useState, useEffect, useCallback, useRef } from 'react'
import type { MediaCategory, SearchResultItem } from '../types/common'
import { MESSAGES } from '../constants/messages'
import { API_ENDPOINTS } from '../constants/category'

const MAX_RESULTS = 20

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
  const abortControllerRef = useRef<AbortController | null>(null)
  const isLoadingMoreRef = useRef(false)
  // Track startIndex via ref to avoid stale closures in loadMore
  const startIndexRef = useRef(0)
  // Track last requested index to prevent duplicate requests
  const lastRequestedIndexRef = useRef<number | null>(null)

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
        const params = new URLSearchParams({
          q: query.trim(),
          startIndex: String(index),
          maxResults: String(MAX_RESULTS),
        })

        const response = await fetch(
          `${API_ENDPOINTS[category]}/search?${params}`,
          {
            signal: controller.signal,
          },
        )

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error(MESSAGES.RATE_LIMITED)
          }
          let serverMessage: string | undefined
          try {
            const errorJson = (await response.json()) as {
              error?: { message?: string }
            }
            serverMessage = errorJson?.error?.message
          } catch {
            // Response body is not valid JSON – fall through
          }
          throw new Error(serverMessage || `HTTP ${response.status}`)
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
          // Use a ref-like container to extract uniqueCount from the state updater
          const countRef = { value: 0 }
          setResults((prev) => {
            const existingIds = new Set(prev.map((r) => r.id))
            const unique = items.filter((item) => !existingIds.has(item.id))
            countRef.value = unique.length
            if (import.meta.env.DEV && unique.length < items.length) {
              console.warn(
                `[useSearch] Dropped ${items.length - unique.length} duplicate item(s) during pagination.`,
              )
            }
            return [...prev, ...unique]
          })

          // React 18 batches state updates, but the updater function runs synchronously
          // within setResults, so countRef.value is available here.
          if (countRef.value === 0 && items.length > 0) {
            if (import.meta.env.DEV) {
              console.warn(
                `[useSearch] All ${items.length} item(s) were duplicates at index=${returnedIndex}. Stopping pagination.`,
              )
            }
            setHasMore(false)
            startIndexRef.current = returnedIndex + items.length
            return
          }
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
        startIndexRef.current = returnedIndex + items.length
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
    startIndexRef.current = 0
    lastRequestedIndexRef.current = null
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
    // Use ref to always get the latest startIndex (avoids stale closure)
    const currentIndex = startIndexRef.current
    // Guard against requesting the same index twice
    if (lastRequestedIndexRef.current === currentIndex) {
      return
    }
    lastRequestedIndexRef.current = currentIndex
    isLoadingMoreRef.current = true
    fetchResults(currentIndex, true)
  }, [fetchResults, isLoading, hasMore])

  return { results, isLoading, error, loadMore, hasMore }
}
