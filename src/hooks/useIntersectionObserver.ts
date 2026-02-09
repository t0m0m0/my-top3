import { useRef, useEffect, useCallback } from 'react'

export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit,
): React.RefObject<HTMLDivElement | null> {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        callbackRef.current()
      }
    },
    [],
  )

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: '200px',
      threshold: 0,
      ...options,
    })

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [handleIntersect, options])

  return sentinelRef
}
