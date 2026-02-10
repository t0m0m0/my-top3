import { useState, useEffect, useCallback } from 'react'
import type { MediaCategory } from '../types/common'

const MAX_HISTORY_ITEMS = 10
const STORAGE_KEY_PREFIX = 'search-history'

type SearchHistoryItem = {
  keyword: string
  timestamp: number
}

type UseSearchHistoryReturn = {
  history: string[]
  addHistory: (keyword: string) => void
  removeHistory: (keyword: string) => void
  clearHistory: () => void
}

function getStorageKey(category: MediaCategory): string {
  return `${STORAGE_KEY_PREFIX}-${category}`
}

function isHistoryItem(item: unknown): item is SearchHistoryItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as SearchHistoryItem).keyword === 'string' &&
    typeof (item as SearchHistoryItem).timestamp === 'number'
  )
}

function loadHistory(category: MediaCategory): SearchHistoryItem[] {
  try {
    const raw = localStorage.getItem(getStorageKey(category))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      console.warn(
        `[useSearchHistory] Invalid data format for "${getStorageKey(category)}". Resetting.`,
      )
      localStorage.removeItem(getStorageKey(category))
      return []
    }
    return parsed.filter(isHistoryItem)
  } catch (error) {
    console.warn(
      `[useSearchHistory] Failed to load history for "${category}":`,
      error,
    )
    return []
  }
}

function saveHistory(
  category: MediaCategory,
  items: SearchHistoryItem[],
): void {
  try {
    localStorage.setItem(getStorageKey(category), JSON.stringify(items))
  } catch (error) {
    console.warn(
      `[useSearchHistory] Failed to save history for "${category}":`,
      error,
    )
  }
}

function toKeywords(items: SearchHistoryItem[]): string[] {
  return [...items]
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((item) => item.keyword)
}

export function useSearchHistory(
  category: MediaCategory,
): UseSearchHistoryReturn {
  const [history, setHistory] = useState<string[]>(() =>
    toKeywords(loadHistory(category)),
  )

  useEffect(() => {
    setHistory(toKeywords(loadHistory(category)))
  }, [category])

  const addHistory = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim()
      if (!trimmed) return

      const items = loadHistory(category)
      const filtered = items.filter((item) => item.keyword !== trimmed)
      const newItems = [
        { keyword: trimmed, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_HISTORY_ITEMS)

      saveHistory(category, newItems)
      setHistory(toKeywords(newItems))
    },
    [category],
  )

  const removeHistory = useCallback(
    (keyword: string) => {
      const items = loadHistory(category)
      const filtered = items.filter((item) => item.keyword !== keyword)
      saveHistory(category, filtered)
      setHistory(toKeywords(filtered))
    },
    [category],
  )

  const clearHistory = useCallback(() => {
    saveHistory(category, [])
    setHistory([])
  }, [category])

  return { history, addHistory, removeHistory, clearHistory }
}
