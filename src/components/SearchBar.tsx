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
            backgroundColor: 'rgba(253,242,248,0.6)',
            borderRadius: '16px',
            border: '3px solid rgba(236,72,153,0.08)',
            boxShadow: 'inset 2px 2px 4px rgba(236,72,153,0.04)',
            transition: 'box-shadow 200ms ease, border-color 200ms ease',
            '& fieldset': {
              border: 'none',
            },
            '&.Mui-focused': {
              borderColor: 'rgba(236,72,153,0.25)',
              boxShadow:
                'inset 2px 2px 4px rgba(236,72,153,0.06), 0 0 0 3px rgba(236,72,153,0.1)',
            },
          },
        }}
      />
    </div>
  )
}
