import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { useThemeHistory } from '../hooks/useThemeHistory'

type ThemeHistoryProps = {
  onSelect: (theme: string) => void
}

export default function ThemeHistory({ onSelect }: ThemeHistoryProps) {
  const { history, removeHistory, clearHistory } = useThemeHistory()

  if (history.length === 0) {
    return null
  }

  return (
    <Box
      className="mt-2 rounded-lg p-3"
      sx={{ backgroundColor: 'var(--color-surface)' }}
      aria-label="テーマ履歴"
    >
      <div className="mb-2 flex items-center justify-between">
        <Typography
          variant="subtitle2"
          sx={{ color: 'var(--color-text-primary)' }}
        >
          最近のテーマ
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={clearHistory}
          color="primary"
        >
          すべて削除
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {history.map((theme) => (
          <Chip
            key={theme}
            label={theme}
            variant="outlined"
            size="small"
            clickable
            onClick={() => onSelect(theme)}
            onDelete={() => removeHistory(theme)}
          />
        ))}
      </div>
    </Box>
  )
}
