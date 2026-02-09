import { useState, useCallback, useMemo, type ReactNode } from 'react'
import type { SearchResultItem, MediaCategory } from '../types/common'
import { SelectionContext, type Selection } from './selection-context-value'

export { SelectionContext } from './selection-context-value'

const initialSelection: Selection = {
  book: null,
  music: null,
  movie: null,
}

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
