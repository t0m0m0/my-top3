import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

type ErrorMessageProps = {
  message: string
  onRetry?: () => void
  retryLabel?: string
  children?: React.ReactNode
}

export default function ErrorMessage({
  message,
  onRetry,
  retryLabel = '再試行',
  children,
}: ErrorMessageProps) {
  return (
    <Box
      className="mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center"
      role="alert"
    >
      <Typography
        variant="body1"
        sx={{ color: 'error.main', fontWeight: 500 }}
      >
        {message}
      </Typography>
      <div className="mt-4 flex flex-col items-center gap-2">
        {onRetry && (
          <Button variant="outlined" color="error" size="small" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        {children}
      </div>
    </Box>
  )
}
