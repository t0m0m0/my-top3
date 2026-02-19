import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'

/**
 * Skeleton placeholder matching the ResultCard layout.
 * Used while search results are loading.
 */
export default function SkeletonCard() {
  return (
    <Card
      className="flex border-l-4"
      sx={{
        borderLeftColor: 'action.disabled',
      }}
    >
      {/* Thumbnail placeholder */}
      <Skeleton
        variant="rectangular"
        sx={{
          width: 100,
          minHeight: 120,
          flexShrink: 0,
        }}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <CardContent sx={{ flex: 1, py: 1.5, '&:last-child': { pb: 1.5 } }}>
          {/* Title */}
          <Skeleton variant="text" width="80%" height={24} />
          {/* Subtitle */}
          <Skeleton variant="text" width="60%" height={20} sx={{ mt: 0.5 }} />
          {/* Button */}
          <Skeleton variant="rounded" width={100} height={30} sx={{ mt: 1 }} />
        </CardContent>
      </div>
    </Card>
  )
}
