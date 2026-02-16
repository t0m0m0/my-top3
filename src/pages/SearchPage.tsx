import { useState, useEffect, useCallback, useRef } from 'react'
import type { MediaCategory, SearchResultItem } from '../types/common'
import { useDebounce } from '../hooks/useDebounce'
import { useSearch } from '../hooks/useSearch'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { useSelection } from '../hooks/useSelection'
import TabSwitcher from '../components/TabSwitcher'
import SearchBar from '../components/SearchBar'
import SearchHistory from '../components/SearchHistory'
import SearchResults from '../components/SearchResults'
import ThemeInput from '../components/ThemeInput'
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

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, var(--color-bg) 0%, #ecfdf5 100%)',
      }}
    >
      <div className="mx-auto max-w-3xl px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
        <h1
          className="text-xl font-extrabold sm:text-2xl"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-primary-dark)',
          }}
        >
          My Top 3
        </h1>
        <p
          className="mt-1 text-sm sm:mt-2 sm:text-base"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          テーマを決めて、お気に入りの3作品を選ぼう
        </p>

        {/* Theme Input Area */}
        <div className="mt-6">
          <ThemeInput value={theme} onChange={setTheme} />
        </div>

        {/* Selection Area */}
        <div className="mt-4">
          <SelectionArea theme={theme} />
        </div>

        {/* Tab Switcher */}
        <TabSwitcher value={activeTab} onChange={setActiveTab} />

        {/* Search Bar */}
        <SearchBar value={currentQuery} onChange={handleQueryChange} />

        {/* Search History (shown when search bar is empty) */}
        {!currentQuery.trim() && (
          <SearchHistory category={activeTab} onSearch={handleHistorySearch} />
        )}

        {/* Search Results */}
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
    </div>
  )
}

export default SearchPage
