import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { parseTop3Params } from '../utils/url-params'
import type { SearchResultItem } from '../types/common'

type WorkState = {
  data: SearchResultItem | null
  loading: boolean
  error: string | null
}

async function fetchWork(
  category: 'book' | 'music' | 'movie',
  id: string,
): Promise<SearchResultItem> {
  const endpoints: Record<string, string> = {
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

function useWorkFetch(
  category: 'book' | 'music' | 'movie',
  id: string,
): WorkState {
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
        if (!cancelled)
          setState({
            data: null,
            loading: false,
            error: (err as Error).message,
          })
      })
    return () => {
      cancelled = true
    }
  }, [category, id])

  return state
}

function WorkCard({
  work,
  loading,
  error,
  label,
}: {
  work: SearchResultItem | null
  loading: boolean
  error: string | null
  label: string
}) {
  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4">
        <CircularProgress size={32} />
        <Typography variant="caption" className="mt-2 text-gray-400">
          {label}
        </Typography>
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
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4">
        <Typography variant="caption" className="text-gray-400">
          {label} - データなし
        </Typography>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-1 rounded bg-gray-800 px-2 py-0.5">
        <Typography
          variant="caption"
          className="font-bold uppercase text-white"
          sx={{ fontSize: '0.6rem', color: 'white' }}
        >
          {label}
        </Typography>
      </div>
      <div className="mb-1 rounded bg-yellow-400 px-2 py-0.5">
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
        className="text-center text-gray-500"
        sx={{ fontSize: '0.7rem' }}
      >
        {work.subtitle}
      </Typography>
      {work.externalUrl && (
        <a
          href={work.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-xs text-blue-500 hover:underline"
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

  if (!hasAnyId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center">
          <Typography variant="h5" className="text-gray-900">
            Top3を作成してください
          </Typography>
          <Typography variant="body2" className="mt-2 text-gray-600">
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">My Top 3</h1>

        {params.theme && (
          <Typography variant="h6" className="mt-2 text-center text-gray-700">
            「{params.theme}」
          </Typography>
        )}

        <div className="mt-6 flex gap-3">
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
