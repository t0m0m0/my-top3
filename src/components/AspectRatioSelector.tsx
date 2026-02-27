import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import CropLandscapeIcon from '@mui/icons-material/CropLandscape'
import CropPortraitIcon from '@mui/icons-material/CropPortrait'
import type { AspectRatio } from '../constants/image-layout'

type AspectRatioSelectorProps = {
  value: AspectRatio
  onChange: (value: AspectRatio) => void
}

export function AspectRatioSelector({
  value,
  onChange,
}: AspectRatioSelectorProps) {
  return (
    <div
      data-testid="aspect-ratio-selector"
      className="mb-4 flex items-center justify-center gap-2"
    >
      <span
        className="text-xs font-medium"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        画像サイズ:
      </span>
      <ToggleButtonGroup
        value={value}
        exclusive
        size="small"
        onChange={(_, newValue: AspectRatio | null) => {
          if (newValue !== null) {
            onChange(newValue)
          }
        }}
        sx={{
          '& .MuiToggleButton-root': {
            border: '1px solid var(--color-border)',
            borderRadius: '9999px',
            px: 1.5,
            py: 0.25,
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.03em',
            textTransform: 'none',
            color: 'var(--color-text-secondary)',
            transition: 'all 0.2s ease',
            '&:hover': {
              background:
                'color-mix(in srgb, var(--color-primary) 6%, transparent)',
            },
            '&.Mui-selected': {
              color: 'var(--color-surface)',
              backgroundColor: 'var(--color-primary-dark)',
              borderColor: 'transparent',
              '&:hover': {
                backgroundColor: 'var(--color-primary-dark)',
                filter: 'brightness(1.1)',
              },
            },
          },
          '& .MuiToggleButtonGroup-grouped': {
            borderRadius: '9999px !important',
            mx: 0.25,
            border: '1px solid var(--color-border) !important',
            '&.Mui-selected': {
              border: '1px solid transparent !important',
            },
          },
        }}
      >
        <ToggleButton value="landscape" aria-label="横長 (1:1)">
          <CropLandscapeIcon sx={{ fontSize: 16, mr: 0.5 }} />
          横長 1:1
        </ToggleButton>
        <ToggleButton value="portrait" aria-label="縦長 (9:16)">
          <CropPortraitIcon sx={{ fontSize: 16, mr: 0.5 }} />
          縦長 9:16
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  )
}
