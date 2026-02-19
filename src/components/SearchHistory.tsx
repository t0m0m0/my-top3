import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import HistoryIcon from '@mui/icons-material/History'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
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
    <div
      className="mt-4 rounded-xl border p-4"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
      aria-label="検索履歴"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <HistoryIcon
            fontSize="small"
            sx={{ color: 'var(--color-text-secondary)' }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            最近の検索
          </span>
        </div>
        <Button
          variant="text"
          size="small"
          onClick={clearHistory}
          color="primary"
          startIcon={<DeleteOutlineIcon fontSize="small" />}
          sx={{ textTransform: 'none', fontSize: '0.75rem' }}
        >
          すべて削除
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((keyword) => (
          <Chip
            key={keyword}
            label={keyword}
            size="small"
            clickable
            className="chip-search-history"
            onClick={() => onSearch(keyword)}
            onDelete={() => removeHistory(keyword)}
            sx={{
              '& .MuiChip-deleteIcon': {
                color: 'var(--color-text-secondary)',
                '&:hover': {
                  color: 'var(--color-text-primary)',
                },
              },
            }}
          />
        ))}
      </div>
    </div>
  )
}
