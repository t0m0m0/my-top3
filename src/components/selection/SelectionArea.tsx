import { useEffect } from 'react'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import { useNavigate } from 'react-router-dom'
import { useSelection } from '../../hooks/useSelection'
import { useMobileCollapse } from '../../hooks/useMobileCollapse'
import { buildTop3Url } from '../../utils/url-params'
import { CATEGORIES } from '../../constants/category'
import { SlotCard } from './SlotCard'
import { ProgressDots } from './ProgressDots'
import { MobileCollapsedBar } from './MobileCollapsedBar'
import type { MediaCategory } from '../../types/common'

type SelectionAreaProps = {
  theme: string
  onBeforeCreate?: () => void
  onCompleteChange?: (isComplete: boolean) => void
  onSlotClick?: (category: MediaCategory) => void
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
  const { expanded: mobileExpanded, toggle: toggleMobile } =
    useMobileCollapse(selectedCount)

  useEffect(() => {
    onCompleteChange?.(isComplete)
  }, [isComplete, onCompleteChange])

  const handleCreate = () => {
    onBeforeCreate?.()
    const url = buildTop3Url(selection, theme)
    navigate(url)
  }

  return (
    <div>
      {/* Desktop: always show full view */}
      <div className="hidden sm:block">
        <div className="mb-2 flex items-center justify-between">
          <span
            className="text-sm font-bold"
            style={{ color: 'var(--color-primary-dark)' }}
          >
            あなたのセレクト
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
              できた！シェアする 🎨
            </Button>
          </div>
        )}
      </div>

      {/* Mobile: collapsible view */}
      <div className="sm:hidden">
        <MobileCollapsedBar
          selectedCount={selectedCount}
          expanded={mobileExpanded}
          onToggle={toggleMobile}
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
        <div
          className="fixed inset-x-0 bottom-0 z-[1200] flex justify-center px-2 pt-1.5 pointer-events-none sm:hidden"
          style={{
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            background:
              'linear-gradient(transparent, color-mix(in srgb, var(--color-bg) 95%, transparent) 30%)',
          }}
        >
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!isComplete}
            size="large"
            className={`pointer-events-auto ${isComplete ? 'animate-scale-in animate-pulse-soft' : ''}`}
            sx={{
              minHeight: 48,
              minWidth: 200,
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '9999px',
              boxShadow: isComplete
                ? '0 4px 14px rgba(0,0,0,0.25)'
                : '0 2px 8px rgba(0,0,0,0.12)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              },
            }}
          >
            {isComplete ? (
              'できた！シェアする 🎉'
            ) : (
              <span className="flex items-center gap-2">
                あと{3 - selectedCount}つ選ぼう
                <ProgressDots selectedCount={selectedCount} />
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default SelectionArea
