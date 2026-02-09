import { createContext } from 'react'
import type { SearchResultItem, MediaCategory } from '../types/common'

export type Selection = {
  book: SearchResultItem | null
  music: SearchResultItem | null
  movie: SearchResultItem | null
}

export type SelectionContextValue = {
  selection: Selection
  selectItem: (item: SearchResultItem) => void
  deselectItem: (category: MediaCategory) => void
  clearAll: () => void
  isComplete: boolean
}

export const SelectionContext = createContext<
  SelectionContextValue | undefined
>(undefined)
