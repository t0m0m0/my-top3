import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import type { MediaCategory } from '../types/common'
import type { LayoutConfig, SlotPosition } from '../constants/image-layout'
import {
  SLOT_LABELS,
  SLOT_POSITIONS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '../constants/image-layout'

const CATEGORIES: MediaCategory[] = ['book', 'music', 'movie']

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
      className="mb-4 flex flex-wrap items-center justify-center gap-4"
    >
      {SLOT_POSITIONS.map((slot) => (
        <div key={slot} className="flex items-center gap-2">
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {SLOT_LABELS[slot]}:
          </span>
          <ToggleButtonGroup
            data-testid={`layout-slot-${slot}`}
            value={layout[slot]}
            exclusive
            size="small"
            onChange={(_, value: MediaCategory | null) => {
              if (value !== null) {
                onLayoutChange(slot, value)
              }
            }}
            sx={{
              '& .MuiToggleButton-root': {
                border: '1px solid var(--color-border)',
                borderRadius: '9999px',
                px: 1.5,
                py: 0.25,
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                textTransform: 'none',
                color: 'var(--color-text-secondary)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'rgba(160, 132, 94, 0.06)',
                },
                '&.Mui-selected': {
                  color: 'var(--color-surface)',
                  borderColor: 'transparent',
                  '&:hover': {
                    filter: 'brightness(1.1)',
                  },
                },
              },
              '& .MuiToggleButtonGroup-grouped': {
                borderRadius: '9999px !important',
                mx: 0.25,
                border: '1px solid var(--color-border) !important',
                '&.Mui-selected': {
                  border: '1px solid transparent !important',
                },
              },
            }}
          >
            {CATEGORIES.map((category) => (
              <ToggleButton
                key={category}
                value={category}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: CATEGORY_COLORS[category],
                  },
                }}
              >
                <span
                  data-testid="color-indicator"
                  className="mr-1 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[category] }}
                />
                {CATEGORY_LABELS[category]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
      ))}
    </div>
  )
}
