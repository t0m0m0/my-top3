import { useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import { buildEditUrl } from '../utils/url-params'
import ErrorMessage from './ErrorMessage'
import ShareButtons from './ShareButtons'
import Top3Image from './Top3Image'
import WorkCard from './WorkCard'
import { useWorkFetch } from '../hooks/useWorkFetch'
import { usePreGeneratedImage } from '../hooks/usePreGeneratedImage'
import DataCredits from './DataCredits'
import PageHeader from './PageHeader'

type Top3Params = {
  theme: string
  bookId: string
  musicId: string
  movieId: string
}

type Props = {
  params: Top3Params
  existingShareId?: string
}

export default function Top3Content({ params, existingShareId }: Props) {
  const captureRef = useRef<HTMLDivElement>(null)
  const [captureElement, setCaptureElement] = useState<HTMLDivElement | null>(
    null,
  )
  const captureRefCallback = useCallback((node: HTMLDivElement | null) => {
    ;(captureRef as React.MutableRefObject<HTMLDivElement | null>).current =
      node
    setCaptureElement(node)
  }, [])

  const book = useWorkFetch('book', params.bookId)
  const music = useWorkFetch('music', params.musicId)
  const movie = useWorkFetch('movie', params.movieId)

  const hasAnyId = params.bookId || params.musicId || params.movieId
  const allLoaded = !book.loading && !music.loading && !movie.loading
  const noErrors = !book.error && !music.error && !movie.error
  const hasAnyData = !!(book.data || music.data || movie.data)
  const showImage = allLoaded && noErrors && hasAnyData

  const preGeneratedBlob = usePreGeneratedImage(
    showImage ? captureElement : null,
  )

  if (!hasAnyId) {
    return (
      <div
        className="min-h-screen"
        style={{
          background:
            'linear-gradient(180deg, var(--color-bg) 0%, #eef2ff 100%)',
        }}
      >
        <div className="mx-auto max-w-4xl px-3 py-4 text-center sm:px-4 sm:py-6 lg:py-8">
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
          'linear-gradient(180deg, var(--color-bg) 0%, #eef2ff 50%, #e0e7ff 100%)',
      }}
    >
      <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
        <PageHeader title="My No.1s" />

        {/* Theme display with decorative quotes via CSS pseudo-elements */}
        {params.theme && (
          <div className="mt-3 text-center">
            <h2
              className="theme-quote text-xl font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {params.theme}
            </h2>
          </div>
        )}

        <div className="mt-4 flex flex-col items-stretch gap-4 sm:mt-6 sm:flex-row">
          <div className="animate-fade-in-up flex-1">
            <WorkCard
              work={book.data}
              loading={book.loading}
              error={book.error}
              label="BOOK"
              onRetry={book.error ? book.retry : undefined}
            />
          </div>
          <div className="animate-fade-in-up animate-delay-100 flex-1">
            <WorkCard
              work={music.data}
              loading={music.loading}
              error={music.error}
              label="MUSIC"
              onRetry={music.error ? music.retry : undefined}
            />
          </div>
          <div className="animate-fade-in-up animate-delay-200 flex-1">
            <WorkCard
              work={movie.data}
              loading={movie.loading}
              error={movie.error}
              label="MOVIE"
              onRetry={movie.error ? movie.retry : undefined}
            />
          </div>
        </div>

        {showImage && (
          <div className="mt-8">
            <Top3Image
              theme={params.theme}
              book={book.data}
              music={music.data}
              movie={movie.data}
              captureRef={captureRefCallback}
            />
          </div>
        )}

        <div className="mt-6">
          <ShareButtons
            theme={params.theme}
            captureRef={showImage ? captureRef : undefined}
            preGeneratedBlob={preGeneratedBlob}
            shareParams={{
              ...params,
              bookThumb: book.data?.thumbnailUrl ?? '',
              musicThumb: music.data?.thumbnailUrl ?? '',
              movieThumb: movie.data?.thumbnailUrl ?? '',
            }}
            existingShareId={existingShareId}
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            component={Link}
            to={buildEditUrl(params)}
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
          <Button
            component={Link}
            to="/gallery"
            variant="outlined"
            sx={{
              borderRadius: '9999px',
              px: 4,
              py: 1,
              borderColor: 'var(--color-secondary)',
              color: 'var(--color-secondary)',
              fontWeight: 600,
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'var(--color-secondary-dark)',
                backgroundColor: 'var(--color-secondary)',
                color: '#fff',
              },
            }}
          >
            🎨 みんなのNo.1s
          </Button>
        </div>
      </div>

      <DataCredits />
    </div>
  )
}
