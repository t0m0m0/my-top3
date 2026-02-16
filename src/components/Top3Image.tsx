import { useRef, useState, useCallback, useEffect } from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
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
  maxWidth: 260,
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
        padding: '16px 12px',
        gap: 10,
      }}
    >
      {/* Category label badge */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f, #1f2937)',
          color: COLORS.textPrimary,
          fontSize: 15,
          fontWeight: 700,
          padding: '5px 16px',
          borderRadius: 6,
          textTransform: 'uppercase' as const,
          letterSpacing: 2,
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {label}
      </div>

      {/* Rank badge - larger, gold, with glow */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f59e0b, #eab308, #f59e0b)',
          color: '#78350f',
          fontSize: 18,
          fontWeight: 800,
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(250,204,21,0.4), 0 4px 8px rgba(0,0,0,0.3)',
        }}
      >
        #1
      </div>

      {/* Thumbnail with enhanced shadow */}
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
          width: 210,
          height: 290,
          objectFit: 'cover',
          borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
          border: '2px solid rgba(255,255,255,0.1)',
        }}
      />

      {/* Title */}
      <span
        style={{
          ...TRUNCATED_TEXT,
          fontSize: 18,
          fontWeight: 700,
          color: COLORS.textPrimary,
          letterSpacing: 0.5,
        }}
      >
        {item.title}
      </span>

      {/* Subtitle */}
      <span
        style={{
          ...TRUNCATED_TEXT,
          fontSize: 14,
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

function formatDate(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function Top3Image({ theme, book, music, movie }: Top3ImageProps) {
  const captureRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)
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

      const date = formatDate()
      const safeTheme = theme ? `-${sanitizeFilename(theme)}` : ''
      const link = document.createElement('a')
      link.download = `my-top3-${date}${safeTheme}.png`
      link.href = dataUrl
      link.click()
      setSuccessOpen(true)
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
            background: [
              `radial-gradient(ellipse at 20% 20%, rgba(59,130,246,0.15) 0%, transparent 50%)`,
              `radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.12) 0%, transparent 50%)`,
              `radial-gradient(ellipse at 50% 80%, rgba(16,185,129,0.10) 0%, transparent 50%)`,
              `radial-gradient(ellipse at 10% 70%, rgba(245,158,11,0.08) 0%, transparent 40%)`,
              `radial-gradient(ellipse at 90% 60%, rgba(236,72,153,0.08) 0%, transparent 40%)`,
              `linear-gradient(135deg, ${COLORS.canvasBg} 0%, #1e293b 30%, #1e3a5f 50%, #1e293b 70%, ${COLORS.canvasBg} 100%)`,
            ].join(', '),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily:
              '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", sans-serif',
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            marginBottom: -IMAGE_SIZE * (1 - scale),
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative top line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 200,
              height: 3,
              background: 'linear-gradient(90deg, transparent, rgba(250,204,21,0.6), transparent)',
              borderRadius: 2,
            }}
          />

          {/* Decorative corner dots - top left */}
          <div
            style={{
              position: 'absolute',
              top: 24,
              left: 24,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'rgba(250,204,21,0.3)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 24,
              left: 38,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'rgba(250,204,21,0.2)',
            }}
          />

          {/* Decorative corner dots - top right */}
          <div
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'rgba(250,204,21,0.3)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 24,
              right: 38,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'rgba(250,204,21,0.2)',
            }}
          />

          {/* Decorative subtle side lines */}
          <div
            style={{
              position: 'absolute',
              top: 80,
              left: 20,
              width: 1,
              height: 120,
              background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 80,
              right: 20,
              width: 1,
              height: 120,
              background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)',
            }}
          />

          {/* Header */}
          <div
            style={{
              textAlign: 'center',
              padding: '48px 40px 16px',
            }}
          >
            {/* Decorative line above title */}
            <div
              style={{
                width: 60,
                height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(250,204,21,0.5), transparent)',
                margin: '0 auto 16px',
                borderRadius: 1,
              }}
            />
            <div
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: COLORS.textPrimary,
                letterSpacing: 4,
                textShadow: '0 2px 12px rgba(0,0,0,0.3)',
              }}
            >
              My Top 3
            </div>
            {theme && (
              <div
                style={{
                  fontSize: 24,
                  color: COLORS.textSubheading,
                  marginTop: 14,
                  letterSpacing: 1,
                }}
              >
                {`\u300C${theme}\u300D`}
              </div>
            )}
            {/* Decorative line below title */}
            <div
              style={{
                width: 60,
                height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(250,204,21,0.5), transparent)',
                margin: '16px auto 0',
                borderRadius: 1,
              }}
            />
          </div>

          {/* Works row */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              width: '100%',
              padding: '0 24px 16px',
            }}
          >
            <ImageWorkCard item={book} label="BOOK" />
            <ImageWorkCard item={music} label="MUSIC" />
            <ImageWorkCard item={movie} label="MOVIE" />
          </div>

          {/* Branding footer */}
          <div
            style={{
              width: '100%',
              textAlign: 'center',
              padding: '12px 0 20px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: 2,
                fontWeight: 500,
              }}
            >
              my-top3.app
            </span>
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

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          variant="filled"
        >
          画像を保存しました
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default Top3Image
