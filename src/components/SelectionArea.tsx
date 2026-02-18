import { useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import { useNavigate } from 'react-router-dom'
import { useSelection } from '../hooks/useSelection'
import { buildTop3Url } from '../utils/url-params'
import type { MediaCategory, SearchResultItem } from '../types/common'
import { CATEGORY_LABELS_EN } from '../constants/category'

const CATEGORY_ICONS: Record<MediaCategory, string> = {
  book: '📖',
  music: '🎵',
  movie: '🎬',
}

type SelectionAreaProps = {
  theme: string
  onBeforeCreate?: () => void
  onCompleteChange?: (isComplete: boolean) => void
  onSlotClick?: (category: MediaCategory) => void
}

function SlotCard({
  category,
  item,
  onDeselect,
  onSlotClick,
}: {
  category: MediaCategory
  item: SearchResultItem | null
  onDeselect: (category: MediaCategory) => void
  onSlotClick?: (category: MediaCategory) => void
}) {
  if (!item) {
    return (
      <button
        type="button"
        className="gradient-border-slot flex h-20 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-2 transition-all hover:opacity-80 sm:h-28"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
        onClick={() => onSlotClick?.(category)}
        aria-label={`${CATEGORY_LABELS_EN[category]}を選ぶ`}
      >
        <span
          className="pointer-events-none select-none text-2xl sm:text-3xl"
          style={{ opacity: 0.3 }}
          aria-hidden="true"
        >
          {CATEGORY_ICONS[category]}
        </span>
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {CATEGORY_LABELS_EN[category]}
        </span>
        <span
          className="text-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          未選択
        </span>
      </button>
    )
  }

  return (
    <div
      className="animate-scale-in slot-selected relative flex h-20 flex-1 items-center gap-2 rounded-xl border-2 p-2 transition-all sm:h-28"
      style={{
        borderColor: 'var(--color-primary-light)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <IconButton
        size="small"
        onClick={() => onDeselect(category)}
        className="absolute right-0 top-0"
        sx={{ position: 'absolute', top: 2, right: 2, padding: '2px' }}
        aria-label={`${CATEGORY_LABELS_EN[category]}の選択を解除`}
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
          {CATEGORY_LABELS_EN[category]}
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

function SelectionArea({
  theme,
  onBeforeCreate,
  onCompleteChange,
  onSlotClick,
}: SelectionAreaProps) {
  const { selection, deselectItem, isComplete } = useSelection()
  const navigate = useNavigate()

  const selectedCount = (
    [selection.book, selection.music, selection.movie] as const
  ).filter(Boolean).length

  useEffect(() => {
    onCompleteChange?.(isComplete)
  }, [isComplete, onCompleteChange])

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
          onSlotClick={onSlotClick}
        />
        <SlotCard
          category="music"
          item={selection.music}
          onDeselect={deselectItem}
          onSlotClick={onSlotClick}
        />
        <SlotCard
          category="movie"
          item={selection.movie}
          onDeselect={deselectItem}
          onSlotClick={onSlotClick}
        />
      </div>
      {isComplete && (
        <div className="mt-3 text-center">
          <Button
            variant="contained"
            onClick={handleCreate}
            size="medium"
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            Top3を作成
          </Button>
        </div>
      )}

      {/* Floating action button - fixed at bottom for mobile */}
      {isComplete && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            display: { xs: 'flex', sm: 'none' },
            justifyContent: 'center',
            pb: `max(12px, env(safe-area-inset-bottom))`,
            pt: 1.5,
            px: 2,
            background:
              'linear-gradient(transparent, rgba(255,255,255,0.95) 30%)',
            pointerEvents: 'none',
          }}
        >
          <Button
            variant="contained"
            onClick={handleCreate}
            size="large"
            sx={{
              pointerEvents: 'auto',
              minHeight: 48,
              minWidth: 200,
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '9999px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              },
            }}
          >
            Top3を作成 🎉
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default SelectionArea
