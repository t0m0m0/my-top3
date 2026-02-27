import type { SearchResultItem, MediaCategory } from '../types/common'
import type { AnySlotPosition } from '../constants/image-layout'
import {
  CATEGORY_COLORS,
  CATEGORY_BORDER_COLORS,
  CATEGORY_LABELS,
  SLOT_STYLES,
  VERTICAL_SLOT_STYLES,
} from '../constants/image-layout'
import {
  CANVAS_DARK,
  CANVAS_TEXT_MUTED,
  TEXT_SECONDARY,
} from '../constants/image-colors'
import { proxyImageUrl } from '../utils/proxy-image-url'

export type ImageSlotProps = {
  item: SearchResultItem | null
  category: MediaCategory
  slot: AnySlotPosition
  theme?: string
}

function isTopSlot(slot: AnySlotPosition): boolean {
  return slot === 'top' || slot === 'v-top'
}

function getSlotStyle(slot: AnySlotPosition) {
  if (slot.startsWith('v-')) {
    return VERTICAL_SLOT_STYLES[slot as keyof typeof VERTICAL_SLOT_STYLES]
  }
  return SLOT_STYLES[slot as keyof typeof SLOT_STYLES]
}

export function ImageSlot({ item, category, slot, theme }: ImageSlotProps) {
  const style = getSlotStyle(slot)
  const isTop = isTopSlot(slot)
  const color = CATEGORY_COLORS[category]
  const borderColor = CATEGORY_BORDER_COLORS[category]

  if (!item) {
    return (
      <div
        data-testid={`slot-${slot}`}
        style={{
          position: 'absolute',
          top: style.top,
          left: style.left,
          width: style.width,
          height: style.height,
          overflow: 'hidden',
          background: CANVAS_DARK,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: CANVAS_TEXT_MUTED,
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          {CATEGORY_LABELS[category]}
        </span>
        <span style={{ color: TEXT_SECONDARY, fontSize: 14, marginTop: 4 }}>
          No Data
        </span>
      </div>
    )
  }

  return (
    <div
      data-testid={`slot-${slot}`}
      style={{
        position: 'absolute',
        top: style.top,
        left: style.left,
        width: style.width,
        height: style.height,
        overflow: 'hidden',
      }}
    >
      {/* Full-bleed thumbnail (background-image for html2canvas compatibility) */}
      <div
        role="img"
        aria-label={item.title}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${proxyImageUrl(item.thumbnailUrl)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: isTop ? 'none' : 'brightness(0.7)',
        }}
      />

      {/* Dark gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: [
            'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.75) 100%)',
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)',
          ].join(', '),
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: style.padding,
        }}
      >
        {/* Top: theme (only on top slot) or category badge */}
        <div>
          {isTop && theme ? (
            <div
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: 2,
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }}
            >
              {`\u300C ${theme} \u300D`}
            </div>
          ) : (
            <div
              style={{
                display: 'inline-block',
                alignSelf: 'flex-start',
                fontSize: isTop ? 11 : 10,
                fontWeight: 700,
                color,
                letterSpacing: 3,
                textTransform: 'uppercase' as const,
                padding: isTop ? '4px 12px' : '3px 10px',
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${borderColor}`,
                borderRadius: 4,
              }}
            >
              {CATEGORY_LABELS[category]}
            </div>
          )}
        </div>

        {/* Bottom: work info */}
        <div>
          {/* Category badge (show below theme on top slot) */}
          {isTop && theme && (
            <div
              style={{
                display: 'inline-block',
                fontSize: 11,
                fontWeight: 700,
                color,
                letterSpacing: 3,
                textTransform: 'uppercase' as const,
                marginBottom: 12,
                padding: '4px 12px',
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${borderColor}`,
                borderRadius: 4,
              }}
            >
              {CATEGORY_LABELS[category]}
            </div>
          )}
          <div
            style={{
              fontSize: style.titleSize,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.15,
              textShadow: '0 2px 20px rgba(0,0,0,0.6)',
            }}
          >
            {item.title}
          </div>
          <div
            style={{
              fontSize: style.subtitleSize,
              color: 'rgba(255,255,255,0.55)',
              marginTop: isTop ? 8 : 6,
              letterSpacing: 1,
              textShadow: '0 1px 8px rgba(0,0,0,0.5)',
            }}
          >
            {item.subtitle}
          </div>
        </div>
      </div>
    </div>
  )
}
