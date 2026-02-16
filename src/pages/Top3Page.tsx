import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { parseTop3Params } from '../utils/url-params'
import ErrorMessage from '../components/ErrorMessage'
import ShareButtons from '../components/ShareButtons'
import Top3Image from '../components/Top3Image'
import type { MediaCategory, SearchResultItem } from '../types/common'

const DEFAULT_THUMBNAIL =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="128" fill="%23e5e7eb"><rect width="96" height="128"/><text x="48" y="68" text-anchor="middle" fill="%239ca3af" font-size="12">No Image</text></svg>'

type WorkState = {
  data: SearchResultItem | null
  loading: boolean
  error: string | null
}

const CATEGORY_LABELS: Record<MediaCategory, string> = {
  book: '書籍',
  music: '音楽',
  movie: '映画',
}

async function fetchWork(
  category: MediaCategory,
  id: string,
): Promise<SearchResultItem> {
  const endpoints: Record<MediaCategory, string> = {
    book: `/api/books/${id}`,
    music: `/api/music/${id}`,
    movie: `/api/movies/${id}`,
  }

  const response = await fetch(endpoints[category])
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        `${CATEGORY_LABELS[category]}が見つかりませんでした (ID: ${id})`,
      )
    }
    if (response.status === 429) {
      throw new Error('しばらく時間をおいて再度お試しください')
    }
    throw new Error(`${CATEGORY_LABELS[category]}の取得に失敗しました`)
  }

  const result = await response.json()

  // API returns Result type: { ok: true, data: ... } or { ok: false, error: ... }
  if (!result.ok) {
    throw new Error(
      result.error?.message ??
        `${CATEGORY_LABELS[category]}の取得に失敗しました`,
    )
  }

  return result.data
}

function useWorkFetch(category: MediaCategory, id: string) {
  const [state, setState] = useState<WorkState>(() => ({
    data: null,
    loading: !!id,
    error: null,
  }))
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetchWork(category, id)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(
            `[Top3Page] Failed to fetch ${category} (id: ${id}):`,
            err,
          )
          setState({
            data: null,
            loading: false,
            error:
              err instanceof Error
                ? err.message
                : `${CATEGORY_LABELS[category]}の取得に失敗しました`,
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [category, id, retryCount])

  const retry = useCallback(() => {
    setState({ data: null, loading: true, error: null })
    setRetryCount((c) => c + 1)
  }, [])

  return { ...state, retry }
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
        className="flex flex-1 flex-col items-center rounded-xl border p-4"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <Skeleton variant="rounded" width={56} height={20} sx={{ mb: 0.5 }} />
        <Skeleton variant="rounded" width={32} height={18} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" width={96} height={128} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={100} height={18} />
        <Skeleton variant="text" width={72} height={14} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-4">
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
        className="flex flex-1 flex-col items-center justify-center rounded-xl border p-4"
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

  return (
    <div
      className="group relative flex flex-1 flex-col items-center rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        background: 'var(--color-surface)',
        border: '2px solid transparent',
        backgroundClip: 'padding-box',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Gradient border via pseudo-element effect with outline */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          border: '2px solid var(--color-border)',
          borderImage: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary)) 1',
          borderRadius: 'inherit',
          mask: 'linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0)',
        }}
      />

      <div
        className="mb-1.5 rounded-md px-3 py-1"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
        }}
      >
        <Typography
          variant="caption"
          className="font-bold uppercase tracking-wider text-white"
          sx={{ fontSize: '0.65rem', color: 'white', letterSpacing: '0.1em' }}
        >
          {label}
        </Typography>
      </div>

      {/* Rank badge - gold and prominent */}
      <div
        className="mb-2 flex items-center justify-center rounded-full"
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

      <img
        src={work.thumbnailUrl}
        alt={work.title}
        className="mb-3 h-32 w-24 rounded-lg object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
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
        sx={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', mt: 0.25 }}
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
  )
}

function Top3Page() {
  const [searchParams] = useSearchParams()
  const params = parseTop3Params(searchParams)

  const book = useWorkFetch('book', params.bookId)
  const music = useWorkFetch('music', params.musicId)
  const movie = useWorkFetch('movie', params.movieId)

  const hasAnyId = params.bookId || params.musicId || params.movieId
  const allLoaded = !book.loading && !music.loading && !movie.loading
  const noErrors = !book.error && !music.error && !movie.error
  const hasAnyData = !!(book.data || music.data || movie.data)
  const showImage = allLoaded && noErrors && hasAnyData

  if (!hasAnyId) {
    return (
      <div
        className="min-h-screen"
        style={{
          background:
            'linear-gradient(180deg, var(--color-bg) 0%, #ecfdf5 100%)',
        }}
      >
        <div className="mx-auto max-w-3xl px-3 py-4 text-center sm:px-4 sm:py-6 lg:py-8">
          <ErrorMessage message="作品が選択されていません。トップページから3作品を選んでください。">
            <Button component={Link} to="/" variant="outlined" size="small">
              Top3を作成する
            </Button>
          </ErrorMessage>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, var(--color-bg) 0%, #f0fdf4 50%, #ecfdf5 100%)',
      }}
    >
      <div className="mx-auto max-w-3xl px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
        {/* Header with decorative line */}
        <div className="text-center">
          <div
            className="mx-auto mb-2 h-0.5 w-16 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
            }}
          />
          <h1
            className="text-xl font-extrabold sm:text-2xl"
            style={{
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            My Top 3
          </h1>
          <div
            className="mx-auto mt-2 h-0.5 w-16 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
            }}
          />
        </div>

        {/* Theme display with decorative quotes */}
        {params.theme && (
          <div className="mt-3 text-center">
            <Typography
              variant="h6"
              sx={{
                color: 'var(--color-text-primary)',
                position: 'relative',
                display: 'inline-block',
                px: 2,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: -8,
                  top: -4,
                  fontSize: '2rem',
                  color: 'var(--color-primary)',
                  opacity: 0.3,
                  fontFamily: 'Georgia, serif',
                  lineHeight: 1,
                }}
              >
                “
              </span>
              {params.theme}
              <span
                style={{
                  position: 'absolute',
                  right: -8,
                  bottom: -8,
                  fontSize: '2rem',
                  color: 'var(--color-primary)',
                  opacity: 0.3,
                  fontFamily: 'Georgia, serif',
                  lineHeight: 1,
                }}
              >
                ”
              </span>
            </Typography>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-4 sm:mt-6 sm:flex-row">
          <WorkCard
            work={book.data}
            loading={book.loading}
            error={book.error}
            label="BOOK"
            onRetry={book.error ? book.retry : undefined}
          />
          <WorkCard
            work={music.data}
            loading={music.loading}
            error={music.error}
            label="MUSIC"
            onRetry={music.error ? music.retry : undefined}
          />
          <WorkCard
            work={movie.data}
            loading={movie.loading}
            error={movie.error}
            label="MOVIE"
            onRetry={movie.error ? movie.retry : undefined}
          />
        </div>

        {showImage && (
          <div className="mt-8">
            <Top3Image
              theme={params.theme}
              book={book.data}
              music={music.data}
              movie={movie.data}
            />
          </div>
        )}

        <div className="mt-6">
          <ShareButtons theme={params.theme} />
        </div>

        <div className="mt-8 text-center">
          <Button
            component={Link}
            to="/"
            variant="outlined"
            sx={{
              borderRadius: '9999px',
              px: 4,
              py: 1,
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
              fontWeight: 600,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'var(--color-primary-dark)',
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
              },
            }}
          >
            ← トップページに戻る
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Top3Page
