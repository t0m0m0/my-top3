import { useState, useEffect, useCallback, useRef } from 'react'
import type { MediaCategory, SearchResultItem } from '../types/common'
import { useDebounce } from '../hooks/useDebounce'
import { useSearch } from '../hooks/useSearch'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { useThemeHistory } from '../hooks/useThemeHistory'
import { useSelection } from '../hooks/useSelection'
import TabSwitcher from '../components/TabSwitcher'
import SearchBar from '../components/SearchBar'
import SearchHistory from '../components/SearchHistory'
import SearchResults from '../components/SearchResults'
import ThemeInput from '../components/ThemeInput'
import ThemeHistory from '../components/ThemeHistory'
import SelectionArea from '../components/SelectionArea'

type QueryState = Record<MediaCategory, string>

const INITIAL_QUERIES: QueryState = {
  book: '',
  music: '',
  movie: '',
}

function SearchPage() {
  const [activeTab, setActiveTab] = useState<MediaCategory>('book')
  const [queries, setQueries] = useState<QueryState>(INITIAL_QUERIES)
  const [theme, setTheme] = useState('')
  const { selectItem } = useSelection()
  const { addHistory: addThemeHistory } = useThemeHistory()

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

  const handleThemeHistorySelect = useCallback((selectedTheme: string) => {
    setTheme(selectedTheme)
  }, [])

  const handleBeforeCreate = useCallback(() => {
    addThemeHistory(theme)
  }, [theme, addThemeHistory])

  return (
    <div
      className="noise-overlay min-h-screen"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 70% 5%, rgba(13,148,136,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 20% 60%, rgba(245,158,11,0.06) 0%, transparent 50%),
          linear-gradient(180deg, var(--color-primary-dark) 0%, var(--color-bg) 32%, #ecfdf5 100%)
        `,
      }}
    >
      {/* Hero Section with decorative gradient orb */}
      <div className="relative px-3 pb-6 pt-8 text-center sm:px-4 sm:pb-8 sm:pt-12">
        {/* Decorative gradient orb */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: '360px',
            height: '260px',
            background:
              'radial-gradient(circle, rgba(20,184,166,0.18) 0%, rgba(13,148,136,0.05) 40%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <h1
          className="text-3xl font-extrabold tracking-tight sm:text-4xl"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#fff',
          }}
        >
          My Top 3
        </h1>
        <p
          className="mx-auto mt-2 max-w-md text-sm sm:mt-3 sm:text-base"
          style={{ color: 'rgba(255,255,255,0.8)' }}
        >
          テーマを決めて、お気に入りの3作品を選ぼう
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-3 sm:px-4">
        {/* Theme Input Section */}
        <div className="glass-card rounded-xl p-4 sm:p-5">
          <ThemeInput value={theme} onChange={setTheme} />
          <ThemeHistory onSelect={handleThemeHistorySelect} />
        </div>

        {/* Selection Area - Sticky */}
        <div
          className="sticky z-30 -mx-3 mt-5 px-3 pb-3 pt-2 sm:-mx-4 sm:px-4"
          style={{
            top: 0,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255,255,255,0.75)',
          }}
        >
          <SelectionArea theme={theme} onBeforeCreate={handleBeforeCreate} />
        </div>

        {/* Search Section Card */}
        <div className="glass-card mt-4 rounded-xl p-4 sm:p-5">
          <TabSwitcher value={activeTab} onChange={setActiveTab} />
          <SearchBar value={currentQuery} onChange={handleQueryChange} />

          {!currentQuery.trim() && (
            <SearchHistory
              category={activeTab}
              onSearch={handleHistorySearch}
            />
          )}

          <SearchResults
            results={results}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onSelect={handleSelect}
            query={debouncedQuery}
            error={error}
          />
        </div>

        {/* Bottom spacer */}
        <div className="h-8 sm:h-12" />
      </div>
    </div>
  )
}

export default SearchPage
