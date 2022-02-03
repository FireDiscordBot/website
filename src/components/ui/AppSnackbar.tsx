import Alert, { AlertColor } from "@mui/material/Alert"
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar"
import { useEffect, useState } from "react"

import useAppSnackbar from "@/hooks/use-snackbar-control"

export interface AppSnackbarProps {
  message: string
  duration?: number
  severity?: AlertColor
  onClose?: () => void
}

const AppSnackbar = () => {
  const { currentSnackbar } = useAppSnackbar()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(!!currentSnackbar)
  }, [currentSnackbar])

  const handleCloseSnackbar = (_: unknown, reason: SnackbarCloseReason) => {
    if (reason !== "clickaway") setOpen(false)
  }

  const handleCloseAlert = () => setOpen(false)

  return (
    <Snackbar
      onClose={handleCloseSnackbar}
      TransitionProps={{
        onExited: currentSnackbar?.onClose,
      }}
      open={open}
      autoHideDuration={currentSnackbar?.duration}
      message={!currentSnackbar?.severity ? currentSnackbar?.message : undefined}
      anchorOrigin={{
        horizontal: "right",
        vertical: "top",
      }}
    >
      {currentSnackbar?.severity && (
        <Alert onClose={handleCloseAlert} severity={currentSnackbar.severity} elevation={6} variant="filled">
          {currentSnackbar.message}
        </Alert>
      )}
    </Snackbar>
  )
}

export default AppSnackbar
