import { useState, useCallback } from 'react'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import XIcon from '@mui/icons-material/X'
import ShareIcon from '@mui/icons-material/Share'

type ShareButtonsProps = {
  theme?: string
}

function buildShareText(theme?: string): string {
  const base = theme ? `My Top 3 「${theme}」` : 'My Top 3'
  return `${base} #MyTop3`
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
        title: 'My Top 3',
        text: buildShareText(theme),
        url: window.location.href,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }
      setShareFailed(true)
    }
  }, [theme])

  const canWebShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        variant="outlined"
        startIcon={<ContentCopyIcon />}
        onClick={handleCopyUrl}
      >
        URLをコピー
      </Button>
      <Button variant="outlined" startIcon={<XIcon />} onClick={handleShareX}>
        Xでシェア
      </Button>
      {canWebShare && (
        <Button
          variant="outlined"
          startIcon={<ShareIcon />}
          onClick={handleWebShare}
        >
          シェア
        </Button>
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
          シェアに失敗しました
        </Alert>
      </Snackbar>
    </div>
  )
}
