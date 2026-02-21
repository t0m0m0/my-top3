import type { SearchResultItem } from '../types/common'
import { proxyImageUrl } from '../utils/proxy-image-url'
import { SafeImage } from './SafeImage'
import { CANVAS_PLACEHOLDER } from '../constants/placeholders'

export type ImageWorkCardProps = {
  item: SearchResultItem | null
  label: string
}

export const COLORS = {
  textPrimary: '#fff',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  textSubheading: '#e5e7eb',
  badgeBg: '#1f2937',
  rankBadgeBg: '#facc15',
  canvasBg: '#111827',
} as const

const TRUNCATED_TEXT: React.CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: 260,
  textAlign: 'center',
}

/** @deprecated Use CANVAS_PLACEHOLDER from constants/placeholders instead */
export const NO_IMAGE_SRC = CANVAS_PLACEHOLDER

export function ImageWorkCard({ item, label }: ImageWorkCardProps) {
  if (!item) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <span style={{ color: COLORS.textMuted, fontSize: 18 }}>{label}</span>
        <span style={{ color: COLORS.textMuted, fontSize: 14 }}>No Data</span>
      </div>
    )
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 12px',
        gap: 10,
      }}
    >
      {/* Category label badge */}
      <div
        style={{
          background: 'linear-gradient(135deg, #312e81, #1e1b4b)',
          color: COLORS.textPrimary,
          fontSize: 15,
          fontWeight: 700,
          padding: '5px 16px',
          borderRadius: 6,
          textTransform: 'uppercase' as const,
          letterSpacing: 2,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {label}
      </div>

      {/* Rank badge - larger, gold, with glow */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24)',
          color: '#78350f',
          fontSize: 18,
          fontWeight: 800,
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(250,204,21,0.4), 0 4px 8px rgba(0,0,0,0.3)',
        }}
      >
        #1
      </div>

      {/* Thumbnail with enhanced shadow */}
      <SafeImage
        src={proxyImageUrl(item.thumbnailUrl)}
        alt={item.title}
        fallbackSrc={CANVAS_PLACEHOLDER}
        crossOrigin="anonymous"
        style={{
          width: 210,
          height: 290,
          objectFit: 'cover',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
          border: '2px solid rgba(255,255,255,0.1)',
        }}
      />

      {/* Title */}
      <span
        style={{
          ...TRUNCATED_TEXT,
          fontSize: 18,
          fontWeight: 700,
          color: COLORS.textPrimary,
          letterSpacing: 0.5,
        }}
      >
        {item.title}
      </span>

      {/* Subtitle */}
      <span
        style={{
          ...TRUNCATED_TEXT,
          fontSize: 14,
          color: COLORS.textSecondary,
        }}
      >
        {item.subtitle}
      </span>
    </div>
  )
}
