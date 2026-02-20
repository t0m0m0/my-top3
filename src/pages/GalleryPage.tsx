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
    <div
      className="min-h-screen"
      style={{
        background:
          'linear-gradient(180deg, var(--color-bg) 0%, #eef2ff 50%, #e0e7ff 100%)',
      }}
    >
      <div className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
        {/* Header */}
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
            みんなのNo.1s
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            みんなが選んだお気に入りの作品たち
          </p>
          <div
            className="mx-auto mt-2 h-0.5 w-16 rounded-full"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
            }}
          />
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
                Top3を作成する
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
              まだ作品がありません
            </p>
            <Button
              component={Link}
              to="/"
              variant="outlined"
              size="small"
              className="mt-4"
              sx={{ mt: 2 }}
            >
              Top3を作成する
            </Button>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && !error && items.length > 0 && (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  全件表示しました
                </p>
              </div>
            )}
          </>
        )}

        {/* Navigation */}
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
            ← Top3を作成する
          </Button>
        </div>
      </div>

      <DataCredits />
    </div>
  )
}
