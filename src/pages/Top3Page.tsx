import { useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { parseTop3Params, buildEditUrl } from '../utils/url-params'
import ErrorMessage from '../components/ErrorMessage'
import ShareButtons from '../components/ShareButtons'
import Top3Image from '../components/Top3Image'
import WorkCard from '../components/WorkCard'
import { useWorkFetch } from '../hooks/useWorkFetch'

function Top3Page() {
  const [searchParams] = useSearchParams()
  const params = parseTop3Params(searchParams)
  const captureRef = useRef<HTMLDivElement>(null)

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
          'linear-gradient(180deg, var(--color-bg) 0%, #f0fdf4 50%, #ecfdf5 100%)',
      }}
    >
      <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
        {/* Header with decorative line */}
        <div className="text-center">
          <div
            className="mx-auto mb-2 h-0.5 w-16 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
            }}
          />
          <h1
            className="text-xl font-extrabold sm:text-2xl"
            style={{
              fontFamily: 'var(--font-display)',
              background:
                'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            My No.1s
          </h1>
          <div
            className="mx-auto mt-2 h-0.5 w-16 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
            }}
          />
        </div>

        {/* Theme display with decorative quotes via CSS pseudo-elements */}
        {params.theme && (
          <div className="mt-3 text-center">
            <Typography
              variant="h6"
              sx={{
                color: 'var(--color-text-primary)',
                display: 'inline-block',
                px: 3,
                position: 'relative',
                '&::before': {
                  content: '"\\201C"',
                  position: 'absolute',
                  left: -4,
                  top: -8,
                  fontSize: '2.5rem',
                  color: 'var(--color-primary)',
                  opacity: 0.3,
                  fontFamily: 'Georgia, serif',
                  lineHeight: 1,
                },
                '&::after': {
                  content: '"\\201D"',
                  position: 'absolute',
                  right: -4,
                  bottom: -12,
                  fontSize: '2.5rem',
                  color: 'var(--color-primary)',
                  opacity: 0.3,
                  fontFamily: 'Georgia, serif',
                  lineHeight: 1,
                },
              }}
            >
              {params.theme}
            </Typography>
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
              captureRef={captureRef}
            />
          </div>
        )}

        <div className="mt-6">
          <ShareButtons
            theme={params.theme}
            captureRef={showImage ? captureRef : undefined}
          />
        </div>

        <div className="mt-8 text-center">
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
        </div>
      </div>
    </div>
  )
}

export default Top3Page
