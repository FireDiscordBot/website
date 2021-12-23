import Snackbar, { SnackbarOrigin, SnackbarCloseReason } from "@mui/material/Snackbar"
import Alert, { AlertColor } from "@mui/material/Alert"
import * as React from "react"

type Props = {
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
}: Props) => {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setOpen(message != null)
  }, [message])

  const handleCloseSnackbar = (_: any, reason: SnackbarCloseReason) => {
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
