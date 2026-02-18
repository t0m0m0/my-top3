import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { MediaCategory, SearchResultItem } from '../types/common'
import { useDebounce } from './useDebounce'
import { useSearch } from './useSearch'
import { useSearchHistory } from './useSearchHistory'
import { useThemeHistory } from './useThemeHistory'
import { useTheme } from './useTheme'
import { useSelection } from './useSelection'
import { useRestoreSelection } from './useRestoreSelection'

type QueryState = Record<MediaCategory, string>

const INITIAL_QUERIES: QueryState = {
  book: '',
  music: '',
  movie: '',
}

export function useSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<MediaCategory>('book')
  const [queries, setQueries] = useState<QueryState>(INITIAL_QUERIES)
  const { theme, setTheme } = useTheme()
  const { selectItem } = useSelection()
  const { addHistory: addThemeHistory } = useThemeHistory()

  // Restore selection from edit URL params
  const isEdit = searchParams.get('edit') === '1'
  const editBookId = searchParams.get('book') ?? ''
  const editMusicId = searchParams.get('music') ?? ''
  const editMovieId = searchParams.get('movie') ?? ''
  const editTheme = searchParams.get('theme') ?? ''

  useRestoreSelection(
    isEdit ? editBookId : '',
    isEdit ? editMusicId : '',
    isEdit ? editMovieId : '',
  )

  // Restore theme and clear edit params from URL
  const editProcessedRef = useRef(false)
  useEffect(() => {
    if (isEdit && !editProcessedRef.current) {
      editProcessedRef.current = true
      if (editTheme) setTheme(editTheme)
      // Clean up edit params from URL
      setSearchParams(new URLSearchParams(), { replace: true })
    }
  }, [isEdit, editTheme, setTheme, setSearchParams])

  const currentQuery = queries[activeTab]
  const debouncedQuery = useDebounce(currentQuery, 300)

  const { results, isLoading, error, loadMore, hasMore } = useSearch(
    activeTab,
    debouncedQuery,
  )

  const { addHistory } = useSearchHistory(activeTab)
  const prevDebouncedQueryRef = useRef(debouncedQuery)

  useEffect(() => {
    if (
      debouncedQuery.trim() &&
      debouncedQuery !== prevDebouncedQueryRef.current
    ) {
      addHistory(debouncedQuery.trim())
    }
    prevDebouncedQueryRef.current = debouncedQuery
  }, [debouncedQuery, addHistory])

  const handleQueryChange = useCallback(
    (value: string) => {
      setQueries((prev) => ({ ...prev, [activeTab]: value }))
    },
    [activeTab],
  )

  const handleHistorySearch = useCallback(
    (keyword: string) => {
      setQueries((prev) => ({ ...prev, [activeTab]: keyword }))
    },
    [activeTab],
  )

  const handleSelect = useCallback(
    (item: SearchResultItem) => {
      selectItem(item)
    },
    [selectItem],
  )

  const handleThemeHistorySelect = useCallback(
    (selectedTheme: string) => {
      setTheme(selectedTheme)
    },
    [setTheme],
  )

  const [selectionComplete, setSelectionComplete] = useState(false)

  const handleBeforeCreate = useCallback(() => {
    addThemeHistory(theme)
  }, [theme, addThemeHistory])

  const handleCompleteChange = useCallback((complete: boolean) => {
    setSelectionComplete(complete)
  }, [])

  const mainStyle = useMemo(
    () => ({
      background:
        'linear-gradient(180deg, var(--color-primary-dark) 0%, var(--color-bg) 32%, #ecfdf5 100%)',
      paddingBottom: selectionComplete
        ? 'calc(72px + env(safe-area-inset-bottom))'
        : undefined,
    }),
    [selectionComplete],
  )

  return {
    activeTab,
    setActiveTab,
    currentQuery,
    debouncedQuery,
    theme,
    setTheme,
    results,
    isLoading,
    error,
    loadMore,
    hasMore,
    handleQueryChange,
    handleHistorySearch,
    handleSelect,
    handleThemeHistorySelect,
    handleBeforeCreate,
    handleCompleteChange,
    mainStyle,
  }
}
