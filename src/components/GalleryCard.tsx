import { Link, useNavigate } from 'react-router-dom'
import { useReaction } from '../hooks/useReaction'

const PLACEHOLDER =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%23e8e0d8"><rect width="80" height="80"/></svg>'

/** Deterministic gradient class based on string hash */
const GRADIENTS = [
  'grad-warm',
  'grad-cool',
  'grad-sky',
  'grad-sunset',
  'grad-forest',
  'grad-night',
  'grad-sakura',
  'grad-ocean',
  'grad-autumn',
  'grad-pastel',
  'grad-starry',
] as const

function hashToGradient(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return GRADIENTS[Math.abs(h) % GRADIENTS.length]
}

/** Varying image heights for masonry look */
const HEIGHT_CLASSES = ['h-28', 'h-32', 'h-36', 'h-40'] as const
function hashToHeight(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 37 + s.charCodeAt(i)) | 0
  return HEIGHT_CLASSES[Math.abs(h) % HEIGHT_CLASSES.length]
}

type Props = {
  id: string
  theme: string
  bookThumb: string
  musicThumb: string
  movieThumb: string
  createdAt: number
  reactionCount: number
  tags?: string[]
}

export default function GalleryCard({
  id,
  theme,
  bookThumb,
  musicThumb,
  movieThumb,
  reactionCount: initialReactionCount,
  tags = [],
}: Props) {
  const navigate = useNavigate()
  const hasThumbs = bookThumb || musicThumb || movieThumb
  const { count, reacted, toggleReaction } = useReaction(
    id,
    initialReactionCount,
  )
  const gradClass = hashToGradient(id)
  const heightClass = hashToHeight(id)

  const handleReaction = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleReaction()
  }

  return (
    <Link
      to={`/s/${id}`}
      className="masonry-item block overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow:
          '0 3px 14px rgba(80,60,40,0.07), 0 1px 3px rgba(80,60,40,0.05)',
      }}
    >
      {/* Hero gradient area */}
      <div
        className={`${gradClass} ${heightClass} relative flex items-center justify-center`}
      >
        {hasThumbs ? (
          <div className="flex w-full items-end justify-center gap-1.5 p-3">
            {bookThumb && (
              <img
                src={bookThumb}
                alt="Book"
                className="h-16 w-12 rounded-md object-cover shadow-md"
                loading="lazy"
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER
                }}
              />
            )}
            {musicThumb && (
              <img
                src={musicThumb}
                alt="Music"
                className="h-16 w-12 rounded-md object-cover shadow-md"
                loading="lazy"
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER
                }}
              />
            )}
            {movieThumb && (
              <img
                src={movieThumb}
                alt="Movie"
                className="h-16 w-12 rounded-md object-cover shadow-md"
                loading="lazy"
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  if (img.src !== PLACEHOLDER) img.src = PLACEHOLDER
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex w-full items-center justify-center">
            <span className="text-3xl opacity-60">📌</span>
          </div>
        )}
      </div>

      {/* Body — screen-3 style */}
      <div className="px-3 pb-3 pt-2.5">
        <h3
          className="mb-2 line-clamp-2 text-sm font-bold leading-snug"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
        >
          {theme || 'No Theme'}
        </h3>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  navigate(`/gallery?tag=${encodeURIComponent(tag)}`)
                }}
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'var(--color-primary-a8)',
                  color: 'var(--color-primary-dark)',
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Reaction */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleReaction}
            aria-label="いいね"
            className="flex items-center gap-1 text-xs transition-colors duration-150"
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
              {reacted ? '❤️' : '🤍'}
            </span>
            <span>{count}</span>
          </button>
        </div>
      </div>
    </Link>
  )
}
