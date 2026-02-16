import { useRef, useState, useCallback, useEffect } from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import DownloadIcon from '@mui/icons-material/Download'
import html2canvas from 'html2canvas'
import type { SearchResultItem, MediaCategory } from '../types/common'

type Top3ImageProps = {
  theme: string
  book: SearchResultItem | null
  music: SearchResultItem | null
  movie: SearchResultItem | null
}

type SlotPosition = 'top' | 'bottom-left' | 'bottom-right'
type LayoutConfig = Record<SlotPosition, MediaCategory>

const IMAGE_SIZE = 1080
const HALF = IMAGE_SIZE / 2
const SEP = 2

const CATEGORY_COLORS: Record<MediaCategory, string> = {
  book: '#f97316',
  music: '#10b981',
  movie: '#a855f7',
}

const CATEGORY_BORDER_COLORS: Record<MediaCategory, string> = {
  book: 'rgba(249,115,22,0.4)',
  music: 'rgba(16,185,129,0.4)',
  movie: 'rgba(168,85,247,0.4)',
}

const NO_IMAGE_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI4MCIgZmlsbD0iIzM3NDE1MSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LXNpemU9IjE0Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='

const DEFAULT_LAYOUT: LayoutConfig = {
  top: 'music',
  'bottom-left': 'book',
  'bottom-right': 'movie',
}

const SLOT_LABELS: Record<SlotPosition, string> = {
  top: '上',
  'bottom-left': '左下',
  'bottom-right': '右下',
}

const CATEGORY_LABELS: Record<MediaCategory, string> = {
  book: 'BOOK',
  music: 'MUSIC',
  movie: 'MOVIE',
}

type SlotStyle = {
  top: number
  left: number
  width: number
  height: number
  titleSize: number
  subtitleSize: number
  padding: string
}

const SLOT_STYLES: Record<SlotPosition, SlotStyle> = {
  top: {
    top: 0,
    left: 0,
    width: IMAGE_SIZE,
    height: HALF,
    titleSize: 48,
    subtitleSize: 20,
    padding: '40px 48px',
  },
  'bottom-left': {
    top: HALF + SEP,
    left: 0,
    width: HALF - SEP / 2,
    height: HALF - SEP,
    titleSize: 32,
    subtitleSize: 16,
    padding: '24px 28px',
  },
  'bottom-right': {
    top: HALF + SEP,
    left: HALF + SEP / 2,
    width: HALF - SEP / 2,
    height: HALF - SEP,
    titleSize: 30,
    subtitleSize: 16,
    padding: '24px 28px',
  },
}

type ImageSlotProps = {
  item: SearchResultItem | null
  category: MediaCategory
  slot: SlotPosition
  theme?: string
}

