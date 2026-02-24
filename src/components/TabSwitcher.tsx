import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined'
import MusicNoteOutlined from '@mui/icons-material/MusicNoteOutlined'
import MovieOutlined from '@mui/icons-material/MovieOutlined'
import type { MediaCategory } from '../types/common'
import type { ReactElement } from 'react'

const TABS: { label: string; value: MediaCategory; icon: ReactElement }[] = [
  {
    label: '📚 本',
    value: 'book',
    icon: <MenuBookOutlined fontSize="small" />,
  },
  {
    label: '🎵 音楽',
    value: 'music',
    icon: <MusicNoteOutlined fontSize="small" />,
  },
  {
    label: '🎬 映画',
    value: 'movie',
    icon: <MovieOutlined fontSize="small" />,
  },
]

type TabSwitcherProps = {
  value: MediaCategory
  onChange: (category: MediaCategory) => void
}

export default function TabSwitcher({ value, onChange }: TabSwitcherProps) {
  return (
    <div className="mt-0">
      <Tabs
        value={value}
        onChange={(_, newValue: MediaCategory) => onChange(newValue)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        sx={{
          '& .MuiTabs-indicator': {
            height: '100%',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-primary)',
            opacity: 0.15,
            zIndex: 0,
          },
          '& .MuiTab-root': {
            zIndex: 1,
            minHeight: 44,
            borderRadius: '9999px',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            transition: 'color 0.2s ease',
            '&.Mui-selected': {
              color: 'var(--color-primary)',
              fontWeight: 600,
            },
          },
          minHeight: 44,
          backgroundColor: 'var(--color-surface)',
          borderRadius: '9999px',
          padding: '4px',
        }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            icon={tab.icon}
            iconPosition="start"
          />
        ))}
      </Tabs>
    </div>
  )
}
