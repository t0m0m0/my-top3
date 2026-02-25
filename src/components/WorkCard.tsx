import Skeleton from '@mui/material/Skeleton'
import Button from '@mui/material/Button'
import type { SearchResultItem } from '../types/common'
import { SafeImage } from './SafeImage'
import { DEFAULT_PLACEHOLDER } from '../constants/placeholders'

/** Screen-2 style: gradient background + badge + card info */
const CATEGORY_CONFIG: Record<
  string,
  { gradient: string; badgeClass: string; badgeLabel: string; emoji: string }
> = {
  '📚 本': {
    gradient: 'grad-warm',
    badgeClass: 'badge-book',
    badgeLabel: '📖 本',
    emoji: '📚',
  },
  '🎵 音楽': {
    gradient: 'grad-cool',
    badgeClass: 'badge-music',
    badgeLabel: '🎵 音楽',
    emoji: '🎵',
  },
  '🎬 映画': {
    gradient: 'grad-sky',
    badgeClass: 'badge-movie',
    badgeLabel: '🎬 映画',
    emoji: '🎬',
  },
}

const DEFAULT_CONFIG = {
  gradient: 'grad-warm',
  badgeClass: 'badge-book',
  badgeLabel: '作品',
  emoji: '📌',
}

type WorkCardProps = {
  work: SearchResultItem | null
  loading: boolean
  error: string | null
  label: string
  onRetry?: () => void
}

function WorkCard({ work, loading, error, label, onRetry }: WorkCardProps) {
  const config = CATEGORY_CONFIG[label] ?? DEFAULT_CONFIG

  if (loading) {
    return (
      <div
        className="overflow-hidden rounded-[18px] bg-white"
        style={{
          boxShadow:
            '0 6px 24px rgba(80,60,40,0.13), 0 2px 6px rgba(80,60,40,0.08)',
        }}
      >
        <Skeleton variant="rounded" height={160} sx={{ borderRadius: 0 }} />
        <div className="p-4">
          <Skeleton variant="rounded" width={80} height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={140} height={22} />
          <Skeleton variant="text" width={100} height={16} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center overflow-hidden rounded-[18px] border border-red-200 bg-red-50">
        <span className="text-xs text-red-500">{error}</span>
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
        className="flex min-h-[240px] flex-col items-center justify-center overflow-hidden rounded-[18px]"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        <span
          className="text-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {label} - データなし
        </span>
      </div>
    )
  }

  return (
    <div
      className="work-card-board group cursor-pointer overflow-visible transition-all duration-400 hover:z-10"
      style={{
        boxShadow:
          '0 6px 24px rgba(80,60,40,0.13), 0 2px 6px rgba(80,60,40,0.08)',
      }}
    >
      <div className="overflow-hidden rounded-[18px] bg-white">
        {/* Image area with gradient background */}
        <div
          className={`${config.gradient} relative flex h-40 items-center justify-center`}
        >
          {work.thumbnailUrl ? (
            <SafeImage
              src={work.thumbnailUrl}
              alt={work.title}
              fallbackSrc={DEFAULT_PLACEHOLDER}
              className="h-28 w-20 rounded-lg object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-5xl">{config.emoji}</span>
          )}
        </div>

        {/* Card body */}
        <div className="bg-white px-4 pb-4 pt-3">
          {/* Category badge */}
          <span
            className={`${config.badgeClass} mb-1.5 inline-flex items-center gap-1 rounded-[10px] px-2.5 py-0.5 text-[11px] font-bold`}
          >
            {config.badgeLabel}
          </span>

          {/* Title */}
          <p
            className="line-clamp-2 text-base font-bold leading-snug"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text-primary)',
            }}
          >
            {work.title}
          </p>

          {/* Author / subtitle */}
          {work.subtitle && (
            <p
              className="mt-0.5 text-[13px]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {work.subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkCard
