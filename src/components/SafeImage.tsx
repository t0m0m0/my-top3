import { useCallback, useRef } from 'react'
import { DEFAULT_PLACEHOLDER } from '../constants/placeholders'

type SafeImageProps = React.ComponentPropsWithoutRef<'img'> & {
  fallbackSrc?: string
}

/**
 * `<img>` wrapper that swaps to a fallback on error.
 * Prevents infinite loops when the fallback itself fails.
 */
export function SafeImage({
  fallbackSrc = DEFAULT_PLACEHOLDER,
  onError,
  ...props
}: SafeImageProps) {
  const hasFailed = useRef(false)

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (!hasFailed.current) {
        hasFailed.current = true
        e.currentTarget.src = fallbackSrc
      }
      onError?.(e)
    },
    [fallbackSrc, onError],
  )

  return <img {...props} onError={handleError} />
}
