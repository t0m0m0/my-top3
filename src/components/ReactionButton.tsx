type Props = {
  count: number
  reacted: boolean
  onToggle: () => void
}

export default function ReactionButton({ count, reacted, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="いいね"
      className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
      style={{
        color: reacted ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        border: reacted
          ? '1px solid color-mix(in srgb, var(--color-primary) 40%, transparent)'
          : '1px solid color-mix(in srgb, var(--color-text-secondary) 25%, transparent)',
        backgroundColor: reacted
          ? 'color-mix(in srgb, var(--color-primary) 8%, white)'
          : 'color-mix(in srgb, var(--color-bg) 60%, transparent)',
      }}
    >
      <span
        className="transition-transform duration-150"
        style={{ transform: reacted ? 'scale(1.2)' : 'scale(1)' }}
      >
        {reacted ? '❤️' : '💜'}
      </span>
      <span>{count}</span>
    </button>
  )
}
