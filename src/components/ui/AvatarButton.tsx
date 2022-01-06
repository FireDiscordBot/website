import * as React from "react"
import Avatar from "@mui/material/Avatar"
import IconButton, { IconButtonProps } from "@mui/material/IconButton"

import { AuthUser } from "@/interfaces/auth"

type Props = IconButtonProps<"button", { user: AuthUser }>

const AvatarButton = ({ user, ...otherProps }: Props) => {
  return (
    <IconButton {...otherProps} sx={{ padding: (theme) => theme.spacing(1) }} size="large">
      <Avatar
        src={user.image}
        sx={(theme) => ({
          boxShadow: theme.shadows[2],
          "&:hover": {
            boxShadow: theme.shadows[4],
            "@media (hover: none)": {
              boxShadow: theme.shadows[2],
            },
          },
          "&$focusVisible": {
            boxShadow: theme.shadows[6],
          },
          "&:active": {
            boxShadow: theme.shadows[8],
          },
          "&$disabled": {
            boxShadow: theme.shadows[0],
          },
        })}
      />
    </IconButton>
  )
}

export default AvatarButton
