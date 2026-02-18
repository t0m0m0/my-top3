import { useState, useEffect, type RefObject } from 'react'
import { generateImageBlob } from '../utils/image-helpers'

/**
 * Pre-generates an image blob from the given captureRef element.
 * Returns the cached Blob when ready, or null while generating / on error.
 *
 * This allows navigator.share({ files }) to be called synchronously
 * within a user gesture without waiting for html2canvas.
 */
export function usePreGeneratedImage(
  captureRef: RefObject<HTMLDivElement | null> | undefined,
): Blob | null {
  const [blob, setBlob] = useState<Blob | null>(null)

  useEffect(() => {
    const element = captureRef?.current
    if (!element) {
      setBlob(null)
      return
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
  }, [captureRef?.current]) // eslint-disable-line react-hooks/exhaustive-deps

  return blob
}
