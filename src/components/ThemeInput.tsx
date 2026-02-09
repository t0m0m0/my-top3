import TextField from '@mui/material/TextField'
import { MAX_THEME_LENGTH } from '../hooks/useTheme'

type ThemeInputProps = {
  value: string
  onChange: (value: string) => void
}

function ThemeInput({ value, onChange }: ThemeInputProps) {
  const isOverLimit = value.length > MAX_THEME_LENGTH

  return (
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
  )
}

export default ThemeInput
