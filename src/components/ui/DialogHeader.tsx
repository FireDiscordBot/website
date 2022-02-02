import CloseIcon from "@mui/icons-material/Close"
import Box from "@mui/material/Box"
import DialogTitle from "@mui/material/DialogTitle"
import IconButton from "@mui/material/IconButton"
import Stack from "@mui/material/Stack"
import { ReactNode } from "react"

export interface DialogHeaderProps {
  title: string
  children?: ReactNode
  onClose?: () => void
}

function DialogHeader({ title, children, onClose, ...other }: DialogHeaderProps) {
  return (
    <Box sx={{ display: "flex" }}>
      <DialogTitle sx={{ flexGrow: 1 }} {...other}>
        {title}
      </DialogTitle>
      {(children || onClose) && (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ padding: (theme) => theme.spacing(1) }}>
          {children}
          {onClose ? (
            <IconButton
              aria-label="close"
              sx={(theme) => ({
                color: theme.palette.grey[500],
              })}
              onClick={onClose}
              size="large"
            >
              <CloseIcon />
            </IconButton>
          ) : null}
        </Stack>
      )}
    </Box>
  )
}

export default DialogHeader
