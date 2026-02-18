import { useEffect, useState, useCallback } from 'react'
import type { MediaCategory, SearchResultItem } from '../types/common'
import { CATEGORY_LABELS_JA, API_ENDPOINTS } from '../constants/category'
import { MESSAGES } from '../constants/messages'

type WorkState = {
  data: SearchResultItem | null
  loading: boolean
  error: string | null
}

async function fetchWork(
  category: MediaCategory,
  id: string,
): Promise<SearchResultItem> {
  const response = await fetch(`${API_ENDPOINTS[category]}/${id}`)
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(MESSAGES.NOT_FOUND(CATEGORY_LABELS_JA[category], id))
    }
    if (response.status === 429) {
      throw new Error(MESSAGES.RATE_LIMITED)
    }
    throw new Error(MESSAGES.FETCH_FAILED(CATEGORY_LABELS_JA[category]))
  }

  const result = await response.json()

  // API returns Result type: { ok: true, data: ... } or { ok: false, error: ... }
  if (!result.ok) {
    throw new Error(
      result.error?.message ??
        MESSAGES.FETCH_FAILED(CATEGORY_LABELS_JA[category]),
    )
  }

  return result.data
}

export function useWorkFetch(category: MediaCategory, id: string) {
  const [state, setState] = useState<WorkState>(() => ({
    data: null,
    loading: !!id,
    error: null,
  }))
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetchWork(category, id)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(
            `[Top3Page] Failed to fetch ${category} (id: ${id}):`,
            err,
          )
          setState({
            data: null,
            loading: false,
            error:
              err instanceof Error
                ? err.message
                : MESSAGES.FETCH_FAILED(CATEGORY_LABELS_JA[category]),
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [category, id, retryCount])

  const retry = useCallback(() => {
    setState({ data: null, loading: true, error: null })
    setRetryCount((c) => c + 1)
  }, [])

  return { ...state, retry }
}
