import { Link } from 'react-router-dom'
import { useWorkFetch } from '../hooks/useWorkFetch'
import Skeleton from '@mui/material/Skeleton'

const PLACEHOLDER =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%23e5e7eb"><rect width="80" height="80"/></svg>'

type Props = {
  id: string
  theme: string
  bookId: string
  musicId: string
  movieId: string
  createdAt: number
}

function Thumbnail({
  category,
  workId,
}: {
  category: 'book' | 'music' | 'movie'
  workId: string
}) {
  const { data, loading } = useWorkFetch(category, workId)

  if (!workId) return null

  if (loading) {
    return <Skeleton variant="rounded" width={72} height={72} />
  }

  return (
    <img
      src={data?.thumbnailUrl ?? PLACEHOLDER}
      alt={data?.title ?? ''}
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
  bookId,
  musicId,
  movieId,
  createdAt,
}: Props) {
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
        <div className="flex gap-2">
          <Thumbnail category="book" workId={bookId} />
          <Thumbnail category="music" workId={musicId} />
          <Thumbnail category="movie" workId={movieId} />
        </div>

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
