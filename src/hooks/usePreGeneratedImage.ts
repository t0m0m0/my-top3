import { useState, useEffect } from 'react'
import { generateImageBlob } from '../utils/image-helpers'

/**
 * Pre-generates an image blob from the given DOM element.
 * Returns the cached Blob when ready, or null while generating / on error.
 *
 * This allows navigator.share({ files }) to be called synchronously
 * within a user gesture without waiting for html2canvas.
 */
export function usePreGeneratedImage(
  element: HTMLDivElement | null | undefined,
): Blob | null {
  const [blob, setBlob] = useState<Blob | null>(null)

  useEffect(() => {
    if (!element) {
      // Use setTimeout to avoid synchronous setState in effect body
      const t = setTimeout(() => setBlob(null), 0)
      return () => clearTimeout(t)
    }

    let cancelled = false

    // Small delay to ensure the element is fully rendered
    const timer = setTimeout(() => {
      generateImageBlob(element)
        .then((b) => {
          if (!cancelled) setBlob(b)
        })
        .catch((err) => {
          if (!cancelled) {
            console.warn('[usePreGeneratedImage] failed:', err)
            setBlob(null)
          }
        })
    }, 500)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [element])

  return blob
}
