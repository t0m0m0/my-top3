/** Compact progress dots indicator */
export function ProgressDots({ selectedCount }: { selectedCount: number }) {
  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-2.5 w-2.5 rounded-full transition-all"
          style={{
            backgroundColor:
              i < selectedCount
                ? 'var(--color-primary)'
                : 'var(--color-border)',
          }}
        />
      ))}
    </span>
  )
}
