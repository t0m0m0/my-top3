import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import type { SearchResultItem, MediaCategory } from '../types/common'
import { useSelection } from '../hooks/useSelection'

const NO_IMAGE_PLACEHOLDERS: Record<MediaCategory, string> = {
  book: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Crect fill='%23fef3c7' width='120' height='160'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' fill='%23d97706' font-family='sans-serif' font-size='32'%3E📖%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%23b45309' font-family='sans-serif' font-size='11'%3ENo Image%3C/text%3E%3C/svg%3E",
  music:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Crect fill='%23dbeafe' width='120' height='160'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' fill='%232563eb' font-family='sans-serif' font-size='32'%3E🎵%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%231d4ed8' font-family='sans-serif' font-size='11'%3ENo Image%3C/text%3E%3C/svg%3E",
  movie:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Crect fill='%23ede9fe' width='120' height='160'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' fill='%237c3aed' font-family='sans-serif' font-size='32'%3E🎬%3C/text%3E%3Ctext x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%236d28d9' font-family='sans-serif' font-size='11'%3ENo Image%3C/text%3E%3C/svg%3E",
}

const THUMBNAIL_DIMENSIONS: Record<
  MediaCategory,
  { width: number; aspectRatio: string }
> = {
  book: { width: 80, aspectRatio: '2 / 3' },
  music: { width: 100, aspectRatio: '1 / 1' },
  movie: { width: 80, aspectRatio: '2 / 3' },
}

type ResultCardProps = {
  item: SearchResultItem
  onSelect: (item: SearchResultItem) => void
}

export default function ResultCard({ item, onSelect }: ResultCardProps) {
  const { selection } = useSelection()
  const isSelected = selection[item.category]?.id === item.id
  const placeholder = NO_IMAGE_PLACEHOLDERS[item.category]
  const dimensions = THUMBNAIL_DIMENSIONS[item.category]

  const handleCardClick = () => {
    if (!isSelected) {
      onSelect(item)
    }
  }

  return (
    <Card
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      sx={{
        display: 'flex',
        transition: 'all 0.2s ease',
        cursor: isSelected ? 'default' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
        ...(isSelected && {
          border: (theme) => `2px solid ${theme.palette.primary.main}`,
          opacity: 0.85,
        }),
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
        },
        ...(!isSelected && {
          '&:hover': {
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: 8,
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        }),
      }}
    >
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <CardMedia
          component="img"
          sx={{
            width: dimensions.width,
            aspectRatio: dimensions.aspectRatio,
            objectFit: 'cover',
          }}
          image={item.thumbnailUrl || placeholder}
          alt={item.title}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = placeholder
          }}
        />
        {isSelected && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.4)',
            }}
          >
            <CheckCircleIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
        }}
      >
        <CardContent sx={{ flex: 1, py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Typography
            variant="subtitle1"
            component="h3"
            sx={{
              fontWeight: 600,
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {item.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.subtitle}
          </Typography>
          {isSelected ? (
            <Button
              variant="contained"
              size="small"
              color="success"
              disableElevation
              startIcon={<CheckCircleIcon />}
              sx={{
                mt: 1,
                fontSize: '0.8rem',
                minHeight: 36,
                pointerEvents: 'none',
              }}
            >
              選択済み
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              color="primary"
              disableElevation
              startIcon={<AddCircleOutlineIcon />}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(item)
              }}
              sx={{ mt: 1, fontSize: '0.8rem', minHeight: 36 }}
            >
              #1に選ぶ
            </Button>
          )}
        </CardContent>
      </Box>
    </Card>
  )
}
