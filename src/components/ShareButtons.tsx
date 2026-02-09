import { useState, useCallback } from 'react'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import XIcon from '@mui/icons-material/X'

type ShareButtonsProps = {
  theme?: string
}

function ShareButtons({ theme }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = window.location.href
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
    }
  }, [])

  const handleShareX = useCallback(() => {
    const url = window.location.href
    const text = theme ? `My Top 3 \u300C${theme}\u300D` : 'My Top 3'
    const intentUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    window.open(intentUrl, '_blank', 'noopener,noreferrer')
  }, [theme])

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        variant="outlined"
        startIcon={<ContentCopyIcon />}
        onClick={handleCopyUrl}
        size="medium"
      >
        URLをコピー
      </Button>
      <Button
        variant="outlined"
        startIcon={<XIcon />}
        onClick={handleShareX}
        size="medium"
      >
        Xでシェア
      </Button>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setCopied(false)}
        >
          URLをコピーしました
        </Alert>
      </Snackbar>
    </div>
  )
}

export default ShareButtons
