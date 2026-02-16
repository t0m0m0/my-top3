import { useState, useEffect, useCallback } from 'react'

const MAX_HISTORY_ITEMS = 10

type HistoryItem<K extends string> = Record<K, string> & { timestamp: number }

type UseLocalStorageHistoryReturn = {
  history: string[]
  addHistory: (value: string) => void
  removeHistory: (value: string) => void
  clearHistory: () => void
}

function isHistoryItem<K extends string>(
  item: unknown,
  fieldName: K,
): item is HistoryItem<K> {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as Record<string, unknown>)[fieldName] === 'string' &&
    typeof (item as Record<string, unknown>)['timestamp'] === 'number'
  )
}

function loadHistory<K extends string>(
  storageKey: string,
  fieldName: K,
  hookName: string,
): HistoryItem<K>[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      console.warn(
        `[${hookName}] Invalid data format for "${storageKey}". Resetting.`,
      )
      localStorage.removeItem(storageKey)
      return []
    }
    return parsed.filter((item): item is HistoryItem<K> =>
      isHistoryItem(item, fieldName),
    )
  } catch (error) {
    console.warn(`[${hookName}] Failed to load history:`, error)
    return []
  }
}

function saveHistory<K extends string>(
  storageKey: string,
  items: HistoryItem<K>[],
  hookName: string,
): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(items))
  } catch (error) {
    console.warn(`[${hookName}] Failed to save history:`, error)
  }
}

function toValues<K extends string>(
  items: HistoryItem<K>[],
  fieldName: K,
): string[] {
  return [...items]
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((item) => item[fieldName])
}

export function useLocalStorageHistory<K extends string>(
  storageKey: string,
  fieldName: K,
  hookName: string,
  deps: unknown[] = [],
): UseLocalStorageHistoryReturn {
  const [history, setHistory] = useState<string[]>(() =>
    toValues(loadHistory(storageKey, fieldName, hookName), fieldName),
  )

  useEffect(() => {
    setHistory(
      toValues(loadHistory(storageKey, fieldName, hookName), fieldName),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, fieldName, hookName, ...deps])

  const addHistory = useCallback(
    (value: string) => {
      const trimmed = value.trim()
      if (!trimmed) return

      const items = loadHistory(storageKey, fieldName, hookName)
      const filtered = items.filter((item) => item[fieldName] !== trimmed)
      const newItem = {
        [fieldName]: trimmed,
        timestamp: Date.now(),
      } as HistoryItem<K>
      const newItems = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)

      saveHistory(storageKey, newItems, hookName)
      setHistory(toValues(newItems, fieldName))
    },
    [storageKey, fieldName, hookName],
  )

  const removeHistory = useCallback(
    (value: string) => {
      const items = loadHistory(storageKey, fieldName, hookName)
      const filtered = items.filter((item) => item[fieldName] !== value)
      saveHistory(storageKey, filtered, hookName)
      setHistory(toValues(filtered, fieldName))
    },
    [storageKey, fieldName, hookName],
  )

  const clearHistory = useCallback(() => {
    saveHistory(storageKey, [], hookName)
    setHistory([])
  }, [storageKey, hookName])

  return { history, addHistory, removeHistory, clearHistory }
}
