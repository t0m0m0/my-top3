import { useState } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = '作品名やアーティスト名で検索',
}: SearchBarProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="mt-4">
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    color: focused ? 'var(--color-primary)' : 'action.active',
                    transition: 'color 0.2s ease',
                  }}
                />
              </InputAdornment>
            ),
            endAdornment: value ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="検索をクリア"
                  onClick={() => onChange('')}
                  edge="end"
                  size="small"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'var(--color-surface)',
            borderRadius: '12px',
            transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
            '&.Mui-focused': {
              boxShadow:
                '0 0 0 3px color-mix(in srgb, var(--color-primary) 20%, transparent)',
            },
          },
        }}
      />
    </div>
  )
}
