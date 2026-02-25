import { Link } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import ErrorMessage from '../components/ErrorMessage'
import GalleryCard from '../components/GalleryCard'
import DataCredits from '../components/DataCredits'
import { useGallery } from '../hooks/useGallery'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'

export default function GalleryPage() {
  const { items, loading, loadingMore, error, hasMore, loadMore } = useGallery()
  const sentinelRef = useIntersectionObserver(loadMore)

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <div className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 text-center sm:mb-8">
          <h1
            className="brand-gradient-text mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            さがす
          </h1>
          <p
            className="mx-auto mb-5 max-w-md text-sm sm:text-base"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            みんなが作ったコレクションボード
          </p>

          {/* Navigation pill */}
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
            style={{
              color: 'var(--color-primary-dark)',
              border:
                '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)',
              backgroundColor:
                'color-mix(in srgb, var(--color-bg) 60%, transparent)',
            }}
          >
            ✨ ボードをつくる
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-12 flex justify-center">
            <CircularProgress />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mt-8 text-center">
            <ErrorMessage message={error}>
              <Button component={Link} to="/" variant="outlined" size="small">
                作品を選ぶ ✨
              </Button>
            </ErrorMessage>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && items.length === 0 && (
          <div className="mt-12 text-center">
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              まだ投稿がないよ
            </p>
            <Button
              component={Link}
              to="/"
              variant="outlined"
              size="small"
              sx={{ mt: 2 }}
            >
              作品を選ぶ ✨
            </Button>
          </div>
        )}

        {/* Masonry Gallery */}
        {!loading && !error && items.length > 0 && (
          <>
            <div className="masonry-grid">
              {items.map((item) => (
                <GalleryCard key={item.id} {...item} />
              ))}
            </div>

            {loadingMore && (
              <div className="flex justify-center py-6">
                <CircularProgress size={32} />
              </div>
            )}

            {!loadingMore && hasMore && (
              <div
                ref={sentinelRef}
                data-testid="gallery-sentinel"
                className="h-4"
                aria-hidden="true"
              />
            )}

            {!loadingMore && !hasMore && items.length > 0 && (
              <div className="py-4 text-center">
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ぜんぶ見たよ！
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <DataCredits />
    </div>
  )
}
