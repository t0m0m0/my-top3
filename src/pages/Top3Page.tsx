import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { parseTop3Params } from '../utils/url-params'
import ShareButtons from '../components/ShareButtons'
import Top3Image from '../components/Top3Image'
import type { MediaCategory, SearchResultItem } from '../types/common'

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
    throw new Error(`Failed to fetch ${category}: ${response.statusText}`)
  }

  const result = await response.json()

  // API returns Result type: { ok: true, data: ... } or { ok: false, error: ... }
  if (!result.ok) {
    throw new Error(result.error?.message ?? `Failed to fetch ${category} data`)
  }

  return result.data
}

function useWorkFetch(category: MediaCategory, id: string): WorkState {
  const [state, setState] = useState<WorkState>(() => ({
    data: null,
    loading: !!id,
    error: null,
  }))

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
            error: `${CATEGORY_LABELS[category]}の取得に失敗しました`,
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [category, id])

  return state
}

type WorkCardProps = {
  work: SearchResultItem | null
  loading: boolean
  error: string | null
  label: string
}

function WorkCard({ work, loading, error, label }: WorkCardProps) {
  if (loading) {
    return (
      <div
        className="flex flex-1 flex-col items-center rounded-lg border p-4"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <Skeleton
          variant="rounded"
          width={56}
          height={20}
          sx={{ mb: 0.5 }}
        />
        <Skeleton
          variant="rounded"
          width={32}
          height={18}
          sx={{ mb: 1 }}
        />
        <Skeleton
          variant="rounded"
          width={96}
          height={128}
          sx={{ mb: 1 }}
        />
        <Skeleton variant="text" width={100} height={18} />
        <Skeleton variant="text" width={72} height={14} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4">
        <Typography variant="caption" className="text-red-500">
          {error}
        </Typography>
      </div>
    )
  }

  if (!work) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center rounded-lg border p-4"
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
      className="flex flex-1 flex-col items-center rounded-lg border p-4"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <div
        className="mb-1 rounded px-2 py-0.5"
        style={{ backgroundColor: 'var(--color-primary-dark)' }}
      >
        <Typography
          variant="caption"
          className="font-bold uppercase text-white"
          sx={{ fontSize: '0.6rem', color: 'white' }}
        >
          {label}
        </Typography>
      </div>
      <div
        className="mb-1 rounded px-2 py-0.5"
        style={{ backgroundColor: 'var(--color-secondary-light)' }}
      >
        <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
          #1
        </Typography>
      </div>
      <img
        src={work.thumbnailUrl}
        alt={work.title}
        className="mb-2 h-32 w-24 rounded object-cover"
        onError={(e) => {
          ;(e.target as HTMLImageElement).src = ''
          ;(e.target as HTMLImageElement).alt = 'No Image'
        }}
      />
      <Typography
        variant="body2"
        className="text-center font-medium"
        sx={{ fontSize: '0.8rem', lineHeight: 1.3 }}
      >
        {work.title}
      </Typography>
      <Typography
        variant="caption"
        className="text-center"
        sx={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}
      >
        {work.subtitle}
      </Typography>
      {work.externalUrl && (
        <a
          href={work.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-xs hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          詳細を見る
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
          <Typography variant="h5" sx={{ color: 'var(--color-text-primary)' }}>
            Top3を作成してください
          </Typography>
          <Typography
            variant="body2"
            className="mt-2"
            sx={{ color: 'var(--color-text-secondary)' }}
          >
            作品が選択されていません。トップページから3作品を選んでください。
          </Typography>
          <div className="mt-4">
            <Button component={Link} to="/" variant="outlined">
              トップページに戻る
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, var(--color-bg) 0%, #ecfdf5 100%)',
      }}
    >
      <div className="mx-auto max-w-3xl px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
        <h1
          className="text-xl font-extrabold sm:text-2xl"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-primary-dark)',
          }}
        >
          My Top 3
        </h1>

        {params.theme && (
          <Typography
            variant="h6"
            className="mt-2 text-center"
            sx={{ color: 'var(--color-text-primary)' }}
          >
            「{params.theme}」
          </Typography>
        )}

        <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row">
          <WorkCard
            work={book.data}
            loading={book.loading}
            error={book.error}
            label="BOOK"
          />
          <WorkCard
            work={music.data}
            loading={music.loading}
            error={music.error}
            label="MUSIC"
          />
          <WorkCard
            work={movie.data}
            loading={movie.loading}
            error={movie.error}
            label="MOVIE"
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

        <div className="mt-6 text-center">
          <Button component={Link} to="/" variant="outlined">
            トップページに戻る
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Top3Page
