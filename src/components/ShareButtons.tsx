import { useState, useCallback, type RefObject } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ShareIcon from '@mui/icons-material/Share'
import { generateImageBlob } from '../utils/image-helpers'
import { createShortUrl } from '../utils/share-url'

type ShareParams = {
  theme: string
  bookId: string
  musicId: string
  movieId: string
}

type ShareButtonsProps = {
  theme?: string
  captureRef?: RefObject<HTMLDivElement | null>
  preGeneratedBlob?: Blob | null
  shareParams?: ShareParams
}

function buildShareText(theme?: string, url?: string): string {
  const base = theme ? `「${theme}」 #MyNo1s` : '#MyNo1s'
  return url ? `${base}\n${url}` : base
}

export default function ShareButtons({
  theme,
  captureRef,
  preGeneratedBlob,
  shareParams,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [shareFailed, setShareFailed] = useState(false)
  const [shareGenerating, setShareGenerating] = useState(false)
  const [cachedShortUrl, setCachedShortUrl] = useState<string | null>(null)

  const handleCloseSuccess = useCallback(() => setCopied(false), [])
  const handleCloseError = useCallback(() => setCopyFailed(false), [])
  const handleCloseShareError = useCallback(() => setShareFailed(false), [])

  const resolveShareUrl = useCallback(async (): Promise<string> => {
    if (cachedShortUrl) return cachedShortUrl
    if (!shareParams) return window.location.href
    try {
      const shortPath = await createShortUrl(shareParams)
      const fullUrl = `${window.location.origin}${shortPath}`
      setCachedShortUrl(fullUrl)
      return fullUrl
    } catch {
      // Fallback to current URL if short URL creation fails
      return window.location.href
    }
  }, [shareParams, cachedShortUrl])

  const handleCopyUrl = useCallback(async () => {
    try {
      const url = await resolveShareUrl()
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch (error) {
      console.warn('Clipboard API failed, attempting fallback:', error)
      const url = cachedShortUrl ?? window.location.href
      const textarea = document.createElement('textarea')
      textarea.value = url
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
  }, [resolveShareUrl, cachedShortUrl])

  const handleWebShare = useCallback(async () => {
    setShareGenerating(true)
    try {
      const shareUrl = await resolveShareUrl()

      // Try to share with image if captureRef is available and canShare supports files
      if (captureRef?.current) {
        const blob =
          preGeneratedBlob ?? (await generateImageBlob(captureRef.current))
        const file = new File([blob], 'my-no1s.png', { type: 'image/png' })

        if (
          typeof navigator.canShare === 'function' &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            text: buildShareText(theme, shareUrl),
            url: shareUrl,
            files: [file],
          })
          return
        }
      }

      // Fallback: text + URL only
      await navigator.share({
        title: 'My No.1s',
        text: buildShareText(theme, shareUrl),
        url: shareUrl,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      console.error('[ShareButtons] Web Share API failed:', error)
      setShareFailed(true)
    } finally {
      setShareGenerating(false)
    }
  }, [captureRef, theme, preGeneratedBlob, resolveShareUrl])

  const canWebShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  return (
    <div className="flex justify-center gap-4">
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
            disabled={shareGenerating}
            sx={{
              width: 44,
              height: 44,
              backgroundColor: 'var(--color-secondary)',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'var(--color-secondary)',
                filter: 'brightness(0.9)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'var(--color-secondary)',
                color: '#ffffff',
                opacity: 0.6,
                pointerEvents: 'auto',
              },
            }}
          >
            {shareGenerating ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <ShareIcon fontSize="small" />
            )}
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
    </div>
  )
}
