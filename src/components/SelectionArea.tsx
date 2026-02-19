import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
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

const CATEGORIES: MediaCategory[] = ['book', 'music', 'movie']

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

/** Compact progress dots for collapsed mobile header */
function ProgressDots({ selectedCount }: { selectedCount: number }) {
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-2.5 w-2.5 rounded-full transition-all"
          style={{
            backgroundColor:
              i < selectedCount
                ? 'var(--color-primary)'
                : 'var(--color-border)',
          }}
        />
      ))}
    </span>
  )
}

/** Collapsible header bar for mobile */
function MobileCollapsedBar({
  selectedCount,
  expanded,
  onToggle,
}: {
  selectedCount: number
  expanded: boolean
  onToggle: () => void
}) {
  const label =
    selectedCount === 0
      ? '作品を選ぼう'
      : selectedCount < 3
        ? `あと${3 - selectedCount}つ選ぼう`
        : '準備完了！'

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between py-1"
      aria-expanded={expanded}
      aria-label="選択エリアを展開・折りたたむ"
    >
      <div className="flex items-center gap-2.5">
        <ProgressDots selectedCount={selectedCount} />
        <span
          className="text-sm font-bold"
          style={{ color: 'var(--color-primary-dark)' }}
        >
          選択中 {selectedCount}/3
        </span>
        <span
          className="text-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label}
        </span>
      </div>
      <ExpandMoreIcon
        sx={{
          color: 'var(--color-text-secondary)',
          transition: 'transform 0.3s',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          fontSize: 22,
        }}
      />
    </button>
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

  const selectedCount = CATEGORIES.filter((c) => selection[c]).length

  // null = no manual override; derive from selection count
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null)
  const [prevCount, setPrevCount] = useState(selectedCount)
  // Reset manual override when selection count changes
  // (React-recommended "adjusting state during rendering" pattern)
  if (prevCount !== selectedCount) {
    setPrevCount(selectedCount)
    setManualExpanded(null)
  }
  // Auto: collapsed when items selected, expanded when empty
  const mobileExpanded = manualExpanded ?? selectedCount === 0

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
      {/* Desktop: always show full view */}
      <div className="hidden sm:block">
        <div className="mb-2 flex items-center justify-between">
          <span
            className="text-sm font-bold"
            style={{ color: 'var(--color-primary-dark)' }}
          >
            選択中の作品
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            {selectedCount} / 3
          </span>
        </div>
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <SlotCard
              key={cat}
              category={cat}
              item={selection[cat]}
              onDeselect={deselectItem}
              onSlotClick={onSlotClick}
            />
          ))}
        </div>
        {isComplete && (
          <div className="mt-3 text-center">
            <Button variant="contained" onClick={handleCreate} size="medium">
              Top3を作成
            </Button>
          </div>
        )}
      </div>

      {/* Mobile: collapsible view */}
      <div className="sm:hidden">
        <MobileCollapsedBar
          selectedCount={selectedCount}
          expanded={mobileExpanded}
          onToggle={() =>
            setManualExpanded((prev) => !(prev ?? mobileExpanded))
          }
        />
        <Collapse in={mobileExpanded} timeout={300}>
          <div className="flex flex-col gap-2 pt-2">
            {CATEGORIES.map((cat) => (
              <SlotCard
                key={cat}
                category={cat}
                item={selection[cat]}
                onDeselect={deselectItem}
                onSlotClick={onSlotClick}
              />
            ))}
          </div>
        </Collapse>
      </div>

      {/* Mobile floating bar: progressive button (only when >= 1 selected) */}
      {selectedCount >= 1 && (
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
            disabled={!isComplete}
            size="large"
            sx={{
              pointerEvents: 'auto',
              minHeight: 48,
              minWidth: 200,
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '9999px',
              boxShadow: isComplete
                ? '0 4px 14px rgba(0,0,0,0.25)'
                : '0 2px 8px rgba(0,0,0,0.12)',
              ...(isComplete && {
                animation: 'scaleIn 0.3s ease-out, pulse-soft 0.4s ease-in-out',
              }),
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              },
            }}
          >
            {isComplete ? (
              'Top3を作成 🎉'
            ) : (
              <span className="flex items-center gap-2">
                あと{3 - selectedCount}つ選ぼう
                <ProgressDots selectedCount={selectedCount} />
              </span>
            )}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default SelectionArea
