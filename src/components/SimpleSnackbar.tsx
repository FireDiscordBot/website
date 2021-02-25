import Snackbar, { SnackbarOrigin, SnackbarCloseReason } from "@material-ui/core/Snackbar"
import Alert, { Color } from "@material-ui/lab/Alert"
import * as React from "react"

type Props = {
  message: string | undefined | null
  autoHideDuration?: number
  severity?: Color
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

  const handleClose = (_: React.SyntheticEvent, reason?: SnackbarCloseReason) => {
    if (reason != "clickaway") setOpen(false)
  }

  return (
    <Snackbar
      onClose={handleClose}
      onExited={onFinishCloseAnimation}
      open={open}
      autoHideDuration={autoHideDuration}
      message={!severity ? message : undefined}
      anchorOrigin={{
        horizontal: horizontal ?? "center",
        vertical: vertical ?? "bottom",
      }}
    >
      {severity && (
        <Alert onClose={handleClose} severity={severity} elevation={6} variant="filled">
          {message}
        </Alert>
      )}
    </Snackbar>
  )
}

export default SimpleSnackbar
