import type { MediaCategory } from '../types/common'
import { useLocalStorageHistory } from './useLocalStorageHistory'

const STORAGE_KEY_PREFIX = 'search-history'

type UseSearchHistoryReturn = {
  history: string[]
  addHistory: (keyword: string) => void
  removeHistory: (keyword: string) => void
  clearHistory: () => void
}

export function useSearchHistory(
  category: MediaCategory,
): UseSearchHistoryReturn {
  return useLocalStorageHistory(
    `${STORAGE_KEY_PREFIX}-${category}`,
    'keyword',
    'useSearchHistory',
    [category],
  )
}
