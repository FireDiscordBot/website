import Alert, { AlertColor } from "@mui/material/Alert"
import Snackbar, { SnackbarCloseReason, SnackbarOrigin } from "@mui/material/Snackbar"
import { useEffect, useState } from "react"

interface SimpleSnackbarProps {
  message: string | undefined | null
  autoHideDuration?: number
  severity?: AlertColor
  horizontal?: SnackbarOrigin["horizontal"]
  vertical?: SnackbarOrigin["vertical"]
  onFinishCloseAnimation?: () => void
}

const SimpleSnackbar = ({
  message,
  severity,
  autoHideDuration,
  horizontal,
  vertical,
  onFinishCloseAnimation,
}: SimpleSnackbarProps) => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(message != null)
  }, [message])

  const handleCloseSnackbar = (_: unknown, reason: SnackbarCloseReason) => {
    if (reason != "clickaway") setOpen(false)
  }

  const handleCloseAlert = () => setOpen(false)

  return (
    <Snackbar
      onClose={handleCloseSnackbar}
      TransitionProps={{
        onExited: onFinishCloseAnimation,
      }}
      open={open}
      autoHideDuration={autoHideDuration}
      message={!severity ? message : undefined}
      anchorOrigin={{
        horizontal: horizontal ?? "center",
        vertical: vertical ?? "bottom",
      }}
    >
      {severity && (
        <Alert onClose={handleCloseAlert} severity={severity} elevation={6} variant="filled">
          {message}
        </Alert>
      )}
    </Snackbar>
  )
}

export default SimpleSnackbar
