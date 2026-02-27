import React, { useState } from 'react'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import DownloadIcon from '@mui/icons-material/Download'
import type { SearchResultItem, MediaCategory } from '../types/common'
import {
  IMAGE_SIZE,
  HALF,
  SEP,
  PORTRAIT_WIDTH,
  PORTRAIT_HEIGHT,
  VERTICAL_SLOT_POSITIONS,
  VERTICAL_SLOT_STYLES,
} from '../constants/image-layout'
import type { AspectRatio } from '../constants/image-layout'
import { CANVAS_DARK } from '../constants/image-colors'
import { useImageCapture } from '../hooks/useImageCapture'
import { useLayoutSwap, useVerticalLayoutSwap } from '../hooks/useLayoutSwap'
import { useMergedRef } from '../hooks/useMergedRef'
import { ImageSlot } from './ImageSlot'
import { StatusSnackbar } from './StatusSnackbar'
import { LayoutSelector, VerticalLayoutSelector } from './LayoutSelector'
import { AspectRatioSelector } from './AspectRatioSelector'

type Top3ImageProps = {
  theme: string
  book: SearchResultItem | null
  music: SearchResultItem | null
  movie: SearchResultItem | null
  captureRef?: React.Ref<HTMLDivElement>
  readOnly?: boolean
}

function Top3Image({
  theme,
  book,
  music,
  movie,
  captureRef: externalCaptureRef,
  readOnly,
}: Top3ImageProps) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('landscape')

  const isPortrait = aspectRatio === 'portrait'
  const canvasWidth = isPortrait ? PORTRAIT_WIDTH : IMAGE_SIZE
  const canvasHeight = isPortrait ? PORTRAIT_HEIGHT : IMAGE_SIZE

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
  } = useImageCapture(theme, { width: canvasWidth, height: canvasHeight })

  const captureRefCallback = useMergedRef(
    internalCaptureRef,
    externalCaptureRef,
  )

  const { layout: landscapeLayout, handleLayoutChange: handleLandscapeChange } =
    useLayoutSwap()
  const { layout: verticalLayout, handleLayoutChange: handleVerticalChange } =
    useVerticalLayoutSwap()

  const items: Record<MediaCategory, SearchResultItem | null> = {
    book,
    music,
    movie,
  }

  return (
    <div>
      {!readOnly && (
        <>
          <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
          {isPortrait ? (
            <VerticalLayoutSelector
              layout={verticalLayout}
              onLayoutChange={handleVerticalChange}
            />
          ) : (
            <LayoutSelector
              layout={landscapeLayout}
              onLayoutChange={handleLandscapeChange}
            />
          )}
        </>
      )}

      {/* Capture target */}
      <div ref={containerRef} style={{ overflow: 'hidden', maxWidth: '100%' }}>
        <div
          style={{
            width: canvasWidth * scale,
            height: canvasHeight * scale,
            margin: '0 auto',
            overflow: 'hidden',
          }}
        >
          <div
            ref={captureRefCallback}
            data-testid="top3-image-capture"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              background: CANVAS_DARK,
              position: 'relative',
              overflow: 'hidden',
              fontFamily:
                '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", sans-serif',
              transformOrigin: 'top left',
              transform: `scale(${scale})`,
            }}
          >
            {isPortrait ? (
              /* Portrait (9:16) layout: 3 stacked vertically */
              <>
                {VERTICAL_SLOT_POSITIONS.map((slot, idx) => (
                  <React.Fragment key={slot}>
                    <ImageSlot
                      item={items[verticalLayout[slot]]}
                      category={verticalLayout[slot]}
                      slot={slot}
                      theme={idx === 0 ? theme : undefined}
                    />
                    {idx < 2 && (
                      <div
                        style={{
                          position: 'absolute',
                          top:
                            VERTICAL_SLOT_STYLES[slot].top +
                            VERTICAL_SLOT_STYLES[slot].height,
                          left: 0,
                          right: 0,
                          height: SEP,
                          background: 'rgba(255,255,255,0.06)',
                          zIndex: 10,
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </>
            ) : (
              /* Landscape (1:1) layout */
              <>
                {/* Top slot */}
                <ImageSlot
                  item={items[landscapeLayout.top]}
                  category={landscapeLayout.top}
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
                  item={items[landscapeLayout['bottom-left']]}
                  category={landscapeLayout['bottom-left']}
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
                  item={items[landscapeLayout['bottom-right']]}
                  category={landscapeLayout['bottom-right']}
                  slot="bottom-right"
                />
              </>
            )}

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
                  color: 'rgba(255, 252, 248, 0.2)',
                  letterSpacing: 3,
                  fontWeight: 500,
                  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                }}
              >
                すきコレ
              </span>
              <div
                style={{
                  fontSize: 9,
                  color: 'rgba(255, 252, 248, 0.15)',
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
      {!readOnly && (
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
            {isGenerating ? '生成中...' : '保存する 📥'}
          </Button>
        </div>
      )}

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
