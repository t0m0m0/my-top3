import React from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import DownloadIcon from '@mui/icons-material/Download'
import type { SearchResultItem, MediaCategory } from '../types/common'
import { IMAGE_SIZE, HALF, SEP } from '../constants/image-layout'
import { useImageCapture } from '../hooks/useImageCapture'
import { useLayoutSwap } from '../hooks/useLayoutSwap'
import { useMergedRef } from '../hooks/useMergedRef'
import { ImageSlot } from './ImageSlot'
import { StatusSnackbar } from './StatusSnackbar'
import { LayoutSelector } from './LayoutSelector'

type Top3ImageProps = {
  theme: string
  book: SearchResultItem | null
  music: SearchResultItem | null
  movie: SearchResultItem | null
  captureRef?: React.Ref<HTMLDivElement>
}

function Top3Image({
  theme,
  book,
  music,
  movie,
  captureRef: externalCaptureRef,
}: Top3ImageProps) {
  const {
    captureRef: internalCaptureRef,
    containerRef,
    isGenerating,
    error,
    setError,
    successOpen,
    setSuccessOpen,
    scale,
    handleDownload,
  } = useImageCapture(theme)

  const captureRefCallback = useMergedRef(
    internalCaptureRef,
    externalCaptureRef,
  )

  const { layout, handleLayoutChange } = useLayoutSwap()

  const items: Record<MediaCategory, SearchResultItem | null> = {
    book,
    music,
    movie,
  }

  return (
    <div>
      <LayoutSelector layout={layout} onLayoutChange={handleLayoutChange} />

      {/* Capture target */}
      <div ref={containerRef} style={{ overflow: 'hidden', maxWidth: '100%' }}>
        <div
          style={{
            width: IMAGE_SIZE * scale,
            height: IMAGE_SIZE * scale,
            margin: '0 auto',
            overflow: 'hidden',
          }}
        >
          <div
            ref={captureRefCallback}
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

            {/* Branding & Data Credits */}
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
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.15)',
                  letterSpacing: 1,
                  fontWeight: 400,
                  marginTop: 2,
                  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                }}
              >
                Data by TMDb &amp; Last.fm
              </div>
            </div>
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

      <StatusSnackbar
        open={successOpen}
        severity="success"
        message="画像を保存しました"
        onClose={() => setSuccessOpen(false)}
      />

      <StatusSnackbar
        open={!!error}
        autoHideDuration={5000}
        severity="error"
        message={error ?? ''}
        onClose={() => setError(null)}
      />
    </div>
  )
}

export default Top3Image
