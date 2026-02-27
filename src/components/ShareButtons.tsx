import { useState, useCallback, useEffect, useRef } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ShareIcon from '@mui/icons-material/Share'
import XIcon from '@mui/icons-material/X'
import InstagramIcon from '@mui/icons-material/Instagram'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { StatusSnackbar } from './StatusSnackbar'
import { createShortUrl, uploadShareImage } from '../utils/share-url'

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
  preGeneratedBlob,
  shareParams,
  existingShareId,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [shareFailed, setShareFailed] = useState(false)
  const [shareGenerating, setShareGenerating] = useState(false)
  const [instagramDialogOpen, setInstagramDialogOpen] = useState(false)
  const resolvedUrlRef = useRef<string | null>(null)

  const handleCloseSuccess = useCallback(() => setCopied(false), [])
  const handleCloseError = useCallback(() => setCopyFailed(false), [])
  const handleCloseShareError = useCallback(() => setShareFailed(false), [])
  const handleOpenInstagramDialog = useCallback(
    () => setInstagramDialogOpen(true),
    [],
  )
  const handleCloseInstagramDialog = useCallback(
    () => setInstagramDialogOpen(false),
    [],
  )

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

  // Upload pre-generated image for OGP when blob and share ID are ready
  const imageUploadedRef = useRef(false)
  useEffect(() => {
    if (!preGeneratedBlob || imageUploadedRef.current) return

    // Extract share ID from resolved URL or existingShareId
    const shareId =
      existingShareId ??
      resolvedUrlRef.current?.match(/\/s\/([A-Za-z0-9_-]+)$/)?.[1]
    if (!shareId) return

    imageUploadedRef.current = true
    uploadShareImage(shareId, preGeneratedBlob).catch(() => {
      // Non-critical: OGP image just won't be available
    })
  }, [preGeneratedBlob, existingShareId])

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
  }, [theme, getShareUrl])

  const handleXShare = useCallback(() => {
    const shareUrl = getShareUrl()
    const textParts: string[] = []
    if (theme) {
      textParts.push(`「${theme}」`)
    }
    const intentUrl = new URL('https://twitter.com/intent/tweet')
    intentUrl.searchParams.set('text', textParts.join(''))
    intentUrl.searchParams.set('url', shareUrl)
    intentUrl.searchParams.set('hashtags', 'すきコレ')
    window.open(intentUrl.toString(), '_blank', 'noopener,noreferrer')
  }, [theme, getShareUrl])

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
            '&:hover': {
              backgroundColor: 'var(--color-primary)',
              filter: 'brightness(0.85)',
            },
          }}
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Xでシェア" arrow>
        <IconButton
          onClick={handleXShare}
          aria-label="Xでシェア"
          sx={{
            width: 44,
            height: 44,
            backgroundColor: '#000000',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#000000',
              filter: 'brightness(0.8)',
            },
          }}
        >
          <XIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Instagramへ投稿" arrow>
        <IconButton
          onClick={handleOpenInstagramDialog}
          aria-label="Instagramへ投稿"
          sx={{
            width: 44,
            height: 44,
            background:
              'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            color: '#ffffff',
            '&:hover': {
              background:
                'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              filter: 'brightness(0.85)',
            },
          }}
        >
          <InstagramIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {canWebShare && (
        <Tooltip title="その他" arrow>
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

      <Dialog
        open={instagramDialogOpen}
        onClose={handleCloseInstagramDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          Instagramへの投稿手順
          <IconButton
            onClick={handleCloseInstagramDialog}
            aria-label="閉じる"
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            1. 上の「ダウンロード」ボタンで画像を保存
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            2. Instagramアプリを開いて新規投稿
          </Typography>
          <Typography variant="body2">3. 保存した画像を選択して投稿</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInstagramDialog}>閉じる</Button>
        </DialogActions>
      </Dialog>

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
