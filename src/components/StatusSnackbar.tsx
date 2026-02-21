import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import type { AlertColor } from '@mui/material/Alert'

type StatusSnackbarProps = {
  open: boolean
  message: string
  severity: AlertColor
  onClose: () => void
  autoHideDuration?: number
}

export function StatusSnackbar({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 3000,
}: StatusSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity={severity} variant="filled" onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  )
}
