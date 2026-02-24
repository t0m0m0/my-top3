import type { SearchResultItem, MediaCategory } from '../types/common'
import type { SlotPosition } from '../constants/image-layout'
import {
  CATEGORY_COLORS,
  CATEGORY_BORDER_COLORS,
  CATEGORY_LABELS,
  SLOT_STYLES,
} from '../constants/image-layout'
import { proxyImageUrl } from '../utils/proxy-image-url'

export type ImageSlotProps = {
  item: SearchResultItem | null
  category: MediaCategory
  slot: SlotPosition
  theme?: string
}

export function ImageSlot({ item, category, slot, theme }: ImageSlotProps) {
  const style = SLOT_STYLES[slot]
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
          background: '#2a2420',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#a89888',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          {CATEGORY_LABELS[category]}
        </span>
        <span style={{ color: '#8c7e72', fontSize: 14, marginTop: 4 }}>
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
          filter: slot === 'top' ? 'none' : 'brightness(0.7)',
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
          {slot === 'top' && theme ? (
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
                fontSize: slot === 'top' ? 11 : 10,
                fontWeight: 700,
                color,
                letterSpacing: 3,
                textTransform: 'uppercase' as const,
                padding: slot === 'top' ? '4px 12px' : '3px 10px',
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
          {slot === 'top' && theme && (
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
              marginTop: slot === 'top' ? 8 : 6,
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
