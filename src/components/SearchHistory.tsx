import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { useSearchHistory } from '../hooks/useSearchHistory'
import type { MediaCategory } from '../types/common'

type SearchHistoryProps = {
  category: MediaCategory
  onSearch: (keyword: string) => void
}

export default function SearchHistory({
  category,
  onSearch,
}: SearchHistoryProps) {
  const { history, removeHistory, clearHistory } = useSearchHistory(category)

  if (history.length === 0) {
    return null
  }

  return (
    <Box
      className="mt-4 rounded-lg p-4"
      sx={{ backgroundColor: 'var(--color-surface)' }}
      aria-label="検索履歴"
    >
      <div className="mb-2 flex items-center justify-between">
        <Typography
          variant="subtitle2"
          sx={{ color: 'var(--color-text-primary)' }}
        >
          最近の検索
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={clearHistory}
          color="primary"
        >
          すべて削除
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((keyword) => (
          <Chip
            key={keyword}
            label={keyword}
            variant="outlined"
            size="small"
            clickable
            onClick={() => onSearch(keyword)}
            onDelete={() => removeHistory(keyword)}
          />
        ))}
      </div>
    </Box>
  )
}
