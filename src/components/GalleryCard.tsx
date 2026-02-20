import { Link } from 'react-router-dom'

const PLACEHOLDER =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%23e5e7eb"><rect width="80" height="80"/></svg>'

type Props = {
  id: string
  theme: string
  bookThumb: string
  musicThumb: string
  movieThumb: string
  createdAt: number
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
}: Props) {
  const hasThumbs = bookThumb || musicThumb || movieThumb

  return (
    <Link
      to={`/s/${id}`}
      className="group block rounded-xl p-[2px] transition-transform duration-200 hover:-translate-y-1"
      style={{
        background:
          'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
      }}
    >
      <div
        className="flex flex-col rounded-[10px] p-4"
        style={{
          background: 'var(--color-surface)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Theme */}
        <h3
          className="mb-3 truncate text-sm font-bold"
          style={{ color: 'var(--color-text-primary)' }}
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

        {/* Date */}
        <p
          className="mt-3 text-xs"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {formatDate(createdAt)}
        </p>
      </div>
    </Link>
  )
}
