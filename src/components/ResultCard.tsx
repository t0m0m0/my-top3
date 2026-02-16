import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import type { SearchResultItem } from '../types/common'

const NO_IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Crect fill='%23e5e7eb' width='120' height='160'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E"

type ResultCardProps = {
  item: SearchResultItem
  onSelect: (item: SearchResultItem) => void
}

export default function ResultCard({ item, onSelect }: ResultCardProps) {
  return (
    <Card
      sx={{
        display: 'flex',
      }}
    >
      <CardMedia
        component="img"
        sx={{
          width: 80,
          minHeight: 100,
          objectFit: 'cover',
          flexShrink: 0,
        }}
        image={item.thumbnailUrl || NO_IMAGE_PLACEHOLDER}
        alt={item.title}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = NO_IMAGE_PLACEHOLDER
        }}
      />
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
          <Button
            variant="outlined"
            size="small"
            color="primary"
            onClick={() => onSelect(item)}
            sx={{
              mt: 1,
              fontSize: '0.8rem',
            }}
          >
            #1に選ぶ
          </Button>
        </CardContent>
      </Box>
    </Card>
  )
}
