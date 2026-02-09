import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import ResultCard from './ResultCard'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'
import type { SearchResultItem } from '../types/common'

type SearchResultsProps = {
  results: SearchResultItem[]
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onSelect: (item: SearchResultItem) => void
  query: string
  error?: string | null
}

export default function SearchResults({
  results,
  isLoading,
  hasMore,
  onLoadMore,
  onSelect,
  query,
  error,
}: SearchResultsProps) {
  const sentinelRef = useIntersectionObserver(onLoadMore)

  if (error) {
    return (
      <Box className="mt-8 text-center">
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  if (!query.trim()) {
    return (
      <Box className="mt-8 text-center">
        <Typography color="text.secondary">作品名を検索してください</Typography>
      </Box>
    )
  }

  if (!isLoading && results.length === 0) {
    return (
      <Box className="mt-8 text-center">
        <Typography color="text.secondary">
          検索結果が見つかりませんでした
        </Typography>
      </Box>
    )
  }

  return (
    <div className="mt-4">
      {results.map((item) => (
        <ResultCard key={item.id} item={item} onSelect={onSelect} />
      ))}

      {isLoading && (
        <Box className="flex justify-center py-6">
          <CircularProgress size={32} />
        </Box>
      )}

      {!isLoading && hasMore && (
        <div ref={sentinelRef} className="h-4" aria-hidden="true" />
      )}

      {!isLoading && !hasMore && results.length > 0 && (
        <Box className="py-4 text-center">
          <Typography variant="body2" color="text.secondary">
            全件表示しました
          </Typography>
        </Box>
      )}
    </div>
  )
}
