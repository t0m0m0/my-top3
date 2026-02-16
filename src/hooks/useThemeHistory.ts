import { useLocalStorageHistory } from './useLocalStorageHistory'

const STORAGE_KEY = 'theme-history'

type UseThemeHistoryReturn = {
  history: string[]
  addHistory: (theme: string) => void
  removeHistory: (theme: string) => void
  clearHistory: () => void
}

export function useThemeHistory(): UseThemeHistoryReturn {
  return useLocalStorageHistory(STORAGE_KEY, 'theme', 'useThemeHistory')
}
