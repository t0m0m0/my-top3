import TabSwitcher from '../components/TabSwitcher'
import SearchBar from '../components/SearchBar'
import SearchHistory from '../components/SearchHistory'
import SearchResults from '../components/SearchResults'
import ThemeInput from '../components/ThemeInput'
import ThemeHistory from '../components/ThemeHistory'
import SelectionArea from '../components/SelectionArea'
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
    handleQueryChange,
    handleHistorySearch,
    handleSelect,
    handleThemeHistorySelect,
    handleBeforeCreate,
    handleCompleteChange,
    mainStyle,
  } = useSearchPage()

  return (
    <div className="min-h-screen" style={mainStyle}>
      {/* Hero Section */}
      <div className="px-3 pb-6 pt-8 text-center sm:px-4 sm:pb-8 sm:pt-12">
        <h1
          className="text-3xl font-extrabold tracking-tight sm:text-4xl"
          style={{
            fontFamily: 'var(--font-display)',
            color: '#fff',
          }}
        >
          My No.1s
        </h1>
        <p
          className="mx-auto mt-2 max-w-md text-sm sm:mt-3 sm:text-base"
          style={{ color: 'rgba(255,255,255,0.8)' }}
        >
          テーマを決めて、お気に入りの3作品を選ぼう
        </p>
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
            <ThemeHistory onSelect={handleThemeHistorySelect} />
          </div>
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
          <SelectionArea
            theme={theme}
            onBeforeCreate={handleBeforeCreate}
            onCompleteChange={handleCompleteChange}
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
