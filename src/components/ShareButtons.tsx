import { useState, useCallback } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import XIcon from '@mui/icons-material/X'
import ShareIcon from '@mui/icons-material/Share'

type ShareButtonsProps = {
  theme?: string
}

function buildShareText(theme?: string): string {
  const base = theme ? `My No.1s 「${theme}」` : 'My No.1s'
  return `${base} #MyNo1s`
}

export default function ShareButtons({ theme }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const [shareFailed, setShareFailed] = useState(false)

  const handleCloseSuccess = useCallback(() => setCopied(false), [])
  const handleCloseError = useCallback(() => setCopyFailed(false), [])
  const handleCloseShareError = useCallback(() => setShareFailed(false), [])

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

  const handleShareX = useCallback(() => {
    const url = window.location.href
    const text = buildShareText(theme)
    const intentUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    const newWindow = window.open(intentUrl, '_blank', 'noopener,noreferrer')
    if (!newWindow) {
      window.location.href = intentUrl
    }
  }, [theme])

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
          sx={{
            width: 44,
            height: 44,
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            '&:hover': { backgroundColor: '#333333' },
          }}
        >
          <XIcon fontSize="small" />
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
    </div>
  )
}
