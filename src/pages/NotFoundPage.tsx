import { Link } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

export default function NotFoundPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg, var(--color-bg) 0%, #f5f0ea 100%)',
      }}
    >
      <div className="mx-auto max-w-4xl px-3 py-4 text-center sm:px-4 sm:py-6 lg:py-8">
        <Box className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <Typography
            variant="h3"
            sx={{ color: 'error.main', fontWeight: 700, mb: 1 }}
          >
            404
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: 'error.main', fontWeight: 500, mb: 1 }}
          >
            ページが見つかりません
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            お探しのページは存在しないか、移動した可能性があります。
          </Typography>
          <div className="flex flex-col items-center gap-2">
            <Button component={Link} to="/" variant="outlined" size="small">
              作品を選ぶ ✨
            </Button>
            <Button
              component={Link}
              to="/gallery"
              variant="outlined"
              size="small"
            >
              ギャラリーを見る 🖼️
            </Button>
          </div>
        </Box>
      </div>
    </div>
  )
}
