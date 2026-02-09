import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import type { SearchResultItem, MediaCategory } from '../types/common'

type Selection = {
  book: SearchResultItem | null
  music: SearchResultItem | null
  movie: SearchResultItem | null
}

type SelectionContextValue = {
  selection: Selection
  selectItem: (item: SearchResultItem) => void
  deselectItem: (category: MediaCategory) => void
  clearAll: () => void
  isComplete: boolean
}

const initialSelection: Selection = {
  book: null,
  music: null,
  movie: null,
}

const SelectionContext = createContext<SelectionContextValue | undefined>(
  undefined,
)

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<Selection>(initialSelection)

  const selectItem = useCallback((item: SearchResultItem) => {
    setSelection((prev) => ({
      ...prev,
      [item.category]: item,
    }))
  }, [])

  const deselectItem = useCallback((category: MediaCategory) => {
    setSelection((prev) => ({
      ...prev,
      [category]: null,
    }))
  }, [])

  const clearAll = useCallback(() => {
    setSelection(initialSelection)
  }, [])

  const isComplete = useMemo(
    () =>
      selection.book !== null &&
      selection.music !== null &&
      selection.movie !== null,
    [selection.book, selection.music, selection.movie],
  )

  const value = useMemo(
    () => ({
      selection,
      selectItem,
      deselectItem,
      clearAll,
      isComplete,
    }),
    [selection, selectItem, deselectItem, clearAll, isComplete],
  )

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  )
}

export function useSelection(): SelectionContextValue {
  const context = useContext(SelectionContext)
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider')
  }
  return context
}
