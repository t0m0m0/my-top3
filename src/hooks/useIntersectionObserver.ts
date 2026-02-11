import { useRef, useCallback, useEffect } from 'react'

export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit,
): (node: HTMLDivElement | null) => void {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })

  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      if (!node) return

      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries
          if (entry.isIntersecting) {
            callbackRef.current()
          }
        },
        {
          root: null,
          rootMargin: '200px',
          threshold: 0,
          ...options,
        },
      )

      observer.observe(node)
      observerRef.current = observer
    },
    [options],
  )

  return sentinelCallbackRef
}
