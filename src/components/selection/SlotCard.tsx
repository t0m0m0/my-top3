import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { SafeImage } from '../SafeImage'
import { DEFAULT_PLACEHOLDER } from '../../constants/placeholders'
import { CATEGORY_LABELS_DISPLAY } from '../../constants/category'
import type { MediaCategory, SearchResultItem } from '../../types/common'

const SLOT_COLORS: Record<
  MediaCategory,
  { bg: string; border: string; text: string }
> = {
  book: {
    bg: 'var(--color-cat-book-bg)',
    border: 'var(--color-cat-book-border)',
    text: 'var(--color-cat-book-text)',
  },
  music: {
    bg: 'var(--color-cat-music-bg)',
    border: 'var(--color-cat-music-border)',
    text: 'var(--color-cat-music-text)',
  },
  movie: {
    bg: 'var(--color-cat-movie-bg)',
    border: 'var(--color-cat-movie-border)',
    text: 'var(--color-cat-movie-text)',
  },
}

type SlotCardProps = {
  category: MediaCategory
  item: SearchResultItem | null
  onDeselect: (category: MediaCategory) => void
  onSlotClick?: (category: MediaCategory) => void
}

export function SlotCard({
  category,
  item,
  onDeselect,
  onSlotClick,
}: SlotCardProps) {
  const colors = SLOT_COLORS[category]

  if (!item) {
    return (
      <button
        type="button"
        className="flex h-16 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-2 transition-all duration-200 hover:scale-[1.02] sm:h-20"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
        }}
        onClick={() => onSlotClick?.(category)}
        aria-label={`${CATEGORY_LABELS_DISPLAY[category]}を選ぶ`}
      >
        <span
          className="pointer-events-none select-none text-xs font-semibold"
          style={{ color: colors.text }}
        >
          {CATEGORY_LABELS_DISPLAY[category]}
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
      className="animate-scale-in relative flex h-16 flex-1 items-center gap-2 rounded-2xl border-2 p-2 transition-all sm:h-20"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.bg,
        boxShadow: `3px 3px 8px ${colors.border}, -1px -1px 4px rgba(255,255,255,0.6)`,
      }}
    >
      <IconButton
        size="small"
        onClick={() => onDeselect(category)}
        sx={{ position: 'absolute', top: 2, right: 2, padding: '2px' }}
        aria-label={`${CATEGORY_LABELS_DISPLAY[category]}の選択を解除`}
      >
        <CloseIcon sx={{ fontSize: 14, color: colors.text }} />
      </IconButton>
      <SafeImage
        src={item.thumbnailUrl}
        alt={item.title}
        fallbackSrc={DEFAULT_PLACEHOLDER}
        className="h-12 w-9 rounded-lg object-cover sm:h-16 sm:w-12"
      />
      <div className="min-w-0 flex-1 pr-4">
        <span
          className="text-xs font-semibold"
          style={{ color: colors.text, fontSize: '0.6rem' }}
        >
          {CATEGORY_LABELS_DISPLAY[category]}
        </span>
        <p
          className="truncate text-xs font-medium"
          style={{ lineHeight: 1.3, color: 'var(--color-text-primary)' }}
        >
          {item.title}
        </p>
        <span
          className="block truncate text-xs"
          style={{ color: 'var(--color-text-secondary)', fontSize: '0.6rem' }}
        >
          {item.subtitle}
        </span>
      </div>
    </div>
  )
}
