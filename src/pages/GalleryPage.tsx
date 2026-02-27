import { useState, useMemo, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import ErrorMessage from '../components/ErrorMessage'
import GalleryCard from '../components/GalleryCard'
import DataCredits from '../components/DataCredits'
import { useGallery } from '../hooks/useGallery'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'

export default function GalleryPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tagFilter = searchParams.get('tag') || undefined
  const { items, loading, loadingMore, error, hasMore, loadMore } =
    useGallery(tagFilter)
  const sentinelRef = useIntersectionObserver(loadMore)
  const [searchQuery, setSearchQuery] = useState('')

  const clearTagFilter = useCallback(() => {
    navigate('/gallery', { replace: true })
  }, [navigate])

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => item.theme.toLowerCase().includes(q))
  }, [items, searchQuery])

  return (
    <div
      className="min-h-screen bg-decorative-gradient"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-6 lg:py-8">
        {/* Header — screen-3 style */}
        <div className="mb-6 text-center sm:mb-8">
          <h1
            className="mb-4 text-[26px] font-bold"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text-primary)',
            }}
          >
            さがす 🔍
          </h1>

          {/* Search bar */}
          <div
            className="mx-auto mb-5 flex max-w-[700px] items-center gap-2.5 rounded-[18px] bg-white px-5 py-3.5"
            style={{
              boxShadow: '0 2px 10px rgba(80,60,40,0.06)',
            }}
          >
            <span className="text-base opacity-50">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ボードやテーマを探す..."
              className="flex-1 bg-transparent text-[15px] outline-none"
              style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {/* Active tag filter */}
          {tagFilter && (
            <div className="mx-auto mb-4 flex max-w-[700px] items-center justify-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--color-primary-a8)',
                  color: 'var(--color-primary-dark)',
                }}
              >
                #{tagFilter}
              </span>
              <button
                type="button"
                onClick={clearTagFilter}
                className="text-xs underline"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                × クリア
              </button>
            </div>
          )}

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
            {searchQuery.trim() && filteredItems.length === 0 && (
              <div className="py-8 text-center">
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  「{searchQuery}」に一致するボードが見つかりません
                </p>
              </div>
            )}

            <div className="masonry-grid">
              {filteredItems.map((item) => (
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
