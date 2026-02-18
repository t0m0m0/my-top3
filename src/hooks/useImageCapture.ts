import { useRef, useState, useCallback, useEffect } from 'react'
import {
  generateImageBlob,
  sanitizeFilename,
  getImageErrorMessage,
  formatDate,
} from '../utils/image-helpers'

const IMAGE_SIZE = 1080

export function useImageCapture(theme: string) {
  const captureRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)
  const [scale, setScale] = useState(0.5)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScale = () => {
      const containerWidth = container.clientWidth
      const newScale =
        Math.round(Math.min(containerWidth / IMAGE_SIZE, 0.5) * 1000) / 1000
      setScale(newScale)
    }

    updateScale()

    const observer = new ResizeObserver(updateScale)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const handleDownload = useCallback(async () => {
    if (!captureRef.current) return

    setIsGenerating(true)
    setError(null)
    try {
      const blob = await generateImageBlob(captureRef.current)
      const dataUrl = URL.createObjectURL(blob)

      const date = formatDate()
      const safeTheme = theme ? `-${sanitizeFilename(theme)}` : ''
      const link = document.createElement('a')
      link.download = `my-no1s-${date}${safeTheme}.png`
      link.href = dataUrl
      link.click()
      URL.revokeObjectURL(dataUrl)
      setSuccessOpen(true)
    } catch (err) {
      console.error('[Top3Image] Failed to generate image:', err)
      setError(getImageErrorMessage(err))
    } finally {
      setIsGenerating(false)
    }
  }, [theme])

  return {
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
  }
}
