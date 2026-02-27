import { useState, useRef, useCallback, type ReactNode } from 'react'

type Props = {
  children: ReactNode[]
}

/**
 * Mobile-only horizontal carousel with swipe + dot indicators.
 * Renders children in a scrollable track, snapping one card at a time.
 */
export default function MobileCarousel({ children }: Props) {
  const [current, setCurrent] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const count = children.length

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(count - 1, index))
      setCurrent(clamped)
    },
    [count],
  )

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = touchStartX.current - e.changedTouches[0].clientX
      const dy = touchStartY.current - e.changedTouches[0].clientY
      // Only swipe horizontally if dx > dy (prevent hijacking vertical scroll)
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        goTo(current + (dx > 0 ? 1 : -1))
      }
    },
    [current, goTo],
  )

  return (
    <div className="mobile-carousel">
      <div
        className="mobile-carousel-track"
        ref={trackRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {children.map((child, i) => (
          <div className="mobile-carousel-slide" key={i}>
            {child}
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="mobile-carousel-dots">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            className={`mobile-carousel-dot${i === current ? ' active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`${i + 1}枚目を表示`}
          />
        ))}
      </div>
    </div>
  )
}
