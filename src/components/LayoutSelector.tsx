import type { MediaCategory } from '../types/common'
import type { LayoutConfig, SlotPosition } from '../constants/image-layout'
import { SLOT_LABELS, SLOT_POSITIONS } from '../constants/image-layout'

type LayoutSelectorProps = {
  layout: LayoutConfig
  onLayoutChange: (slot: SlotPosition, category: MediaCategory) => void
}

export function LayoutSelector({
  layout,
  onLayoutChange,
}: LayoutSelectorProps) {
  return (
    <div
      data-testid="layout-selector"
      className="mb-4 flex flex-wrap items-center justify-center gap-3"
    >
      {SLOT_POSITIONS.map((slot) => (
        <label key={slot} className="flex items-center gap-1.5 text-sm">
          <span style={{ color: 'var(--color-text-secondary)' }}>
            {SLOT_LABELS[slot]}:
          </span>
          <select
            data-testid={`select-${slot}`}
            value={layout[slot]}
            onChange={(e) =>
              onLayoutChange(slot, e.target.value as MediaCategory)
            }
            className="rounded border px-2 py-1 text-sm"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
            }}
          >
            <option value="book">Book</option>
            <option value="music">Music</option>
            <option value="movie">Movie</option>
          </select>
        </label>
      ))}
    </div>
  )
}
