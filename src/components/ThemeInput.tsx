import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import { MAX_THEME_LENGTH } from '../hooks/useTheme'

const THEME_SUGGESTIONS = ['推し', '泣ける作品', '人生変わった']

type ThemeInputProps = {
  value: string
  onChange: (value: string) => void
}

function ThemeInput({ value, onChange }: ThemeInputProps) {
  const isOverLimit = value.length > MAX_THEME_LENGTH
  const showSuggestions = value.length === 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_THEME_LENGTH))}
        placeholder="お題を入力（任意）"
        error={isOverLimit}
        variant="outlined"
        size="small"
        slotProps={{
          htmlInput: {
            maxLength: MAX_THEME_LENGTH,
            'aria-label': 'お題',
          },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          minWidth: 160,
          flex: '0 1 200px',
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'var(--color-surface)',
            borderRadius: '9999px',
            fontSize: '0.875rem',
          },
        }}
      />
      {showSuggestions && (
        <div className="flex flex-wrap gap-1.5">
          {THEME_SUGGESTIONS.map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              variant="outlined"
              size="small"
              clickable
              onClick={() => onChange(suggestion)}
              sx={{
                borderRadius: '9999px',
                borderColor: 'var(--color-primary-a20)',
                color: 'var(--color-primary)',
                fontSize: '0.75rem',
                '&:hover': {
                  backgroundColor: 'var(--color-primary-a8)',
                },
              }}
            />
          ))}
        </div>
      )}
      {value.length > 0 && (
        <span
          className={`text-xs ${isOverLimit ? 'text-red-500' : ''}`}
          style={{
            color: isOverLimit ? undefined : 'var(--color-text-secondary)',
          }}
        >
          {isOverLimit
            ? `${MAX_THEME_LENGTH}文字以内 (${value.length}/${MAX_THEME_LENGTH})`
            : `${value.length} / ${MAX_THEME_LENGTH}`}
        </span>
      )}
    </div>
  )
}

export default ThemeInput
