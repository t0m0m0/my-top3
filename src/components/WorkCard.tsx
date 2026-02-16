import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import type { SearchResultItem } from '../types/common'

const DEFAULT_THUMBNAIL =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="176" fill="%23e5e7eb"><rect width="128" height="176"/><text x="64" y="92" text-anchor="middle" fill="%239ca3af" font-size="12">No Image</text></svg>'

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  BOOK: { bg: '#3b82f6', text: '#ffffff' },
  MUSIC: { bg: '#8b5cf6', text: '#ffffff' },
  MOVIE: { bg: '#ef4444', text: '#ffffff' },
}

type WorkCardProps = {
  work: SearchResultItem | null
  loading: boolean
  error: string | null
  label: string
  onRetry?: () => void
}

function WorkCard({ work, loading, error, label, onRetry }: WorkCardProps) {
  if (loading) {
    return (
      <div
        className="flex min-h-[280px] flex-1 flex-col items-center rounded-xl border p-4"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <Skeleton variant="rounded" width={56} height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="rounded" width={32} height={18} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" width={128} height={176} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={100} height={18} />
        <Skeleton variant="text" width={72} height={14} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-4">
        <Typography variant="caption" className="text-red-500">
          {error}
        </Typography>
        {onRetry && (
          <Button
            size="small"
            color="error"
            onClick={onRetry}
            sx={{ mt: 1, fontSize: '0.7rem' }}
          >
            再試行
          </Button>
        )}
      </div>
    )
  }

  if (!work) {
    return (
      <div
        className="flex min-h-[280px] flex-1 flex-col items-center justify-center rounded-xl border p-4"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <Typography
          variant="caption"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label} - データなし
        </Typography>
      </div>
    )
  }

  const categoryColor = CATEGORY_COLORS[label] ?? {
    bg: 'var(--color-primary)',
    text: '#ffffff',
  }

  return (
    <div
      className="relative rounded-xl p-[2px]"
      style={{
        background:
          'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
      }}
    >
      <div
        className="group relative flex min-h-[280px] flex-1 flex-col items-center rounded-[10px] p-4 pt-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        style={{
          background: 'var(--color-surface)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        {/* Category tag */}
        <div
          className="absolute left-3 top-3 rounded-md px-2 py-0.5"
          style={{
            backgroundColor: categoryColor.bg,
            color: categoryColor.text,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.6rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: 'inherit',
            }}
          >
            {label}
          </Typography>
        </div>

        {/* Rank badge overlapping image top */}
        <div className="relative mb-[-14px] z-10">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #f59e0b, #eab308, #f59e0b)',
              boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#78350f',
                lineHeight: 1,
              }}
            >
              #1
            </Typography>
          </div>
        </div>

        <img
          src={work.thumbnailUrl}
          alt={work.title}
          className="mb-3 h-44 w-32 rounded-lg object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const img = e.target as HTMLImageElement
            if (img.src !== DEFAULT_THUMBNAIL) {
              img.src = DEFAULT_THUMBNAIL
            }
          }}
        />
        <Typography
          variant="body2"
          className="text-center font-semibold"
          sx={{ fontSize: '0.85rem', lineHeight: 1.3 }}
        >
          {work.title}
        </Typography>
        <Typography
          variant="caption"
          className="text-center"
          sx={{
            fontSize: '0.7rem',
            color: 'var(--color-text-secondary)',
            mt: 0.25,
          }}
        >
          {work.subtitle}
        </Typography>
        {work.externalUrl && (
          <a
            href={work.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-xs transition-colors hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            詳細を見る →
          </a>
        )}
      </div>
    </div>
  )
}

export default WorkCard
