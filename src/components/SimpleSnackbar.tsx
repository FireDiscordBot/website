import Snackbar, { SnackbarOrigin, SnackbarCloseReason } from "@material-ui/core/Snackbar"
import Alert, { Color } from "@material-ui/lab/Alert"
import * as React from "react"

type Props = {
  message: string | undefined | null
  autoHideDuration?: number
  severity?: Color
  horizontal?: SnackbarOrigin["horizontal"]
  vertical?: SnackbarOrigin["vertical"]
  onClose?: () => void
}

const SimpleSnackbar = ({ message, severity, autoHideDuration, horizontal, vertical, onClose }: Props) => {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    setOpen(!!message)
  }, [message])

  const handleClose = (_: React.SyntheticEvent, reason?: SnackbarCloseReason) => {
    if (reason != "clickaway") {
      setOpen(false)
      onClose && onClose()
    }
  }

  return (
    <Snackbar
      onClose={handleClose}
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
