import TextField from '@mui/material/TextField'
import Chip from '@mui/material/Chip'
import { MAX_THEME_LENGTH } from '../hooks/useTheme'

const THEME_SUGGESTIONS = [
  '夏に読みたい',
  '青春',
  `${new Date().getFullYear()}年ベスト`,
]

type ThemeInputProps = {
  value: string
  onChange: (value: string) => void
}

function ThemeInput({ value, onChange }: ThemeInputProps) {
  const isOverLimit = value.length > MAX_THEME_LENGTH
  const showSuggestions = value.length === 0

  return (
    <div>
      <TextField
        fullWidth
        label="テーマ"
        placeholder="例: 雨の日に楽しむ3作品"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        helperText={
          isOverLimit
            ? `テーマは${MAX_THEME_LENGTH}文字以内で入力してください (${value.length} / ${MAX_THEME_LENGTH})`
            : `${value.length} / ${MAX_THEME_LENGTH}`
        }
        error={isOverLimit}
        variant="outlined"
        size="small"
        slotProps={{
          htmlInput: {
            maxLength: MAX_THEME_LENGTH + 10,
          },
        }}
      />
      {showSuggestions && (
        <>
          <p
            className="mt-2 text-xs"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            テーマは後からでもOK！まず好きな作品を検索しよう
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {THEME_SUGGESTIONS.map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                variant="outlined"
                size="small"
                clickable
                onClick={() => onChange(suggestion)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ThemeInput