function ImageSlot({ item, category, slot, theme }: ImageSlotProps) {
  const style = SLOT_STYLES[slot]
  const color = CATEGORY_COLORS[category]
  const borderColor = CATEGORY_BORDER_COLORS[category]

  if (!item) {
    return (
      <div
        data-testid={`slot-${slot}`}
        style={{
          position: 'absolute',
          top: style.top,
          left: style.left,
          width: style.width,
          height: style.height,
          overflow: 'hidden',
          background: '#111827',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#6b7280',
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          {CATEGORY_LABELS[category]}
        </span>
        <span style={{ color: '#4b5563', fontSize: 14, marginTop: 4 }}>
          No Data
        </span>
      </div>
    )
  }

  return (
    <div
      data-testid={`slot-${slot}`}
      style={{
        position: 'absolute',
        top: style.top,
        left: style.left,
        width: style.width,
        height: style.height,
        overflow: 'hidden',
      }}
    >
      {/* Full-bleed thumbnail */}
      <img
        src={item.thumbnailUrl}
        alt={item.title}
        onError={(e) => {
          const img = e.target as HTMLImageElement
          if (img.src !== NO_IMAGE_SRC) {
            img.src = NO_IMAGE_SRC
          }
        }}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: slot === 'top' ? 'none' : 'brightness(0.7)',
        }}
      />

      {/* Dark gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: [
            'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.75) 100%)',
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)',
          ].join(', '),
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: style.padding,
        }}
      >
        {/* Top: theme (only on top slot) or category badge */}
        <div>
          {slot === 'top' && theme ? (
            <div
              style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: 2,
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }}
            >
              {`\u300C ${theme} \u300D`}
            </div>
          ) : (
            <div
              style={{
                display: 'inline-block',
                alignSelf: 'flex-start',
                fontSize: slot === 'top' ? 11 : 10,
                fontWeight: 700,
                color,
                letterSpacing: 3,
                textTransform: 'uppercase' as const,
                padding: slot === 'top' ? '4px 12px' : '3px 10px',
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${borderColor}`,
                borderRadius: 4,
              }}
            >
              {CATEGORY_LABELS[category]}
            </div>
          )}
        </div>

        {/* Bottom: work info */}
        <div>
          {/* Category badge (show below theme on top slot) */}
          {slot === 'top' && theme && (
            <div
              style={{
                display: 'inline-block',
                fontSize: 11,
                fontWeight: 700,
                color,
                letterSpacing: 3,
                textTransform: 'uppercase' as const,
                marginBottom: 12,
                padding: '4px 12px',
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${borderColor}`,
                borderRadius: 4,
              }}
            >
              {CATEGORY_LABELS[category]}
            </div>
          )}
          <div
            style={{
              fontSize: style.titleSize,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.15,
              textShadow: '0 2px 20px rgba(0,0,0,0.6)',
            }}
          >
            {item.title}
          </div>
          <div
            style={{
              fontSize: style.subtitleSize,
              color: 'rgba(255,255,255,0.55)',
              marginTop: slot === 'top' ? 8 : 6,
              letterSpacing: 1,
              textShadow: '0 1px 8px rgba(0,0,0,0.5)',
            }}
          >
            {item.subtitle}
          </div>
        </div>
      </div>
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
  const [layout, setLayout] = useState<LayoutConfig>(DEFAULT_LAYOUT)

  const items: Record<MediaCategory, SearchResultItem | null> = {
    book,
    music,
    movie,
  }

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

  const handleLayoutChange = useCallback(
    (slot: SlotPosition, newCategory: MediaCategory) => {
      setLayout((prev) => {
        // Find which slot currently has the new category
        const otherSlot = (Object.keys(prev) as SlotPosition[]).find(
          (s) => prev[s] === newCategory,
        )
        if (!otherSlot || otherSlot === slot) return prev

        // Swap
        return {
          ...prev,
          [slot]: newCategory,
          [otherSlot]: prev[slot],
        }
      })
    },
    [],
  )

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
        backgroundColor: '#0a0a0f',
      })

      const dataUrl = canvas.toDataURL('image/png')
      if (!dataUrl || dataUrl === 'data:,') {
        setError('画像の生成に失敗しました。画像データが空です。')
        return
      }

      const date = formatDate()
      const safeTheme = theme ? `-${sanitizeFilename(theme)}` : ''
      const link = document.createElement('a')
      link.download = `my-no1s-${date}${safeTheme}.png`
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
      {/* Layout selector */}
      <div
        data-testid="layout-selector"
        className="mb-4 flex flex-wrap items-center justify-center gap-3"
      >
        {(Object.keys(SLOT_LABELS) as SlotPosition[]).map((slot) => (
          <label key={slot} className="flex items-center gap-1.5 text-sm">
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {SLOT_LABELS[slot]}:
            </span>
            <select
              data-testid={`select-${slot}`}
              value={layout[slot]}
              onChange={(e) =>
                handleLayoutChange(slot, e.target.value as MediaCategory)
              }
              className="rounded border px-2 py-1 text-sm"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}
            >
              <option value="book">Book</option>
              <option value="music">Music</option>
              <option value="movie">Movie</option>
            </select>
          </label>
        ))}
      </div>

      {/* Capture target */}
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
            background: '#0a0a0f',
            position: 'relative',
            overflow: 'hidden',
            fontFamily:
              '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", sans-serif',
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
            marginBottom: -IMAGE_SIZE * (1 - scale),
          }}
        >
          {/* Top slot */}
          <ImageSlot
            item={items[layout.top]}
            category={layout.top}
            slot="top"
            theme={theme}
          />

          {/* Horizontal separator */}
          <div
            style={{
              position: 'absolute',
              top: HALF,
              left: 0,
              right: 0,
              height: SEP,
              background: 'rgba(255,255,255,0.06)',
              zIndex: 10,
            }}
          />

          {/* Bottom-left slot */}
          <ImageSlot
            item={items[layout['bottom-left']]}
            category={layout['bottom-left']}
            slot="bottom-left"
          />

          {/* Vertical separator */}
          <div
            style={{
              position: 'absolute',
              top: HALF + SEP,
              left: HALF - SEP / 2,
              width: SEP,
              height: HALF - SEP,
              background: 'rgba(255,255,255,0.06)',
              zIndex: 10,
            }}
          />

          {/* Bottom-right slot */}
          <ImageSlot
            item={items[layout['bottom-right']]}
            category={layout['bottom-right']}
            slot="bottom-right"
          />

          {/* Branding */}
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: 0,
              right: 0,
              textAlign: 'center',
              zIndex: 20,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.18)',
                letterSpacing: 3,
                fontWeight: 500,
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              }}
            >
              my-no1s.app
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
