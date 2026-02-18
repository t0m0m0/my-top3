import { useState, useCallback, type RefObject } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import XIcon from '@mui/icons-material/X'
import ShareIcon from '@mui/icons-material/Share'
import { generateImageBlob } from '../utils/image-helpers'

type ShareButtonsProps = {
  theme?: string
  captureRef?: RefObject<HTMLDivElement | null>
  preGeneratedBlob?: Blob | null
}

function buildShareText(theme?: string): string {
  const base = theme ? `My No.1s 「${theme}」` : 'My No.1s'
  return `${base} #MyNo1s`
}

function openXIntent(theme?: string) {
  const url = window.location.href
  const text = buildShareText(theme)
  const intentUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  const newWindow = window.open(intentUrl, '_blank', 'noopener,noreferrer')
  if (!newWindow) {
    window.location.href = intentUrl
  }
}

export default function ShareButtons({
  theme,
  captureRef,
  preGeneratedBlob,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [shareFailed, setShareFailed] = useState(false)
  const [xShareGenerating, setXShareGenerating] = useState(false)
  const [imageDownloaded, setImageDownloaded] = useState(false)
  const [imageGenError, setImageGenError] = useState(false)

  const handleCloseSuccess = useCallback(() => setCopied(false), [])
  const handleCloseError = useCallback(() => setCopyFailed(false), [])
  const handleCloseShareError = useCallback(() => setShareFailed(false), [])
  const handleCloseImageDownloaded = useCallback(
    () => setImageDownloaded(false),
    [],
  )
  const handleCloseImageGenError = useCallback(
    () => setImageGenError(false),
    [],
  )

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch (error) {
      console.warn('Clipboard API failed, attempting fallback:', error)
      const textarea = document.createElement('textarea')
      textarea.value = window.location.href
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      try {
        textarea.select()
        const success = document.execCommand('copy')
        if (success) {
          setCopied(true)
        } else {
          setCopyFailed(true)
        }
      } catch {
        setCopyFailed(true)
      } finally {
        document.body.removeChild(textarea)
      }
    }
  }, [])

  const handleShareX = useCallback(async () => {
    // No captureRef: text-only X intent
    if (!captureRef?.current) {
      openXIntent(theme)
      return
    }

    setXShareGenerating(true)
    try {
      const blob =
        preGeneratedBlob ?? (await generateImageBlob(captureRef.current))

      // Always download image + open X intent directly
      const dataUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'my-no1s.png'
      link.href = dataUrl
      link.click()
      URL.revokeObjectURL(dataUrl)

      openXIntent(theme)
      setImageDownloaded(true)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      console.error('[ShareButtons] X share with image failed:', error)
      setImageGenError(true)
    } finally {
      setXShareGenerating(false)
    }
  }, [captureRef, theme, preGeneratedBlob])

  const handleWebShare = useCallback(async () => {
    try {
      await navigator.share({
        title: 'My No.1s',
        text: buildShareText(theme),
        url: window.location.href,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      console.error('[ShareButtons] Web Share API failed:', error)
      setShareFailed(true)
    }
  }, [theme])

  const canWebShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  return (
    <div className="flex justify-center gap-3">
      <Tooltip title="Xでシェア" arrow>
        <IconButton
          onClick={handleShareX}
          aria-label="Xでシェア"
          disabled={xShareGenerating}
          sx={{
            width: 44,
            height: 44,
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#333333' },
            '&.Mui-disabled': {
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              opacity: 0.6,
              pointerEvents: 'auto',
            },
          }}
        >
          {xShareGenerating ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <XIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      <Tooltip title="URLをコピー" arrow>
        <IconButton
          onClick={handleCopyUrl}
          aria-label="URLをコピー"
          sx={{
            width: 44,
            height: 44,
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
          }}
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {canWebShare && (
        <Tooltip title="シェア" arrow>
          <IconButton
            onClick={handleWebShare}
            aria-label="シェア"
            sx={{
              width: 44,
              height: 44,
              backgroundColor: 'var(--color-secondary)',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'var(--color-secondary)',
                filter: 'brightness(0.9)',
              },
            }}
          >
            <ShareIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={handleCloseSuccess}>
          URLをコピーしました
        </Alert>
      </Snackbar>

      <Snackbar
        open={copyFailed}
        autoHideDuration={4000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={handleCloseError}>
          URLのコピーに失敗しました。アドレスバーから手動でコピーしてください。
        </Alert>
      </Snackbar>

      <Snackbar
        open={shareFailed}
        autoHideDuration={4000}
        onClose={handleCloseShareError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={handleCloseShareError}
        >
          シェアに失敗しました。URLをコピーして手動でシェアしてください。
        </Alert>
      </Snackbar>

      <Snackbar
        open={imageDownloaded}
        autoHideDuration={5000}
        onClose={handleCloseImageDownloaded}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={handleCloseImageDownloaded}
        >
          画像をダウンロードしました。X投稿画面で添付してください。
        </Alert>
      </Snackbar>

      <Snackbar
        open={imageGenError}
        autoHideDuration={5000}
        onClose={handleCloseImageGenError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={handleCloseImageGenError}
        >
          画像の生成に失敗しました。もう一度お試しください。
        </Alert>
      </Snackbar>
    </div>
  )
}
