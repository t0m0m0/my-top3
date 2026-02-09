import { useState, useEffect, useCallback, useRef } from 'react'
import type { MediaCategory, SearchResultItem } from '../types/common.ts'

const CATEGORY_PATH: Record<MediaCategory, string> = {
  book: 'books',
  music: 'music',
  movie: 'movies',
}

const PAGE_SIZE = 20

type SearchState = {
  results: SearchResultItem[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  totalItems: number
}

export function useSearch(category: MediaCategory, query: string) {
  const [state, setState] = useState<SearchState>({
    results: [],
    isLoading: false,
    error: null,
    hasMore: false,
    totalItems: 0,
  })

  const abortControllerRef = useRef<AbortController | null>(null)
  const startIndexRef = useRef(0)

  useEffect(() => {
    abortControllerRef.current?.abort()
    startIndexRef.current = 0

    if (query.trim() === '') {
      setState({
        results: [],
        isLoading: false,
        error: null,
        hasMore: false,
        totalItems: 0,
      })
      return
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setState((prev) => ({ ...prev, isLoading: true, error: null, results: [] }))

    fetchResults(category, query, 0, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setState({
          results: data.items,
          isLoading: false,
          error: null,
          hasMore: data.startIndex + data.items.length < data.totalItems,
          totalItems: data.totalItems,
        })
        startIndexRef.current = data.items.length
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'エラーが発生しました',
        }))
      })

    return () => controller.abort()
  }, [category, query])

  const loadMore = useCallback(() => {
    if (state.isLoading || !state.hasMore) return

    const controller = new AbortController()
    abortControllerRef.current = controller

    setState((prev) => ({ ...prev, isLoading: true }))

    fetchResults(category, query, startIndexRef.current, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setState((prev) => {
          const newResults = [...prev.results, ...data.items]
          return {
            ...prev,
            results: newResults,
            isLoading: false,
            hasMore:
              startIndexRef.current + data.items.length < data.totalItems,
            totalItems: data.totalItems,
          }
        })
        startIndexRef.current += data.items.length
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'エラーが発生しました',
        }))
      })
  }, [category, query, state.isLoading, state.hasMore])

  return {
    results: state.results,
    isLoading: state.isLoading,
    error: state.error,
    hasMore: state.hasMore,
    loadMore,
  }
}

type FetchResult = {
  items: SearchResultItem[]
  totalItems: number
  startIndex: number
}

async function fetchResults(
  category: MediaCategory,
  query: string,
  startIndex: number,
  signal: AbortSignal,
): Promise<FetchResult> {
  const path = CATEGORY_PATH[category]
  const params = new URLSearchParams({
    q: query,
    startIndex: String(startIndex),
    maxResults: String(PAGE_SIZE),
  })

  const response = await fetch(`/api/${path}/search?${params.toString()}`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const json = (await response.json()) as {
    ok: boolean
    data?: { items: SearchResultItem[]; totalItems: number; startIndex: number }
    error?: { message: string }
  }

  if (!json.ok || !json.data) {
    throw new Error(json.error?.message ?? 'Unknown error')
  }

  return json.data
}
