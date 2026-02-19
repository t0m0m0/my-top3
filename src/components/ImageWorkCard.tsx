import type { SearchResultItem } from '../types/common'
import { proxyImageUrl } from '../utils/proxy-image-url'

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

export const NO_IMAGE_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iIzM3NDE1MSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='

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
      <img
        src={proxyImageUrl(item.thumbnailUrl)}
        alt={item.title}
        crossOrigin="anonymous"
        onError={(e) => {
          const img = e.target as HTMLImageElement
          if (img.src !== NO_IMAGE_SRC) {
            img.src = NO_IMAGE_SRC
          }
        }}
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
