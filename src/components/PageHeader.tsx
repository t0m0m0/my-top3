type Props = {
  title: string
  subtitle?: string
}

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <div className="text-center">
      <div
        className="mx-auto mb-2 h-0.5 w-16 rounded-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
        }}
      />
      <h1
        className="brand-gradient-text text-xl font-extrabold sm:text-2xl"
        style={{
          fontFamily: 'var(--font-display)',
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {subtitle}
        </p>
      )}
      <div
        className="mx-auto mt-2 h-0.5 w-16 rounded-full"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
        }}
      />
    </div>
  )
}
