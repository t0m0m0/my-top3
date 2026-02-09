import { useRef, useEffect, useCallback } from 'react'

export function useIntersectionObserver(
  callback: () => void,
  enabled: boolean,
): React.RefCallback<HTMLElement> {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect()

      if (!node || !enabled) return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            callback()
          }
        },
        { threshold: 0.1 },
      )

      observerRef.current.observe(node)
    },
    [callback, enabled],
  )

  return setRef
}
