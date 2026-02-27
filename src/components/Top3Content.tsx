import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import useMediaQuery from '@mui/material/useMediaQuery'
import { buildEditUrl } from '../utils/url-params'
import PillLinkButton from './PillLinkButton'
import ErrorMessage from './ErrorMessage'
import ShareButtons from './ShareButtons'
import Top3Image from './Top3Image'
import WorkCard from './WorkCard'
import MobileCarousel from './MobileCarousel'
import { useWorkFetch } from '../hooks/useWorkFetch'
import { usePreGeneratedImage } from '../hooks/usePreGeneratedImage'
import { useMergedRef } from '../hooks/useMergedRef'
import { useReaction } from '../hooks/useReaction'
import DataCredits from './DataCredits'
import ReactionButton from './ReactionButton'
import TagList from './TagList'

type Top3Params = {
  theme: string
  bookId: string
  musicId: string
  movieId: string
  tags?: string[]
}

type Props = {
  params: Top3Params
  existingShareId?: string
  readOnly?: boolean
  reactionCount?: number
}

/** Decorative washi tape above a work card */
function WashiTape({
  color,
  rotate,
  left,
}: {
  color: string
  rotate: string
  left: string
}) {
  return (
    <div
      className="washi-tape"
      style={{
        width: 60,
        background: color,
        transform: `rotate(${rotate})`,
        top: -10,
        left,
      }}
    />
  )
}

