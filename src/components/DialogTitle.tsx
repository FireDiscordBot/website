import * as React from "react"
import MuiDialogTitle from "@mui/material/DialogTitle"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import Typography from "@mui/material/Typography"

export interface DialogTitleProps {
  children: React.ReactNode
  onClose?: () => void
}

const DialogTitle = ({ children, onClose, ...other }: DialogTitleProps) => {
  return (
    <MuiDialogTitle sx={{ margin: 0, padding: (theme) => theme.spacing(2) }} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          sx={(theme) => ({
            position: "absolute",
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
          })}
          onClick={onClose}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  )
}

export default DialogTitle
