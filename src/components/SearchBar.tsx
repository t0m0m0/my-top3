import { useState } from 'react'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import ClearIcon from '@mui/icons-material/Clear'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'タイトルやキーワードで検索...',
}: SearchBarProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div className="mt-3">
      <TextField
        fullWidth
        variant="outlined"
        size="medium"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{
                    stroke: focused
                      ? 'var(--color-primary)'
                      : 'var(--color-text-secondary)',
                    transition: 'stroke 200ms ease',
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
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
            backgroundColor: 'var(--color-bg-translucent)',
            borderRadius: '16px',
            border: '3px solid var(--color-primary-a8)',
            boxShadow: 'inset 2px 2px 4px var(--color-primary-a4)',
            transition: 'box-shadow 200ms ease, border-color 200ms ease',
            '& fieldset': {
              border: 'none',
            },
            '&.Mui-focused': {
              borderColor: 'var(--color-primary-a25)',
              boxShadow:
                'inset 2px 2px 4px var(--color-primary-a6), 0 0 0 3px var(--color-primary-a10)',
            },
          },
        }}
      />
    </div>
  )
}
