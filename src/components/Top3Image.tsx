import { useRef, useState, useCallback, useEffect } from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import DownloadIcon from '@mui/icons-material/Download'
import html2canvas from 'html2canvas'
import type { SearchResultItem } from '../types/common'

type Top3ImageProps = {
  theme: string
  book: SearchResultItem | null
  music: SearchResultItem | null
  movie: SearchResultItem | null
}

type ImageWorkCardProps = {
  item: SearchResultItem | null
  label: string
}

const IMAGE_SIZE = 1080

const COLORS = {
  textPrimary: '#fff',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  textSubheading: '#e5e7eb',
  badgeBg: '#1f2937',
  rankBadgeBg: '#facc15',
  canvasBg: '#111827',
} as const

const TRUNCATED_TEXT: React.CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: 240,
  textAlign: 'center',
}

const NO_IMAGE_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iIzM3NDE1MSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='

function ImageWorkCard({ item, label }: ImageWorkCardProps) {
  if (!item) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <span style={{ color: COLORS.textMuted, fontSize: 18 }}>{label}</span>
        <span style={{ color: COLORS.textMuted, fontSize: 14 }}>No Data</span>
      </div>
    )
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 8px',
        gap: 8,
      }}
    >
      <div
        style={{
          background: COLORS.badgeBg,
          color: COLORS.textPrimary,
          fontSize: 14,
          fontWeight: 700,
          padding: '4px 12px',
          borderRadius: 4,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
      <div
        style={{
          background: COLORS.rankBadgeBg,
          color: COLORS.badgeBg,
          fontSize: 13,
          fontWeight: 700,
          padding: '2px 10px',
          borderRadius: 4,
        }}
      >
        #1
      </div>
      <img
        src={item.thumbnailUrl}
        alt={item.title}
        crossOrigin="anonymous"
        onError={(e) => {
          const img = e.target as HTMLImageElement
          if (img.src !== NO_IMAGE_SRC) {
            img.src = NO_IMAGE_SRC
          }
        }}
        style={{
          width: 200,
          height: 280,
          objectFit: 'cover',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}
      />
      <span
        style={{
          ...TRUNCATED_TEXT,
          fontSize: 16,
          fontWeight: 600,
          color: COLORS.textPrimary,
        }}
      >
        {item.title}
      </span>
      <span
        style={{
          ...TRUNCATED_TEXT,
          fontSize: 13,
          color: COLORS.textSecondary,
        }}
      >
        {item.subtitle}
      </span>
    </div>
  )
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[/\\:*?"<>|\0\n\r]/g, '_')
    .replace(/^\.+/, '')
    .trim()
    .slice(0, 50)
}

function getErrorMessage(err: unknown): string {
  if (err instanceof DOMException && err.name === 'SecurityError') {
    return '画像の取得に失敗しました。外部画像のCORS設定が原因の可能性があります。'
  }
  if (err instanceof DOMException && err.name === 'QuotaExceededError') {
    return '画像サイズが大きすぎるため生成できませんでした。'
  }
  return '画像の生成に失敗しました。もう一度お試しください。'
}

function Top3Image({ theme, book, music, movie }: Top3ImageProps) {
  const captureRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState(0.5)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScale = () => {
      const containerWidth = container.clientWidth
      const newScale =
        Math.round(Math.min(containerWidth / IMAGE_SIZE, 0.5) * 1000) / 1000
      setScale(newScale)
    }

    updateScale()

    const observer = new ResizeObserver(updateScale)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const handleDownload = useCallback(async () => {
    if (!captureRef.current) return

    setIsGenerating(true)
    setError(null)
    try {
      const canvas = await html2canvas(captureRef.current, {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        scale: 1,
        useCORS: true,
        allowTaint: false,
        backgroundColor: COLORS.canvasBg,
      })

      const dataUrl = canvas.toDataURL('image/png')
      if (!dataUrl || dataUrl === 'data:,') {
        setError('画像の生成に失敗しました。画像データが空です。')
        return
      }

      const safeTheme = theme ? `-${sanitizeFilename(theme)}` : ''
      const link = document.createElement('a')
      link.download = `my-top3${safeTheme}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('[Top3Image] Failed to generate image:', err)
      setError(getErrorMessage(err))
    } finally {
      setIsGenerating(false)
    }
  }, [theme])

  return (
    <div>
      {/* Capture target -- inline styles are required here because html2canvas
          renders from computed inline styles, not from CSS classes. */}
      <div
        ref={containerRef}
        style={{
          overflow: 'hidden',
          maxWidth: '100%',
        }}
      >
        <div
          ref={captureRef}
          data-testid="top3-image-capture"
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            background: `linear-gradient(135deg, ${COLORS.canvasBg} 0%, #1e3a5f 50%, ${COLORS.canvasBg} 100%)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily:
              '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", sans-serif',
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            marginBottom: -IMAGE_SIZE * (1 - scale),
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: 'center',
              padding: '40px 40px 20px',
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: COLORS.textPrimary,
                letterSpacing: 2,
              }}
            >
              My Top 3
            </div>
            {theme && (
              <div
                style={{
                  fontSize: 22,
                  color: COLORS.textSubheading,
                  marginTop: 12,
                }}
              >
                {`「${theme}」`}
              </div>
            )}
          </div>

          {/* Works row */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              width: '100%',
              padding: '0 24px 40px',
            }}
          >
            <ImageWorkCard item={book} label="BOOK" />
            <ImageWorkCard item={music} label="MUSIC" />
            <ImageWorkCard item={movie} label="MOVIE" />
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="mt-4 text-center">
        <Button
          variant="contained"
          startIcon={
            isGenerating ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DownloadIcon />
            )
          }
          onClick={handleDownload}
          disabled={isGenerating}
        >
          {isGenerating ? '生成中...' : '画像をダウンロード'}
        </Button>
      </div>

      {error && (
        <Typography variant="body2" color="error" className="mt-2 text-center">
          {error}
        </Typography>
      )}
    </div>
  )
}

export default Top3Image
