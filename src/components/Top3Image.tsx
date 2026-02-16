import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import DownloadIcon from '@mui/icons-material/Download'
import type { SearchResultItem } from '../types/common'
import { ImageWorkCard, COLORS } from './ImageWorkCard'
import { useImageCapture } from '../hooks/useImageCapture'

type Top3ImageProps = {
  theme: string
  book: SearchResultItem | null
  music: SearchResultItem | null
  movie: SearchResultItem | null
}

function Top3Image({ theme, book, music, movie }: Top3ImageProps) {
  const {
    captureRef,
    containerRef,
    isGenerating,
    error,
    setError,
    successOpen,
    setSuccessOpen,
    scale,
    handleDownload,
    IMAGE_SIZE,
  } = useImageCapture(theme)

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
              background:
                'linear-gradient(90deg, transparent, rgba(250,204,21,0.6), transparent)',
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
              background:
                'linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 80,
              right: 20,
              width: 1,
              height: 120,
              background:
                'linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)',
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
                background:
                  'linear-gradient(90deg, transparent, rgba(250,204,21,0.5), transparent)',
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
              My No.1s
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
                background:
                  'linear-gradient(90deg, transparent, rgba(250,204,21,0.5), transparent)',
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