export default function Top3Content({
  params,
  existingShareId,
  readOnly,
  reactionCount: initialReactionCount = 0,
}: Props) {
  const isMobile = useMediaQuery('(max-width:639px)')
  const reaction = useReaction(existingShareId ?? '', initialReactionCount)
  const showReaction = !!existingShareId
  const captureRef = useRef<HTMLDivElement>(null)
  const [captureElement, setCaptureElement] = useState<HTMLDivElement | null>(
    null,
  )
  const captureRefCallback = useMergedRef(captureRef, setCaptureElement)

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
            'linear-gradient(180deg, var(--color-bg) 0%, #f5f0ea 100%)',
        }}
      >
        <div className="mx-auto max-w-4xl px-3 py-4 text-center sm:px-4 sm:py-6 lg:py-8">
          <ErrorMessage message="作品が選択されていません。トップページから3作品を選んでください。">
            <Button component={Link} to="/" variant="outlined" size="small">
              作品を選ぶ ✨
            </Button>
          </ErrorMessage>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
        {/* Header — screen-2 style */}
        <div className="mb-4">
          <Link
            to="/gallery"
            className="mb-3 inline-flex items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: '#a855f7' }}
          >
            ← ボード一覧
          </Link>
          <h1
            className="text-[30px] font-bold leading-snug"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text-primary)',
            }}
          >
            {params.theme || 'マイコレクション'}
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            3作品
          </p>
          {params.tags && params.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <TagList tags={params.tags} />
            </div>
          )}
          {showReaction && (
            <div className="mt-3">
              <ReactionButton
                count={reaction.count}
                reacted={reaction.reacted}
                onToggle={reaction.toggleReaction}
              />
            </div>
          )}
        </div>

        {/* Cork board area */}
        <div className="cork-bg relative mt-6 rounded-3xl p-5 sm:p-8">
          {/* Decorative pushpins */}
          <div
            className="pushpin pushpin-red"
            style={{ top: 12, left: '48%' }}
            aria-hidden="true"
          />
          <div
            className="pushpin pushpin-blue"
            style={{ top: 20, right: 40 }}
            aria-hidden="true"
          />
          <div
            className="pushpin pushpin-yellow"
            style={{ bottom: 20, left: 60 }}
            aria-hidden="true"
          />

          {/* Work cards */}
          {isMobile ? (
            <MobileCarousel>
              {[
                <div
                  key="book"
                  className="animate-fade-in-up relative"
                  style={{ transform: 'rotate(-2deg)' }}
                >
                  <WashiTape
                    color="linear-gradient(90deg, #fbcfe8, #fce7f3)"
                    rotate="2deg"
                    left="30%"
                  />
                  <WorkCard
                    work={book.data}
                    loading={book.loading}
                    error={book.error}
                    label="📚 本"
                    onRetry={book.error ? book.retry : undefined}
                  />
                </div>,
                <div
                  key="music"
                  className="animate-fade-in-up relative"
                  style={{ transform: 'rotate(1.5deg)' }}
                >
                  <WashiTape
                    color="linear-gradient(90deg, #ddd6fe, #ede9fe)"
                    rotate="-3deg"
                    left="25%"
                  />
                  <WorkCard
                    work={music.data}
                    loading={music.loading}
                    error={music.error}
                    label="🎵 音楽"
                    onRetry={music.error ? music.retry : undefined}
                  />
                </div>,
                <div
                  key="movie"
                  className="animate-fade-in-up relative"
                  style={{ transform: 'rotate(-0.8deg)' }}
                >
                  <WashiTape
                    color="linear-gradient(90deg, #bfdbfe, #dbeafe)"
                    rotate="1deg"
                    left="35%"
                  />
                  <WorkCard
                    work={movie.data}
                    loading={movie.loading}
                    error={movie.error}
                    label="🎬 映画"
                    onRetry={movie.error ? movie.retry : undefined}
                  />
                </div>,
              ]}
            </MobileCarousel>
          ) : (
            <div className="flex flex-row flex-wrap justify-center gap-6">
              <div
                className="animate-fade-in-up relative"
                style={{ transform: 'rotate(-2deg)' }}
              >
                <WashiTape
                  color="linear-gradient(90deg, #fbcfe8, #fce7f3)"
                  rotate="2deg"
                  left="30%"
                />
                <WorkCard
                  work={book.data}
                  loading={book.loading}
                  error={book.error}
                  label="📚 本"
                  onRetry={book.error ? book.retry : undefined}
                />
              </div>
              <div
                className="animate-fade-in-up animate-delay-100 relative"
                style={{ transform: 'rotate(1.5deg)', marginTop: 30 }}
              >
                <WashiTape
                  color="linear-gradient(90deg, #ddd6fe, #ede9fe)"
                  rotate="-3deg"
                  left="25%"
                />
                <WorkCard
                  work={music.data}
                  loading={music.loading}
                  error={music.error}
                  label="🎵 音楽"
                  onRetry={music.error ? music.retry : undefined}
                />
              </div>
              <div
                className="animate-fade-in-up animate-delay-200 relative"
                style={{ transform: 'rotate(-0.8deg)' }}
              >
                <WashiTape
                  color="linear-gradient(90deg, #bfdbfe, #dbeafe)"
                  rotate="1deg"
                  left="35%"
                />
                <WorkCard
                  work={movie.data}
                  loading={movie.loading}
                  error={movie.error}
                  label="🎬 映画"
                  onRetry={movie.error ? movie.retry : undefined}
                />
              </div>
            </div>
          )}
        </div>

        {showImage && (
          <div className="mt-8">
            <Top3Image
              theme={params.theme}
              book={book.data}
              music={music.data}
              movie={movie.data}
              captureRef={captureRefCallback}
              readOnly={readOnly}
            />
          </div>
        )}

        <div className="mt-6">
          <ShareButtons
            theme={params.theme}
            preGeneratedBlob={preGeneratedBlob}
            shareParams={{
              ...params,
              bookThumb: book.data?.thumbnailUrl ?? '',
              musicThumb: music.data?.thumbnailUrl ?? '',
              movieThumb: movie.data?.thumbnailUrl ?? '',
              tags: params.tags,
            }}
            existingShareId={existingShareId}
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {!readOnly && (
            <PillLinkButton to={buildEditUrl(params)}>← 戻る</PillLinkButton>
          )}
          <PillLinkButton
            to="/gallery"
            color={readOnly ? undefined : 'secondary'}
          >
            {readOnly ? '← みんなのボード' : '🔍 みんなのボード'}
          </PillLinkButton>
        </div>
      </div>

      <DataCredits />
    </div>
  )
}
