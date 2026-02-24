import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { SafeImage } from '../SafeImage'
import { DEFAULT_PLACEHOLDER } from '../../constants/placeholders'
import { CATEGORY_LABELS_EN, CATEGORY_ICONS } from '../../constants/category'
import type { MediaCategory, SearchResultItem } from '../../types/common'

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
        <span className="text-xs font-medium" style={{ color: '#52525b' }}>
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
      <SafeImage
        src={item.thumbnailUrl}
        alt={item.title}
        fallbackSrc={DEFAULT_PLACEHOLDER}
        className="h-16 w-12 rounded object-cover"
      />
      <div className="min-w-0 flex-1 pr-4">
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--color-primary)', fontSize: '0.65rem' }}
        >
          {CATEGORY_LABELS_EN[category]}
        </span>
        <p className="truncate text-xs font-medium" style={{ lineHeight: 1.3 }}>
          {item.title}
        </p>
        <span
          className="block truncate text-xs"
          style={{ color: 'var(--color-text-secondary)', fontSize: '0.65rem' }}
        >
          {item.subtitle}
        </span>
      </div>
    </div>
  )
}
