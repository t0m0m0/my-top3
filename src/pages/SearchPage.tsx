import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import StepGuide from '../components/StepGuide'
import TabSwitcher from '../components/TabSwitcher'
import SearchBar from '../components/SearchBar'
import SearchHistory from '../components/SearchHistory'
import SearchResults from '../components/SearchResults'
import ThemeInput from '../components/ThemeInput'
import ThemeHistory from '../components/ThemeHistory'
import SelectionArea from '../components/selection/SelectionArea'
import DataCredits from '../components/DataCredits'
import { useSearchPage } from '../hooks/useSearchPage'

function SearchPage() {
  const {
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
    selectionComplete,
    handleQueryChange,
    selectItem,
    handleBeforeCreate,
    handleCompleteChange,
  } = useSearchPage()

  const mainStyle = useMemo(
    () => ({
      background:
        'linear-gradient(180deg, #7e22ce 0%, #a855f7 12%, var(--color-bg) 32%, #fdf4ff 100%)',
      paddingBottom: selectionComplete
        ? 'calc(72px + env(safe-area-inset-bottom))'
        : undefined,
    }),
    [selectionComplete],
  )

  return (
    <div className="min-h-screen" style={mainStyle}>
      {/* Hero Section */}
      <div className="relative overflow-hidden px-3 pb-6 pt-8 text-center sm:px-4 sm:pb-8 sm:pt-12">
        {/* Decorative dots pattern */}
        <svg
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 opacity-10"
          width="320"
          height="120"
          viewBox="0 0 320 120"
          fill="none"
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map((col) =>
            [0, 1, 2].map((row) => (
              <circle
                key={`${col}-${row}`}
                cx={40 * col + 20}
                cy={40 * row + 20}
                r="4"
                fill="white"
              />
            )),
          )}
        </svg>
        <h1
          className="animate-fade-in-up relative text-3xl font-extrabold tracking-tight sm:text-4xl"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#fff',
          }}
        >
          すきコレ
        </h1>
        <p
          className="animate-fade-in-up animate-delay-200 relative mx-auto mt-2 max-w-md text-sm sm:mt-3 sm:text-base"
          style={{ color: 'rgba(255,255,255,0.9)' }}
        >
          好きな作品を3つ選んで、みんなにシェアしよう 💜
        </p>
        <div className="animate-fade-in-up animate-delay-200 relative mt-3">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
            style={{
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.5)',
              backgroundColor: 'rgba(255,255,255,0.15)',
            }}
          >
            みんなの推しを見る 👀
          </Link>
        </div>
        <div className="animate-fade-in-up animate-delay-400 relative mt-5">
          <StepGuide />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-3 sm:px-4">
        {/* Theme Input Section */}
        <div className="mx-auto max-w-2xl">
          <div
            className="rounded-xl p-4 shadow-sm sm:p-5"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <ThemeInput value={theme} onChange={setTheme} />
            <ThemeHistory onSelect={setTheme} />
          </div>
        </div>

        {/* Selection Area - Sticky on desktop only */}
        <div
          data-testid="selection-area-wrapper"
          className="mt-4 rounded-xl p-4 shadow-md sm:sticky sm:top-0 sm:z-30 sm:p-5"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <SelectionArea
            theme={theme}
            onBeforeCreate={handleBeforeCreate}
            onCompleteChange={handleCompleteChange}
            onSlotClick={setActiveTab}
          />
        </div>

        {/* Search Section Card */}
        <div
          className="mt-4 rounded-xl p-4 shadow-sm sm:p-5"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Tab + SearchBar: sticky on mobile, static on desktop */}
          <div
            data-testid="search-sticky-header"
            className="sticky top-0 z-30 -mx-4 -mt-4 mb-2 rounded-t-xl px-4 pb-2 pt-4 sm:static sm:z-auto sm:mx-0 sm:mt-0 sm:mb-0 sm:rounded-none sm:px-0 sm:pb-0 sm:pt-0"
            style={{
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <TabSwitcher value={activeTab} onChange={setActiveTab} />
            <SearchBar value={currentQuery} onChange={handleQueryChange} />
          </div>

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

      <DataCredits />
    </div>
  )
}

export default SearchPage
