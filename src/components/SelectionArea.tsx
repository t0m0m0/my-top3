import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import { useNavigate } from 'react-router-dom'
import { useSelection } from '../hooks/useSelection'
import { buildTop3Url } from '../utils/url-params'
import type { MediaCategory, SearchResultItem } from '../types/common'

type SelectionAreaProps = {
  theme: string
  onBeforeCreate?: () => void
}

const CATEGORY_LABELS: Record<MediaCategory, string> = {
  book: 'Book',
  music: 'Music',
  movie: 'Movie',
}

function SlotCard({
  category,
  item,
  onDeselect,
}: {
  category: MediaCategory
  item: SearchResultItem | null
  onDeselect: (category: MediaCategory) => void
}) {
  if (!item) {
    return (
      <div
        className="flex h-20 flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed p-2 transition-colors sm:h-28"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {CATEGORY_LABELS[category]}
        </Typography>
        <Typography
          variant="caption"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          未選択
        </Typography>
      </div>
    )
  }

  return (
    <div
      className="relative flex h-20 flex-1 items-center gap-2 rounded-xl border-2 p-2 transition-colors sm:h-28"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <IconButton
        size="small"
        onClick={() => onDeselect(category)}
        className="absolute right-0 top-0"
        sx={{ position: 'absolute', top: 2, right: 2, padding: '2px' }}
        aria-label={`${CATEGORY_LABELS[category]}の選択を解除`}
      >
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <img
        src={item.thumbnailUrl}
        alt={item.title}
        className="h-16 w-12 rounded object-cover"
        onError={(e) => {
          ;(e.target as HTMLImageElement).src = ''
          ;(e.target as HTMLImageElement).alt = 'No Image'
        }}
      />
      <div className="min-w-0 flex-1 pr-4">
        <Typography
          variant="caption"
          sx={{ fontSize: '0.65rem', color: 'var(--color-primary)' }}
        >
          {CATEGORY_LABELS[category]}
        </Typography>
        <Typography
          variant="body2"
          className="truncate font-medium"
          sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}
        >
          {item.title}
        </Typography>
        <Typography
          variant="caption"
          className="truncate"
          sx={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)' }}
        >
          {item.subtitle}
        </Typography>
      </div>
    </div>
  )
}

function SelectionArea({ theme, onBeforeCreate }: SelectionAreaProps) {
  const { selection, deselectItem, isComplete } = useSelection()
  const navigate = useNavigate()

  const selectedCount = (
    [selection.book, selection.music, selection.movie] as const
  ).filter(Boolean).length

  const handleCreate = () => {
    onBeforeCreate?.()
    const url = buildTop3Url(selection, theme)
    navigate(url)
  }

  return (
    <Box>
      <div className="mb-2 flex items-center justify-between">
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, fontSize: '0.85rem' }}
          style={{ color: 'var(--color-primary-dark)' }}
        >
          選択中の作品
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          style={{ color: 'var(--color-primary)' }}
        >
          {selectedCount} / 3
        </Typography>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <SlotCard
          category="book"
          item={selection.book}
          onDeselect={deselectItem}
        />
        <SlotCard
          category="music"
          item={selection.music}
          onDeselect={deselectItem}
        />
        <SlotCard
          category="movie"
          item={selection.movie}
          onDeselect={deselectItem}
        />
      </div>
      {isComplete && (
        <div className="mt-3 text-center">
          <Button variant="contained" onClick={handleCreate} size="medium">
            Top3を作成
          </Button>
        </div>
      )}
    </Box>
  )
}

export default SelectionArea
