import { Link } from 'react-router-dom'
import TabSwitcher from '../components/TabSwitcher'
import SearchBar from '../components/SearchBar'
import SearchHistory from '../components/SearchHistory'
import SearchResults from '../components/SearchResults'
import ThemeInput from '../components/ThemeInput'
import ThemeHistory from '../components/ThemeHistory'
import SelectionArea from '../components/selection/SelectionArea'
import DataCredits from '../components/DataCredits'
import { useSearchPage } from '../hooks/useSearchPage'
import TagInput from '../components/TagInput'

function SearchPage() {
  const {
    activeTab,
    setActiveTab,
    currentQuery,
    debouncedQuery,
    theme,
    setTheme,
    tags,
    setTags,
    results,
    isLoading,
    error,
    loadMore,
    hasMore,
    selectionComplete,
    handleQueryChange,
    selectItem,
    handleBeforeCreate,
    handleCompleteChange,
  } = useSearchPage()

  return (
    <div
      className="min-h-screen bg-decorative-gradient"
      style={{
        backgroundColor: 'var(--color-bg)',
        paddingBottom: selectionComplete
          ? 'calc(72px + env(safe-area-inset-bottom))'
          : undefined,
      }}
    >
      {/* Compact Header */}
      <header className="px-3 pb-2 pt-4 sm:px-4 sm:pt-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1
              className="brand-gradient-text text-2xl font-extrabold tracking-tight sm:text-3xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              すきコレ
            </h1>
            <p
              className="mt-0.5 text-xs sm:text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              好きな作品を3つ選んで、シェアしよう
            </p>
          </div>
          <Link
            to="/gallery"
            className="flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 sm:text-sm"
            style={{
              color: 'var(--color-primary)',
              borderColor: 'var(--color-primary-a15)',
              backgroundColor: 'var(--color-surface)',
              boxShadow:
                '3px 3px 8px var(--color-primary-a8), -1px -1px 4px var(--color-white-a60)',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            みんなのボード
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-3 sm:px-4">
        {/* Theme Input - Compact pill */}
        <div className="mb-3">
          <ThemeInput value={theme} onChange={setTheme} />
          <ThemeHistory onSelect={setTheme} />
          <div className="mt-2">
            <TagInput tags={tags} onChange={setTags} />
          </div>
        </div>
      </div>

      {/* Sticky Tabs + Search Bar */}
      <div className="sticky-search-bar pb-1">
        <div className="mx-auto max-w-3xl px-3 sm:px-4">
          <div className="clay px-3 pb-3 pt-3 sm:px-4">
            <TabSwitcher value={activeTab} onChange={setActiveTab} />
            <SearchBar value={currentQuery} onChange={handleQueryChange} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-3 sm:px-4">
        {/* Search Results */}
        <div className="clay mb-3 mt-3 p-3 sm:p-4">
          {!currentQuery.trim() && (
            <SearchHistory category={activeTab} onSearch={handleQueryChange} />
          )}

          <SearchResults
            results={results}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onSelect={selectItem}
            query={debouncedQuery}
            error={error}
          />
        </div>
      </div>

      {/* Selection Area - Sticky bottom tray */}
      <div
        data-testid="selection-area-wrapper"
        className="sticky bottom-0 z-30 mx-auto max-w-3xl px-3 sm:px-4"
      >
        <div className="clay p-3 sm:p-4">
          <SelectionArea
            theme={theme}
            tags={tags}
            onBeforeCreate={handleBeforeCreate}
            onCompleteChange={handleCompleteChange}
            onSlotClick={setActiveTab}
          />
        </div>
      </div>

      <DataCredits />
    </div>
  )
}

export default SearchPage
