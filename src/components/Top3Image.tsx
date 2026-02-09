import { useRef, useState, useCallback } from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import DownloadIcon from '@mui/icons-material/Download'
import html2canvas from 'html2canvas'
import type { SearchResultItem } from '../types/common'

type Top3ImageProps = {
  theme: string
  book: SearchResultItem | null
  music: SearchResultItem | null
  movie: SearchResultItem | null
}

const IMAGE_SIZE = 1080

function ImageWorkCard({
  item,
  label,
}: {
  item: SearchResultItem | null
  label: string
}) {
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
        <span style={{ color: '#9ca3af', fontSize: 18 }}>{label}</span>
        <span style={{ color: '#9ca3af', fontSize: 14 }}>No Data</span>
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
          background: '#1f2937',
          color: '#fff',
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
          background: '#facc15',
          color: '#1f2937',
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
          fontSize: 16,
          fontWeight: 600,
          color: '#fff',
          textAlign: 'center',
          maxWidth: 240,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {item.title}
      </span>
      <span
        style={{
          fontSize: 13,
          color: '#d1d5db',
          textAlign: 'center',
          maxWidth: 240,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {item.subtitle}
      </span>
    </div>
  )
}

function Top3Image({ theme, book, music, movie }: Top3ImageProps) {
  const captureRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = useCallback(async () => {
    if (!captureRef.current) return

    setIsGenerating(true)
    try {
      const canvas = await html2canvas(captureRef.current, {
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        scale: 1,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#111827',
      })

      const link = document.createElement('a')
      link.download = `my-top3${theme ? `-${theme}` : ''}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      console.error('Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }, [theme])

  return (
    <div>
      {/* Capture target - 1080x1080 at scaled-down display size */}
      <div
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
            background: 'linear-gradient(135deg, #111827 0%, #1e3a5f 50%, #111827 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", sans-serif',
            transformOrigin: 'top left',
            transform: 'scale(0.5)',
            marginBottom: -IMAGE_SIZE * 0.5,
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
                color: '#fff',
                letterSpacing: 2,
              }}
            >
              My Top 3
            </div>
            {theme && (
              <div
                style={{
                  fontSize: 22,
                  color: '#e5e7eb',
                  marginTop: 12,
                }}
              >
                {`\u300C${theme}\u300D`}
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
    </div>
  )
}

export default Top3Image
