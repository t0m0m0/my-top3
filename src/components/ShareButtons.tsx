import { useState, useCallback, useEffect, useRef, type RefObject } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ShareIcon from '@mui/icons-material/Share'
import { StatusSnackbar } from './StatusSnackbar'
import { generateImageBlob } from '../utils/image-helpers'
import { createShortUrl } from '../utils/share-url'

type ShareParams = {
  theme: string
  bookId: string
  musicId: string
  movieId: string
  bookThumb?: string
  musicThumb?: string
  movieThumb?: string
}

type ShareButtonsProps = {
  theme?: string
  captureRef?: RefObject<HTMLDivElement | null>
  preGeneratedBlob?: Blob | null
  shareParams?: ShareParams
  existingShareId?: string
}

function buildShareText(theme?: string, url?: string): string {
  const base = theme ? `「${theme}」 #すきコレ` : '#すきコレ'
  return url ? `${base}\n${url}` : base
}

export default function ShareButtons({
  theme,
  captureRef,
  preGeneratedBlob,
  shareParams,
  existingShareId,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [shareFailed, setShareFailed] = useState(false)
  const [shareGenerating, setShareGenerating] = useState(false)
  const resolvedUrlRef = useRef<string | null>(null)

  const handleCloseSuccess = useCallback(() => setCopied(false), [])
  const handleCloseError = useCallback(() => setCopyFailed(false), [])
  const handleCloseShareError = useCallback(() => setShareFailed(false), [])

  // Pre-resolve short URL on mount so it's ready when user taps share.
  // Wait until thumbnails are loaded for categories that have an ID,
  // otherwise the share record would be saved with empty thumbnails.
  useEffect(() => {
    // If we already have a share ID (e.g. viewing from /s/:id), use it directly
    if (existingShareId) {
      resolvedUrlRef.current = `${window.location.origin}/s/${existingShareId}`
      return
    }
    if (!shareParams) return

    // Check that thumbnails are ready for all selected categories
    const thumbsReady =
      (!shareParams.bookId || !!shareParams.bookThumb) &&
      (!shareParams.musicId || !!shareParams.musicThumb) &&
      (!shareParams.movieId || !!shareParams.movieThumb)
    if (!thumbsReady) return

    let cancelled = false
    createShortUrl(shareParams)
      .then((shortPath) => {
        if (!cancelled) {
          resolvedUrlRef.current = `${window.location.origin}${shortPath}`
        }
      })
      .catch(() => {
        // Fallback: will use window.location.href
      })
    return () => {
      cancelled = true
    }
  }, [shareParams, existingShareId])

  const getShareUrl = useCallback((): string => {
    return resolvedUrlRef.current ?? window.location.href
  }, [])

  const handleCopyUrl = useCallback(async () => {
    const url = getShareUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch (error) {
      console.warn('Clipboard API failed, attempting fallback:', error)
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
  }, [getShareUrl])

  const handleWebShare = useCallback(async () => {
    setShareGenerating(true)
    try {
      const shareUrl = getShareUrl()

      // Try to share with image if captureRef is available and canShare supports files
      if (captureRef?.current) {
        const blob =
          preGeneratedBlob ?? (await generateImageBlob(captureRef.current))
        const file = new File([blob], 'my-no1s.png', { type: 'image/png' })

        if (
          typeof navigator.canShare === 'function' &&
          navigator.canShare({ files: [file] })
        ) {
          try {
            await navigator.share({
              text: buildShareText(theme, shareUrl),
              url: shareUrl,
              files: [file],
            })
            return
          } catch (fileShareError) {
            // If image share was rejected (e.g. NotAllowedError due to gesture timeout),
            // retry with text-only share below
            if (
              fileShareError instanceof DOMException &&
              fileShareError.name === 'AbortError'
            ) {
              return
            }
            // Fall through to text-only share
          }
        }
      }

      // Fallback: text + URL only
      await navigator.share({
        title: 'すきコレ',
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
  }, [captureRef, theme, preGeneratedBlob, getShareUrl])

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
            backgroundColor: 'var(--color-primary-dark)',
            color: '#ffffff',
            '&:hover': { backgroundColor: 'var(--color-primary)', filter: 'brightness(0.85)' },
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

      <StatusSnackbar
        open={copied}
        autoHideDuration={2000}
        severity="success"
        message="URLをコピーしました"
        onClose={handleCloseSuccess}
      />

      <StatusSnackbar
        open={copyFailed}
        autoHideDuration={4000}
        severity="error"
        message="URLのコピーに失敗しました。アドレスバーから手動でコピーしてください。"
        onClose={handleCloseError}
      />

      <StatusSnackbar
        open={shareFailed}
        autoHideDuration={4000}
        severity="error"
        message="シェアに失敗しました。URLをコピーして手動でシェアしてください。"
        onClose={handleCloseShareError}
      />
    </div>
  )
}
