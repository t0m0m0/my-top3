import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
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
    <Box
      className="mt-4 rounded-xl p-4"
      sx={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid',
        borderColor: 'divider',
      }}
      aria-label="検索履歴"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <HistoryIcon
            fontSize="small"
            sx={{ color: 'var(--color-text-secondary)' }}
          />
          <Typography
            variant="subtitle2"
            sx={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
          >
            最近の検索
          </Typography>
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
            onClick={() => onSearch(keyword)}
            onDelete={() => removeHistory(keyword)}
            sx={{
              borderRadius: '8px',
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
              color: 'var(--color-text-primary)',
              fontWeight: 500,
              border: '1px solid',
              borderColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
              '&:hover': {
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 16%, transparent)',
              },
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
    </Box>
  )
}
