import type { MediaCategory } from '../types/common'

const TABS: {
  label: string
  value: MediaCategory
  icon: string
  bgClass: string
}[] = [
  {
    label: '本',
    value: 'book',
    icon: '📚',
    bgClass: 'bg-amber-50 border-amber-200 text-amber-800',
  },
  {
    label: '音楽',
    value: 'music',
    icon: '🎵',
    bgClass: 'bg-violet-50 border-violet-200 text-violet-800',
  },
  {
    label: '映画',
    value: 'movie',
    icon: '🎬',
    bgClass: 'bg-blue-50 border-blue-200 text-blue-800',
  },
]

type TabSwitcherProps = {
  value: MediaCategory
  onChange: (category: MediaCategory) => void
}

export default function TabSwitcher({ value, onChange }: TabSwitcherProps) {
  return (
    <div className="flex gap-2" role="tablist" aria-label="カテゴリ選択">
      {TABS.map((tab) => {
        const isActive = value === tab.value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? `${tab.bgClass} shadow-sm scale-[1.02]`
                : 'border-transparent bg-transparent opacity-60 hover:opacity-100'
            }`}
            style={{
              color: isActive ? undefined : 'var(--color-text-secondary)',
            }}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
