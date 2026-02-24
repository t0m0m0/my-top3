import Skeleton from '@mui/material/Skeleton'
import Button from '@mui/material/Button'
import type { SearchResultItem } from '../types/common'
import { SafeImage } from './SafeImage'
import { DEFAULT_PLACEHOLDER } from '../constants/placeholders'

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  '📚 本': { bg: '#a855f7', text: '#ffffff' },
  '🎵 音楽': { bg: '#ec4899', text: '#ffffff' },
  '🎬 映画': { bg: '#f472b6', text: '#ffffff' },
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
        className="flex min-h-[280px] flex-1 flex-col items-center justify-center rounded-xl border p-4"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
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
          <span
            className="text-[0.6rem] font-bold tracking-widest"
            style={{ color: 'inherit' }}
          >
            {label}
          </span>
        </div>

        {/* Rank badge overlapping image top */}
        <div className="relative mb-[-14px] z-10">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24)',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
            }}
          >
            <span
              className="text-[0.8rem] font-extrabold leading-none"
              style={{ color: '#78350f' }}
            >
              #1
            </span>
          </div>
        </div>

        <SafeImage
          src={work.thumbnailUrl}
          alt={work.title}
          fallbackSrc={DEFAULT_PLACEHOLDER}
          className="mb-3 h-44 w-32 rounded-lg object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
        />
        <p className="text-center text-[0.85rem] font-semibold leading-tight">
          {work.title}
        </p>
        <span
          className="mt-1 text-center text-[0.7rem]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {work.subtitle}
        </span>
        {work.externalUrl && (
          <a
            href={work.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-xs transition-colors hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            チェックする 👀
          </a>
        )}
      </div>
    </div>
  )
}

export default WorkCard
