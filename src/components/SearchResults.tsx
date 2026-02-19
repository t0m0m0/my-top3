import CircularProgress from '@mui/material/CircularProgress'
import ResultCard from './ResultCard'
import SkeletonCard from './SkeletonCard'
import ErrorMessage from './ErrorMessage'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'
import type { SearchResultItem } from '../types/common'

const SKELETON_COUNT = 4

type SearchResultsProps = {
  results: SearchResultItem[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onSelect: (item: SearchResultItem) => void
  query: string
  error?: string | null
  onRetry?: () => void
}

export default function SearchResults({
  results,
  isLoading,
  hasMore,
  onLoadMore,
  onSelect,
  query,
  error,
  onRetry,
}: SearchResultsProps) {
  const sentinelRef = useIntersectionObserver(onLoadMore)

  if (error) {
    return (
      <div className="mt-8">
        <ErrorMessage message={error} onRetry={onRetry} />
      </div>
    )
  }

  if (!query.trim()) {
    return (
      <div className="mt-8 text-center">
        <p className="text-4xl" aria-hidden="true">
          🎨
        </p>
        <p
          className="mt-2 text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          お気に入りの作品を検索してみよう
        </p>
      </div>
    )
  }

  if (!isLoading && results.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-4xl" aria-hidden="true">
          😔
        </p>
        <p
          className="mt-2 text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          検索結果が見つかりませんでした
        </p>
        <p
          className="mt-1 text-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          別のキーワードで試してみよう 🔍
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((item, index) => (
        <div
          key={item.id}
          className="animate-fade-in-up"
          style={index < 8 ? { animationDelay: `${index * 50}ms` } : undefined}
        >
          <ResultCard item={item} onSelect={onSelect} />
        </div>
      ))}

      {isLoading && results.length === 0
        ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))
        : isLoading && (
            <div className="col-span-full flex justify-center py-6">
              <CircularProgress size={32} />
            </div>
          )}

      {!isLoading && hasMore && (
        <div
          ref={sentinelRef}
          className="col-span-full h-4"
          aria-hidden="true"
        />
      )}

      {!isLoading && !hasMore && results.length > 0 && (
        <div className="col-span-full py-4 text-center">
          <p
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            全件表示しました
          </p>
        </div>
      )}
    </div>
  )
}
