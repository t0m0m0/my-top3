import { useState, useCallback } from 'react'

const MAX_HISTORY_ITEMS = 10
const STORAGE_KEY = 'theme-history'

type ThemeHistoryItem = {
  theme: string
  timestamp: number
}

type UseThemeHistoryReturn = {
  history: string[]
  addHistory: (theme: string) => void
  removeHistory: (theme: string) => void
  clearHistory: () => void
}

function isHistoryItem(item: unknown): item is ThemeHistoryItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as ThemeHistoryItem).theme === 'string' &&
    typeof (item as ThemeHistoryItem).timestamp === 'number'
  )
}

function loadHistory(): ThemeHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      console.warn(
        `[useThemeHistory] Invalid data format for "${STORAGE_KEY}". Resetting.`,
      )
      localStorage.removeItem(STORAGE_KEY)
      return []
    }
    return parsed.filter(isHistoryItem)
  } catch (error) {
    console.warn('[useThemeHistory] Failed to load history:', error)
    return []
  }
}

function saveHistory(items: ThemeHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.warn('[useThemeHistory] Failed to save history:', error)
  }
}

function toThemes(items: ThemeHistoryItem[]): string[] {
  return [...items]
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((item) => item.theme)
}

export function useThemeHistory(): UseThemeHistoryReturn {
  const [history, setHistory] = useState<string[]>(() =>
    toThemes(loadHistory()),
  )

  const addHistory = useCallback((theme: string) => {
    const trimmed = theme.trim()
    if (!trimmed) return

    const items = loadHistory()
    const filtered = items.filter((item) => item.theme !== trimmed)
    const newItems = [
      { theme: trimmed, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_HISTORY_ITEMS)

    saveHistory(newItems)
    setHistory(toThemes(newItems))
  }, [])

  const removeHistory = useCallback((theme: string) => {
    const items = loadHistory()
    const filtered = items.filter((item) => item.theme !== theme)
    saveHistory(filtered)
    setHistory(toThemes(filtered))
  }, [])

  const clearHistory = useCallback(() => {
    saveHistory([])
    setHistory([])
  }, [])

  return { history, addHistory, removeHistory, clearHistory }
}
