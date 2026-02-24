import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { ProgressDots } from './ProgressDots'

type MobileCollapsedBarProps = {
  selectedCount: number
  expanded: boolean
  onToggle: () => void
}

/** Collapsible header bar for mobile */
export function MobileCollapsedBar({
  selectedCount,
  expanded,
  onToggle,
}: MobileCollapsedBarProps) {
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
        className="transition-transform duration-300"
        style={{
          color: 'var(--color-text-secondary)',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          fontSize: 22,
        }}
      />
    </button>
  )
}
