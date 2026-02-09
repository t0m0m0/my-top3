import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import type { MediaCategory } from '../types/common'

const TABS: { label: string; value: MediaCategory }[] = [
  { label: 'Book', value: 'book' },
  { label: 'Music', value: 'music' },
  { label: 'Movie', value: 'movie' },
]

type TabSwitcherProps = {
  value: MediaCategory
  onChange: (category: MediaCategory) => void
}

export default function TabSwitcher({ value, onChange }: TabSwitcherProps) {
  return (
    <div className="mt-6">
      <Tabs
        value={value}
        onChange={(_, newValue: MediaCategory) => onChange(newValue)}
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
    </div>
  )
}
