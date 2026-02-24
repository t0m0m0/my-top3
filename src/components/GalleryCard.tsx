import { Link } from 'react-router-dom'
import { useReaction } from '../hooks/useReaction'

const PLACEHOLDER =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%23e8e0d8"><rect width="80" height="80"/></svg>'

type Props = {
  id: string
  theme: string
  bookThumb: string
  musicThumb: string
  movieThumb: string
  createdAt: number
  reactionCount: number
}

function Thumbnail({ src, alt }: { src: string; alt: string }) {
  if (!src) return null
  return (
    <img
      src={src}
      alt={alt}
      className="h-18 w-18 rounded-md object-cover shadow-sm"
      loading="lazy"
      onError={(e) => {
        const img = e.target as HTMLImageElement
        if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER
      }}
    />
  )
}

function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function GalleryCard({
  id,
  theme,
  bookThumb,
  musicThumb,
  movieThumb,
  createdAt,
  reactionCount: initialReactionCount,
}: Props) {
  const hasThumbs = bookThumb || musicThumb || movieThumb
  const { count, reacted, toggleReaction } = useReaction(
    id,
    initialReactionCount,
  )

  const handleReaction = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleReaction()
  }

  return (
    <Link
      to={`/s/${id}`}
      className="group block transition-all duration-200 hover:-translate-y-1"
      style={{
        borderRadius: 20,
        border: '1.5px solid var(--color-border)',
        boxShadow: '0 2px 12px rgba(62, 42, 20, 0.06)',
      }}
    >
      <div
        className="flex flex-col p-4"
        style={{
          borderRadius: 18,
          background: 'var(--color-surface)',
        }}
      >
        {/* Theme */}
        <h3
          className="mb-3 truncate text-sm font-bold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
        >
          {theme || 'No Theme'}
        </h3>

        {/* Thumbnails */}
        {hasThumbs ? (
          <div className="flex gap-2">
            <Thumbnail src={bookThumb} alt="Book" />
            <Thumbnail src={musicThumb} alt="Music" />
            <Thumbnail src={movieThumb} alt="Movie" />
          </div>
        ) : (
          <div
            className="flex h-18 items-center justify-center rounded-md"
            style={{ backgroundColor: 'var(--color-bg)' }}
          >
            <span
              className="text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              タップして見る
            </span>
          </div>
        )}

        {/* Footer: Date + Reaction */}
        <div className="mt-3 flex items-center justify-between">
          <p
            className="text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {formatDate(createdAt)}
          </p>

          <button
            type="button"
            onClick={handleReaction}
            aria-label="いいね"
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors duration-150"
            style={{
              color: reacted
                ? 'var(--color-primary)'
                : 'var(--color-text-secondary)',
            }}
          >
            <span
              className="transition-transform duration-150"
              style={{ transform: reacted ? 'scale(1.2)' : 'scale(1)' }}
            >
              {reacted ? '❤️' : '🩵'}
            </span>
            <span>{count}</span>
          </button>
        </div>
      </div>
    </Link>
  )
}
