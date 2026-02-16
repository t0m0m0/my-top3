import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'

/**
 * Skeleton placeholder matching the ResultCard layout.
 * Used while search results are loading.
 */
export default function SkeletonCard() {
  return (
    <Card
      sx={{
        display: 'flex',
      }}
    >
      {/* Thumbnail placeholder */}
      <Skeleton
        variant="rectangular"
        sx={{
          width: 80,
          minHeight: 100,
          flexShrink: 0,
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
          {/* Title */}
          <Skeleton variant="text" width="80%" height={24} />
          {/* Subtitle */}
          <Skeleton variant="text" width="60%" height={20} sx={{ mt: 0.5 }} />
          {/* Button */}
          <Skeleton
            variant="rounded"
            width={80}
            height={30}
            sx={{ mt: 1 }}
          />
        </CardContent>
      </Box>
    </Card>
  )
}
