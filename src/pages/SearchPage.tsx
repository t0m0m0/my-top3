import { useState, useCallback } from 'react'
import type { MediaCategory, SearchResultItem } from '../types/common'
import { useDebounce } from '../hooks/useDebounce'
import { useSearch } from '../hooks/useSearch'
import TabSwitcher from '../components/TabSwitcher'
import SearchBar from '../components/SearchBar'
import SearchResults from '../components/SearchResults'

type QueryState = Record<MediaCategory, string>

const INITIAL_QUERIES: QueryState = {
  book: '',
  music: '',
  movie: '',
}

function SearchPage() {
  const [activeTab, setActiveTab] = useState<MediaCategory>('book')
  const [queries, setQueries] = useState<QueryState>(INITIAL_QUERIES)

  const currentQuery = queries[activeTab]
  const debouncedQuery = useDebounce(currentQuery, 300)

  const { results, isLoading, error, loadMore, hasMore } = useSearch(
    activeTab,
    debouncedQuery,
  )

  const handleQueryChange = useCallback(
    (value: string) => {
      setQueries((prev) => ({ ...prev, [activeTab]: value }))
    },
    [activeTab],
  )

  const handleSelect = useCallback((item: SearchResultItem) => {
    console.log('Selected item:', item)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">My Top 3</h1>
        <p className="mt-2 text-gray-600">
          テーマを決めて、お気に入りの3作品を選ぼう
        </p>

        {/* Theme Input Area - placeholder for another agent */}
        <div className="mt-6">{/* ThemeInput will go here */}</div>

        {/* Selection Area - placeholder for another agent */}
        <div className="mt-4">{/* SelectionArea will go here */}</div>

        {/* Tab Switcher */}
        <TabSwitcher value={activeTab} onChange={setActiveTab} />

        {/* Search Bar */}
        <SearchBar value={currentQuery} onChange={handleQueryChange} />

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
